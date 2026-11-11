package br.imperiourbano.game;

import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.persistence.GameStore;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
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
 * Encerra, sem vencedor, a partida em andamento que fica sem ninguém conectado por {@code abandonAfter}
 * ({@code botGameAbandonAfter} na partida contra bots, onde só o anfitrião se conecta: pedido do usuário,
 * 11/11/2026, 3 minutos).
 * Quem volta antes cancela o encerramento. Ao subir o servidor ninguém está conectado, então as
 * partidas em andamento começam a contar o prazo na hora.
 */
@Component
class AbandonmentWatcher {

    private static final Logger log = LoggerFactory.getLogger(AbandonmentWatcher.class);

    /** Tempo sem jogadores conectados até encerrar a partida (normal e contra bots). */
    record Policy(Duration abandonAfter, Duration botGameAbandonAfter) {
        Policy(Duration abandonAfter) {
            this(abandonAfter, abandonAfter);
        }
    }

    private final GameService games;
    private final GameStore store;
    private final Presence presence;
    private final Duration abandonAfter;
    private final Duration botGameAbandonAfter;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "abandonment");
        thread.setDaemon(true);
        return thread;
    });
    private final Map<String, ScheduledFuture<?>> pending = new ConcurrentHashMap<>();

    AbandonmentWatcher(GameService games, GameStore store, Presence presence, Policy policy) {
        this.games = games;
        this.store = store;
        this.presence = presence;
        this.abandonAfter = policy.abandonAfter();
        this.botGameAbandonAfter = policy.botGameAbandonAfter();
    }

    @EventListener
    void onPresenceChanged(Presence.Changed change) {
        if (change.anyone()) {
            ScheduledFuture<?> future = pending.remove(change.gameId());
            if (future != null) future.cancel(false);
        } else {
            schedule(change.gameId());
        }
    }

    /** Partida que começou (ou mudou) sem ninguém conectado também conta o prazo. */
    @EventListener
    void onGameUpdated(GameUpdated update) {
        if (update.state().status() == GameStatus.IN_PROGRESS
                && !presence.anyone(update.gameId()) && !pending.containsKey(update.gameId())) {
            schedule(update.gameId());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    void watchGamesLeftRunning() {
        store.inProgressGameIds().stream().filter(id -> !presence.anyone(id)).forEach(this::schedule);
    }

    private void schedule(String gameId) {
        Duration after = isBotGame(gameId) ? botGameAbandonAfter : abandonAfter;
        ScheduledFuture<?> previous = pending.put(gameId,
                scheduler.schedule(() -> abandonIfStillEmpty(gameId), after.toMillis(), TimeUnit.MILLISECONDS));
        if (previous != null) previous.cancel(false);
    }

    private boolean isBotGame(String gameId) {
        return store.loadSnapshot(gameId)
                .map(state -> state.players().stream().anyMatch(p -> Bots.isBot(p.id())))
                .orElse(false);
    }

    private void abandonIfStillEmpty(String gameId) {
        pending.remove(gameId);
        if (presence.anyone(gameId)) return;
        try {
            games.abandon(gameId);
        } catch (RuntimeException e) {
            log.warn("Falha ao encerrar a partida abandonada {}: {}", gameId, e.getMessage());
        }
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }
}
