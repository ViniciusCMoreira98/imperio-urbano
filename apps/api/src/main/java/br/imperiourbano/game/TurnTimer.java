package br.imperiourbano.game;

import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.OptionalLong;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Relógio do turno, um por partida. O prazo pertence a uma versão do estado: qualquer ação nova
 * (do jogador ou automática) muda a versão e reinicia o relógio; reconectar não reinicia.
 * Jogador da vez desconectado entra no modo automático: o servidor joga por ele a cada poucos segundos
 * até ele voltar. Partida sem ninguém conectado fica pausada: o prazo vence sem jogar, e recomeça
 * inteiro quando alguém volta (assim o servidor não joga sozinho uma partida abandonada).
 */
@Component
public class TurnTimer {

    private static final Logger log = LoggerFactory.getLogger(TurnTimer.class);

    private record Scheduled(long version, boolean automatic, Instant deadline, ScheduledFuture<?> future) {
    }

    private final GameService games;
    private final TurnTimeouts timeouts;
    private final Presence presence;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "turn-timer");
        thread.setDaemon(true);
        return thread;
    });
    private final Map<String, Scheduled> timers = new ConcurrentHashMap<>();
    /** Até quando a mesa dos jogadores ainda mostra jogadas já enviadas, por partida. */
    private final Map<String, Instant> tableBusyUntil = new ConcurrentHashMap<>();

    TurnTimer(GameService games, TurnTimeouts timeouts, Presence presence) {
        this.games = games;
        this.timeouts = timeouts;
        this.presence = presence;
    }

    /** Roda antes de quem envia o snapshot, para o prazo novo já sair nele. */
    @EventListener
    @Order(1)
    void onGameUpdated(GameUpdated update) {
        String gameId = update.gameId();
        long version = update.state().version();
        boolean automatic = isAutomatic(gameId, update);
        Scheduled existing = timers.get(gameId);
        // Mesma versão e mesmo modo com prazo correndo: mantém (reconectar não ganha tempo extra).
        // Se o jogador da vez caiu ou voltou, o modo muda e o prazo é refeito.
        if (existing != null && existing.version() == version && existing.automatic() == automatic
                && !existing.future().isDone()) {
            return;
        }
        if (existing != null) existing.future().cancel(false);

        Instant now = Instant.now();
        Instant tableFree = tableFreeAt(gameId, update, now);
        timeouts.forState(update.state(), automatic).ifPresentOrElse(timeout -> {
            // Quem está jogando só começa a perder tempo depois que a mesa mostra as jogadas ainda na
            // fila (dados e personagens andando, inclusive as do adversário em lotes anteriores). O modo
            // automático segue rápido: a mesa de quem assiste já enfileira as jogadas.
            Instant start = automatic ? now : tableFree;
            Instant deadline = start.plus(timeout.duration());
            ScheduledFuture<?> future = scheduler.schedule(() -> fire(gameId, version, automatic),
                    Duration.between(now, deadline).toMillis(), TimeUnit.MILLISECONDS);
            timers.put(gameId, new Scheduled(version, automatic, deadline, future));
        }, () -> timers.remove(gameId));
    }

    /**
     * Quando a mesa termina de mostrar tudo o que já foi enviado: cada lote com dados ou personagens
     * andando entra na fila depois do anterior (é assim que o cliente apresenta).
     */
    private Instant tableFreeAt(String gameId, GameUpdated update, Instant now) {
        if (update.state().status() != GameStatus.IN_PROGRESS) {
            tableBusyUntil.remove(gameId);
            return now;
        }
        Duration show = timeouts.presentation(update.events());
        return tableBusyUntil.compute(gameId, (id, busy) -> {
            Instant from = busy == null || busy.isBefore(now) ? now : busy;
            return from.plus(show);
        });
    }

    /** Jogador da vez sem conexão aberta: o servidor joga por ele. */
    private boolean isAutomatic(String gameId, GameUpdated update) {
        GameState state = update.state();
        return state.status() == GameStatus.IN_PROGRESS
                && !presence.connected(gameId).contains(state.currentPlayer().id());
    }

    /** Milissegundos até o prazo atual, se houver. */
    public OptionalLong remainingMillis(String gameId) {
        Scheduled scheduled = timers.get(gameId);
        if (scheduled == null) return OptionalLong.empty();
        return OptionalLong.of(Math.max(0, Duration.between(Instant.now(), scheduled.deadline()).toMillis()));
    }

    private void fire(String gameId, long version, boolean automatic) {
        if (!presence.anyone(gameId)) {
            log.debug("Partida {} sem jogadores conectados: prazo pausado", gameId);
            return;
        }
        try {
            games.timeout(gameId, version, automatic);
        } catch (RuntimeException e) {
            log.warn("Falha na ação automática da partida {}: {}", gameId, e.getMessage());
        }
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }
}
