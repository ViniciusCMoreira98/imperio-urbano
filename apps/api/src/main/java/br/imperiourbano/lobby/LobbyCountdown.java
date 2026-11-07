package br.imperiourbano.lobby;

import jakarta.annotation.PreDestroy;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Relógio das salas: a cada meio segundo inicia as salas com a contagem vencida. Como o fim da contagem
 * fica no banco, um servidor reiniciado retoma as salas sozinho.
 */
@Component
@ConditionalOnProperty(name = "app.lobby.countdown.enabled", havingValue = "true", matchIfMissing = true)
class LobbyCountdown {

    private static final Logger log = LoggerFactory.getLogger(LobbyCountdown.class);
    private static final long TICK_MS = 500;

    private final LobbyService lobby;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "lobby-countdown");
        thread.setDaemon(true);
        return thread;
    });

    LobbyCountdown(LobbyService lobby) {
        this.lobby = lobby;
    }

    @EventListener(ApplicationReadyEvent.class)
    void startTicking() {
        scheduler.scheduleWithFixedDelay(this::tick, TICK_MS, TICK_MS, TimeUnit.MILLISECONDS);
    }

    void tick() {
        try {
            for (String gameId : lobby.dueLobbies()) {
                try {
                    lobby.autoStart(gameId);
                } catch (RuntimeException e) {
                    log.warn("Falha ao iniciar a sala {} automaticamente", gameId, e);
                }
            }
        } catch (RuntimeException e) {
            log.warn("Falha ao procurar salas para iniciar", e);
        }
    }

    @PreDestroy
    void stop() {
        scheduler.shutdownNow();
    }
}
