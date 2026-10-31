package br.imperiourbano.game;

import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.RuleViolationException;
import br.imperiourbano.persistence.ConcurrentGameUpdateException;
import br.imperiourbano.persistence.DuplicateCommandException;
import br.imperiourbano.persistence.GameStore;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import org.springframework.stereotype.Service;

/**
 * Executa comandos de partida: idempotência por commandId, conferência de versão, regras pelo motor
 * e gravação. Um lock por partida serializa os comandos nesta instância (ADR A6); a versão no banco
 * protege contra escritas concorrentes de outra instância.
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
    private final Map<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    GameService(GameEngine engine, GameStore store, Dice dice) {
        this.engine = engine;
        this.store = store;
        this.dice = dice;
    }

    public Optional<GameState> current(String gameId) {
        return store.loadSnapshot(gameId);
    }

    public Outcome execute(String gameId, String playerId, CommandEnvelope envelope) {
        ReentrantLock lock = locks.computeIfAbsent(gameId, id -> new ReentrantLock());
        lock.lock();
        try {
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
            GameEngine.Result result = engine.execute(state, playerId, envelope.command(), dice);
            store.append(gameId, state.version(), result.events(), result.state(), envelope.commandId(), playerId);
            return new Applied(result.events(), result.state());
        } catch (RuleViolationException e) {
            return new Rejected(e.getMessage(), store.loadSnapshot(gameId).orElseThrow());
        } catch (DuplicateCommandException e) {
            return new AlreadyProcessed(store.loadSnapshot(gameId).orElseThrow());
        } catch (ConcurrentGameUpdateException e) {
            return new Rejected("A partida mudou; tente de novo com o estado atualizado.",
                    store.loadSnapshot(gameId).orElseThrow());
        } finally {
            lock.unlock();
        }
    }
}
