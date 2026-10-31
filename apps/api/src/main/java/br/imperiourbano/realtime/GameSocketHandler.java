package br.imperiourbano.realtime;

import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.game.CommandEnvelope;
import br.imperiourbano.game.GameService;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.persistence.GameStore;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.core.JacksonException;

/**
 * Canal da partida. Cliente envia {@link CommandEnvelope}; servidor responde com:
 * {@code EVENTS} + {@code SNAPSHOT} para todos quando um comando é aplicado, {@code SNAPSHOT} ao conectar,
 * desconectar ou reenviar um comando já processado, e {@code COMMAND_REJECTED} só para quem enviou.
 */
@Component
class GameSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(GameSocketHandler.class);
    private static final int SEND_TIME_LIMIT_MS = 5_000;
    private static final int BUFFER_LIMIT_BYTES = 512 * 1024;

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

    record RejectedMessage(String kind, String commandId, String reason) {
        RejectedMessage(String commandId, String reason) {
            this("COMMAND_REJECTED", commandId, reason);
        }
    }

    private final GameService games;
    private final GameStore store;
    private final LobbyService lobby;
    /** gameId → conexões abertas (já envolvidas para envio seguro entre threads). */
    private final Map<String, Map<String, WebSocketSession>> rooms = new ConcurrentHashMap<>();

    GameSocketHandler(GameService games, GameStore store, LobbyService lobby) {
        this.games = games;
        this.store = store;
        this.lobby = lobby;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession raw) {
        WebSocketSession session = new ConcurrentWebSocketSessionDecorator(raw, SEND_TIME_LIMIT_MS, BUFFER_LIMIT_BYTES);
        rooms.computeIfAbsent(gameId(raw), id -> new ConcurrentHashMap<>()).put(raw.getId(), session);
        broadcastSnapshot(gameId(raw), games.current(gameId(raw)).orElseThrow());
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
            case GameService.Applied applied -> {
                broadcast(gameId, new EventsMessage(applied.state().version(), applied.events()));
                broadcastSnapshot(gameId, applied.state());
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
        String gameId = gameId(raw);
        Map<String, WebSocketSession> room = rooms.get(gameId);
        if (room == null) return;
        room.remove(raw.getId());
        if (room.isEmpty()) {
            rooms.remove(gameId, room);
            return;
        }
        games.current(gameId).ifPresent(state -> broadcastSnapshot(gameId, state));
    }

    private void broadcastSnapshot(String gameId, GameState state) {
        broadcast(gameId, new SnapshotMessage(snapshot(gameId, state)));
    }

    private SnapshotView snapshot(String gameId, GameState state) {
        Set<String> connected = rooms.getOrDefault(gameId, Map.of()).values().stream()
                .filter(WebSocketSession::isOpen)
                .map(GameSocketHandler::playerId)
                .collect(Collectors.toSet());
        String inviteCode = store.find(gameId).orElseThrow().inviteCode();
        return SnapshotView.of(state, inviteCode, lobby.members(gameId), connected);
    }

    private void broadcast(String gameId, Object message) {
        TextMessage text = new TextMessage(WireJson.MAPPER.writeValueAsString(message));
        rooms.getOrDefault(gameId, Map.of()).values().forEach(session -> send(session, text));
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

    private static String gameId(WebSocketSession session) {
        return (String) session.getAttributes().get(GameHandshakeInterceptor.GAME_ID);
    }

    private static String playerId(WebSocketSession session) {
        return (String) session.getAttributes().get(GameHandshakeInterceptor.PLAYER_ID);
    }
}
