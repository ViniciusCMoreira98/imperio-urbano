package br.imperiourbano.realtime;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.game.CommandEnvelope;
import br.imperiourbano.game.GameService;
import br.imperiourbano.game.GameUpdated;
import br.imperiourbano.game.Presence;
import br.imperiourbano.game.TurnTimer;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.persistence.GameStore;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.core.JacksonException;

/**
 * Canal da partida. Cliente envia {@link CommandEnvelope}; servidor responde com:
 * {@code EVENTS} + {@code SNAPSHOT} para todos a cada {@link GameUpdated} (comando do jogador ou ação automática
 * por prazo), {@code SNAPSHOT} ao conectar, desconectar ou reenviar um comando já processado, e
 * {@code COMMAND_REJECTED} só para quem enviou. Um ping periódico derruba conexões mortas (rede caiu
 * sem aviso), para o "conectado" do snapshot e a pausa de partidas abandonadas valerem.
 */
@Component
class GameSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(GameSocketHandler.class);
    private static final int SEND_TIME_LIMIT_MS = 5_000;
    private static final int BUFFER_LIMIT_BYTES = 512 * 1024;
    private static final long PING_INTERVAL_SECONDS = 20;

    record SnapshotMessage(String kind, SnapshotView snapshot) {
        SnapshotMessage(SnapshotView snapshot) {
            this("SNAPSHOT", snapshot);
        }
    }

    record EventsMessage(String kind, long version, List<GameEvent> events) {
        EventsMessage(long version, List<GameEvent> events) {
            this("EVENTS", version, events);
        }
    }

    /** A partida não pode continuar (ex.: tabuleiro antigo); o cliente para de reconectar. */
    record UnavailableMessage(String kind, String reason) {
        UnavailableMessage(String reason) {
            this("GAME_UNAVAILABLE", reason);
        }
    }

    static final String OLD_BOARD_REASON = "Esta partida usa o tabuleiro antigo e não pode continuar.";
    private static final String UNAVAILABLE = "unavailable";

    record RejectedMessage(String kind, String commandId, String reason) {
        RejectedMessage(String commandId, String reason) {
            this("COMMAND_REJECTED", commandId, reason);
        }
    }

    private final GameService games;
    private final GameStore store;
    private final LobbyService lobby;
    private final TurnTimer timer;
    private final Presence presence;
    /** gameId → conexões abertas (já envolvidas para envio seguro entre threads). */
    private final Map<String, Map<String, WebSocketSession>> rooms = new ConcurrentHashMap<>();
    private final ScheduledExecutorService pinger = Executors.newSingleThreadScheduledExecutor(runnable -> {
        Thread thread = new Thread(runnable, "ws-ping");
        thread.setDaemon(true);
        return thread;
    });

    GameSocketHandler(GameService games, GameStore store, LobbyService lobby, TurnTimer timer, Presence presence) {
        this.games = games;
        this.store = store;
        this.lobby = lobby;
        this.timer = timer;
        this.presence = presence;
        pinger.scheduleAtFixedRate(this::pingAll, PING_INTERVAL_SECONDS, PING_INTERVAL_SECONDS, TimeUnit.SECONDS);
    }

    /** Depois do relógio do turno (ordem 1), para o snapshot já levar o prazo novo. */
    @EventListener
    @Order(2)
    void onGameUpdated(GameUpdated update) {
        if (!update.events().isEmpty()) {
            broadcast(update.gameId(), new EventsMessage(update.state().version(), update.events()));
        }
        broadcastSnapshot(update.gameId(), update.state());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession raw) {
        if (store.usesOldBoard(gameId(raw))) {
            raw.getAttributes().put(UNAVAILABLE, true);
            send(raw, new UnavailableMessage(OLD_BOARD_REASON));
            try {
                raw.close(CloseStatus.NORMAL.withReason("tabuleiro antigo"));
            } catch (IOException ignored) {
                // Já estava fechando.
            }
            return;
        }
        WebSocketSession session = new ConcurrentWebSocketSessionDecorator(raw, SEND_TIME_LIMIT_MS, BUFFER_LIMIT_BYTES);
        rooms.computeIfAbsent(gameId(raw), id -> new ConcurrentHashMap<>()).put(raw.getId(), session);
        presence.joined(gameId(raw), playerId(raw));
        // Envia o estado a todos e retoma o prazo do turno, se estava pausado.
        games.announce(gameId(raw));
    }

    @Override
    protected void handleTextMessage(WebSocketSession raw, TextMessage message) {
        String gameId = gameId(raw);
        WebSocketSession session = rooms.getOrDefault(gameId, Map.of()).getOrDefault(raw.getId(), raw);
        CommandEnvelope envelope;
        try {
            envelope = WireJson.MAPPER.readValue(message.getPayload(), CommandEnvelope.class);
        } catch (JacksonException e) {
            send(session, new RejectedMessage(null, "Mensagem inválida."));
            return;
        }
        switch (games.execute(gameId, playerId(raw), envelope)) {
            // Já enviado a todos por onGameUpdated.
            case GameService.Applied applied -> {
            }
            case GameService.AlreadyProcessed done -> send(session, new SnapshotMessage(snapshot(gameId, done.state())));
            case GameService.Rejected rejected -> {
                send(session, new RejectedMessage(envelope.commandId(), rejected.reason()));
                send(session, new SnapshotMessage(snapshot(gameId, rejected.state())));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession raw, CloseStatus status) {
        if (raw.getAttributes().containsKey(UNAVAILABLE)) return;
        String gameId = gameId(raw);
        presence.left(gameId, playerId(raw));
        Map<String, WebSocketSession> room = rooms.get(gameId);
        if (room == null) return;
        room.remove(raw.getId());
        if (room.isEmpty()) {
            rooms.remove(gameId, room);
            return;
        }
        games.announce(gameId);
    }

    private void broadcastSnapshot(String gameId, GameState state) {
        broadcast(gameId, new SnapshotMessage(snapshot(gameId, state)));
    }

    private SnapshotView snapshot(String gameId, GameState state) {
        String inviteCode = store.find(gameId).orElseThrow().inviteCode();
        Long timeLeft = timer.remainingMillis(gameId).isPresent() ? timer.remainingMillis(gameId).getAsLong() : null;
        return SnapshotView.of(state, inviteCode, lobby.members(gameId), presence.connected(gameId), timeLeft);
    }

    private void broadcast(String gameId, Object message) {
        TextMessage text = new TextMessage(WireJson.MAPPER.writeValueAsString(message));
        rooms.getOrDefault(gameId, Map.of()).values().forEach(session -> send(session, text));
    }

    /** Conexão que não aceita o ping está morta: fechá-la dispara afterConnectionClosed. */
    private void pingAll() {
        rooms.values().forEach(room -> room.values().forEach(session -> {
            try {
                if (session.isOpen()) session.sendMessage(new PingMessage(ByteBuffer.allocate(0)));
            } catch (IOException | IllegalStateException e) {
                closeQuietly(session);
            }
        }));
    }

    private static void closeQuietly(WebSocketSession session) {
        try {
            session.close(CloseStatus.SESSION_NOT_RELIABLE);
        } catch (IOException ignored) {
            // Já estava fechando.
        }
    }

    private static void send(WebSocketSession session, Object message) {
        send(session, new TextMessage(WireJson.MAPPER.writeValueAsString(message)));
    }

    private static void send(WebSocketSession session, TextMessage text) {
        if (!session.isOpen()) return;
        try {
            session.sendMessage(text);
        } catch (IOException | IllegalStateException e) {
            log.debug("Falha ao enviar para a sessão {}: {}", session.getId(), e.getMessage());
        }
    }

    @PreDestroy
    void shutdown() {
        pinger.shutdownNow();
    }

    private static String gameId(WebSocketSession session) {
        return (String) session.getAttributes().get(GameHandshakeInterceptor.GAME_ID);
    }

    private static String playerId(WebSocketSession session) {
        return (String) session.getAttributes().get(GameHandshakeInterceptor.PLAYER_ID);
    }
}
