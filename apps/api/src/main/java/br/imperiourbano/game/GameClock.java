package br.imperiourbano.game;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.persistence.GameStore;
import jakarta.annotation.PreDestroy;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Relógio dos modos por tempo (25 min e 1 h). Corre desde o início, sem pausar; ao acabar, o servidor
 * avisa o motor ({@link GameService#timeUp}). Ao subir o servidor, reagenda as partidas em andamento
 * (relógio já vencido encerra na hora).
 */
@Component
class GameClock {

    private static final Logger log = LoggerFactory.getLogger(GameClock.class);

    private final GameService games;
    private final GameStore store;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "game-clock");
        thread.setDaemon(true);
        return thread;
    });
    private final Map<String, ScheduledFuture<?>> pending = new ConcurrentHashMap<>();

    GameClock(GameService games, GameStore store) {
        this.games = games;
        this.store = store;
    }

    @EventListener
    void onGameUpdated(GameUpdated update) {
        if (update.events().stream().anyMatch(GameEvent.GameStarted.class::isInstance)) {
            schedule(update.gameId(), update.state());
        } else if (update.state().status() != GameStatus.IN_PROGRESS) {
            ScheduledFuture<?> future = pending.remove(update.gameId());
            if (future != null) future.cancel(false);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    void resumeClocks() {
        store.inProgressGameIds().forEach(id -> store.loadSnapshot(id).ifPresent(state -> schedule(id, state)));
    }

    private void schedule(String gameId, GameState state) {
        if (state.endsAt() == null || state.timeUp() || state.status() != GameStatus.IN_PROGRESS) return;
        long delay = Math.max(0, state.endsAt() - System.currentTimeMillis());
        ScheduledFuture<?> previous = pending.put(gameId,
                scheduler.schedule(() -> expire(gameId), delay, TimeUnit.MILLISECONDS));
        if (previous != null) previous.cancel(false);
    }

    private void expire(String gameId) {
        pending.remove(gameId);
        try {
            games.timeUp(gameId);
        } catch (RuntimeException e) {
            log.warn("Falha ao encerrar o relógio da partida {}: {}", gameId, e.getMessage());
        }
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }
}
