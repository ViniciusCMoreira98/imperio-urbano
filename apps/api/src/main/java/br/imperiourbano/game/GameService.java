package br.imperiourbano.game;

import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.engine.RuleViolationException;
import br.imperiourbano.engine.TurnPhase;
import br.imperiourbano.persistence.ConcurrentGameUpdateException;
import br.imperiourbano.persistence.DuplicateCommandException;
import br.imperiourbano.persistence.GameStore;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Executa comandos de partida: idempotência por commandId, conferência de versão, regras pelo motor
 * e gravação. Um lock por partida serializa os comandos nesta instância (ADR A6); a versão no banco
 * protege contra escritas concorrentes de outra instância.
 *
 * <p>Fluxo automático: quando não resta decisão no turno (fase AWAITING_END_TURN), a vez passa sozinha;
 * quando o prazo do turno acaba (ou logo, se o jogador da vez está desconectado), {@link #timeout}
 * executa a ação padrão no lugar dele.
 */
@Service
public class GameService {

    public sealed interface Outcome {
        GameState state();
    }

    public record Applied(List<GameEvent> events, GameState state) implements Outcome {
    }

    /** Comando já processado antes (reenvio): nada é reaplicado. */
    public record AlreadyProcessed(GameState state) implements Outcome {
    }

    public record Rejected(String reason, GameState state) implements Outcome {
    }

    private final GameEngine engine;
    private final GameStore store;
    private final Dice dice;
    private final TurnTimeouts timeouts;
    private final ApplicationEventPublisher publisher;
    private final Map<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    GameService(GameEngine engine, GameStore store, Dice dice, TurnTimeouts timeouts,
            ApplicationEventPublisher publisher) {
        this.engine = engine;
        this.store = store;
        this.dice = dice;
        this.timeouts = timeouts;
        this.publisher = publisher;
    }

    public Optional<GameState> current(String gameId) {
        return store.loadSnapshot(gameId);
    }

    /**
     * Reenvia o estado atual a quem acompanha a partida (ex.: um jogador conectou). Um turno parado
     * sem decisão pendente (gravado antes da passagem automática) é passado agora.
     */
    public void announce(String gameId) {
        withLock(gameId, () -> {
            store.loadSnapshot(gameId).ifPresent(state -> {
                List<GameEvent> events = new ArrayList<>();
                GameState current = passTurnIfIdle(gameId, state, events);
                publisher.publishEvent(new GameUpdated(gameId, events, current));
            });
            return null;
        });
    }

    public Outcome execute(String gameId, String playerId, CommandEnvelope envelope) {
        return withLock(gameId, () -> {
            GameState state = store.loadSnapshot(gameId)
                    .orElseThrow(() -> new IllegalStateException("Partida sem snapshot: " + gameId));
            if (envelope.commandId() == null || envelope.commandId().isBlank() || envelope.command() == null) {
                return new Rejected("Comando inválido.", state);
            }
            if (store.processedVersion(envelope.commandId()).isPresent()) {
                return new AlreadyProcessed(state);
            }
            if (envelope.expectedVersion() != state.version()) {
                return new Rejected("A partida mudou; tente de novo com o estado atualizado.", state);
            }
            try {
                return apply(gameId, state, playerId, envelope.command(), envelope.commandId());
            } catch (RuleViolationException e) {
                return new Rejected(e.getMessage(), state);
            } catch (DuplicateCommandException e) {
                return new AlreadyProcessed(store.loadSnapshot(gameId).orElseThrow());
            } catch (ConcurrentGameUpdateException e) {
                return new Rejected("A partida mudou; tente de novo com o estado atualizado.",
                        store.loadSnapshot(gameId).orElseThrow());
            }
        });
    }

    /**
     * Prazo esgotado: se a partida ainda está na versão em que o prazo começou, joga a ação padrão
     * pelo jogador da vez. Se alguém agiu antes, não faz nada.
     */
    public void timeout(String gameId, long version, boolean automaticMode) {
        withLock(gameId, () -> {
            GameState state = store.loadSnapshot(gameId).orElse(null);
            if (state == null || state.version() != version || state.status() != GameStatus.IN_PROGRESS) return null;
            timeouts.forState(state, automaticMode).ifPresent(timeout -> apply(gameId, state, state.currentPlayer().id(),
                    timeout.defaultCommand(), "auto:" + gameId + ":" + version));
            return null;
        });
    }

    /** Todos saíram e ninguém voltou a tempo: encerra a partida sem vencedor. */
    public void abandon(String gameId) {
        withLock(gameId, () -> {
            store.loadSnapshot(gameId).filter(s -> s.status() == GameStatus.IN_PROGRESS).ifPresent(state -> {
                List<GameEvent> events = engine.abandon(state);
                GameState finished = state;
                for (GameEvent event : events) finished = engine.apply(finished, event);
                store.append(gameId, state.version(), events, finished, null, null);
                publisher.publishEvent(new GameUpdated(gameId, events, finished));
            });
            return null;
        });
    }

    /** Aplica o comando, passa a vez se não restou decisão, grava e avisa quem acompanha a partida. */
    private Applied apply(String gameId, GameState state, String playerId, GameCommand command, String commandId) {
        GameEngine.Result result = engine.execute(state, playerId, command, dice);
        store.append(gameId, state.version(), result.events(), result.state(), commandId, playerId);
        List<GameEvent> events = new ArrayList<>(result.events());
        GameState current = passTurnIfIdle(gameId, result.state(), events);
        publisher.publishEvent(new GameUpdated(gameId, events, current));
        return new Applied(events, current);
    }

    /** Sem decisão restante no turno, a vez passa sozinha (inclui a nova jogada da dupla). */
    private GameState passTurnIfIdle(String gameId, GameState state, List<GameEvent> events) {
        if (state.status() != GameStatus.IN_PROGRESS || state.phase() != TurnPhase.AWAITING_END_TURN) return state;
        GameEngine.Result ended = engine.execute(state, state.currentPlayer().id(), new GameCommand.EndTurn(), dice);
        store.append(gameId, state.version(), ended.events(), ended.state(), null, null);
        events.addAll(ended.events());
        return ended.state();
    }

    private <T> T withLock(String gameId, java.util.function.Supplier<T> action) {
        ReentrantLock lock = locks.computeIfAbsent(gameId, id -> new ReentrantLock());
        lock.lock();
        try {
            return action.get();
        } finally {
            lock.unlock();
        }
    }
}
