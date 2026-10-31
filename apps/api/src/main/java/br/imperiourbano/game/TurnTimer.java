package br.imperiourbano.game;

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
 */
@Component
public class TurnTimer {

    private static final Logger log = LoggerFactory.getLogger(TurnTimer.class);

    private record Scheduled(long version, Instant deadline, ScheduledFuture<?> future) {
    }

    private final GameService games;
    private final TurnTimeouts timeouts;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "turn-timer");
        thread.setDaemon(true);
        return thread;
    });
    private final Map<String, Scheduled> timers = new ConcurrentHashMap<>();

    TurnTimer(GameService games, TurnTimeouts timeouts) {
        this.games = games;
        this.timeouts = timeouts;
    }

    /** Roda antes de quem envia o snapshot, para o prazo novo já sair nele. */
    @EventListener
    @Order(1)
    void onGameUpdated(GameUpdated update) {
        String gameId = update.gameId();
        long version = update.state().version();
        Scheduled existing = timers.get(gameId);
        if (existing != null && existing.version() == version) return;
        if (existing != null) existing.future().cancel(false);

        timeouts.forState(update.state()).ifPresentOrElse(timeout -> {
            Duration duration = timeout.duration();
            ScheduledFuture<?> future = scheduler.schedule(() -> fire(gameId, version), duration.toMillis(), TimeUnit.MILLISECONDS);
            timers.put(gameId, new Scheduled(version, Instant.now().plus(duration), future));
        }, () -> timers.remove(gameId));
    }

    /** Milissegundos até o prazo atual, se houver. */
    public OptionalLong remainingMillis(String gameId) {
        Scheduled scheduled = timers.get(gameId);
        if (scheduled == null) return OptionalLong.empty();
        return OptionalLong.of(Math.max(0, Duration.between(Instant.now(), scheduled.deadline()).toMillis()));
    }

    private void fire(String gameId, long version) {
        try {
            games.timeout(gameId, version);
        } catch (RuntimeException e) {
            log.warn("Falha na ação automática da partida {}: {}", gameId, e.getMessage());
        }
    }

    @PreDestroy
    void shutdown() {
        scheduler.shutdownNow();
    }
}
