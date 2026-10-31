package br.imperiourbano.realtime;

import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.persistence.GameInfo;
import br.imperiourbano.persistence.GameStore;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Conexão {@code /ws/games/{gameId}?token=...}: o navegador não envia cabeçalhos no WebSocket,
 * então o token do convidado vai na URL. Só membros de uma partida já iniciada entram.
 */
@Component
class GameHandshakeInterceptor implements HandshakeInterceptor {

    static final String GAME_ID = "gameId";
    static final String PLAYER_ID = "playerId";

    private final GuestSessionService sessions;
    private final GameStore store;
    private final LobbyService lobby;

    GameHandshakeInterceptor(GuestSessionService sessions, GameStore store, LobbyService lobby) {
        this.sessions = sessions;
        this.store = store;
        this.lobby = lobby;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler,
            Map<String, Object> attributes) {
        var uri = UriComponentsBuilder.fromUri(request.getURI()).build();
        String gameId = uri.getPathSegments().getLast();
        Optional<GuestPrincipal> player = sessions.authenticate(uri.getQueryParams().getFirst("token"));
        if (player.isEmpty()) {
            return refuse(response, HttpStatus.UNAUTHORIZED);
        }
        Optional<GameInfo> game = store.find(gameId);
        if (game.isEmpty() || !lobby.isMember(gameId, player.get().playerId())) {
            return refuse(response, HttpStatus.NOT_FOUND);
        }
        if (game.get().status() == GameStatus.LOBBY) {
            return refuse(response, HttpStatus.CONFLICT);
        }
        attributes.put(GAME_ID, gameId);
        attributes.put(PLAYER_ID, player.get().playerId());
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler,
            Exception exception) {
    }

    private static boolean refuse(ServerHttpResponse response, HttpStatus status) {
        response.setStatusCode(status);
        return false;
    }
}
