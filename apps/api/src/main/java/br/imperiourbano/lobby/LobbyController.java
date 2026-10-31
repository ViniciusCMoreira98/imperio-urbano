package br.imperiourbano.lobby;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.identity.GuestPrincipal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
class LobbyController {

    record CreateGameRequest(GameMode mode) {
    }

    record JoinRequest(String inviteCode) {
    }

    record CustomizeRequest(String avatarId, PawnColor pawnColor) {
    }

    record ReadyRequest(boolean ready) {
    }

    private final LobbyService lobby;

    LobbyController(LobbyService lobby) {
        this.lobby = lobby;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    LobbyView create(@AuthenticationPrincipal GuestPrincipal player, @RequestBody(required = false) CreateGameRequest request) {
        GameMode mode = request == null || request.mode() == null ? GameMode.CLASSIC : request.mode();
        return lobby.create(player, mode);
    }

    @PostMapping("/join")
    LobbyView join(@AuthenticationPrincipal GuestPrincipal player, @RequestBody JoinRequest request) {
        return lobby.join(player, request.inviteCode());
    }

    /** Para voltar a uma partida depois de fechar a aba ou trocar de dispositivo. */
    @GetMapping("/mine")
    List<LobbyView> mine(@AuthenticationPrincipal GuestPrincipal player) {
        return lobby.activeGames(player);
    }

    @GetMapping("/{gameId}")
    LobbyView view(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId) {
        return lobby.view(player, gameId);
    }

    @PutMapping("/{gameId}/me")
    LobbyView customize(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId,
            @RequestBody CustomizeRequest request) {
        return lobby.customize(player, gameId, request.avatarId(), request.pawnColor());
    }

    @PutMapping("/{gameId}/me/ready")
    LobbyView ready(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId,
            @RequestBody ReadyRequest request) {
        return lobby.setReady(player, gameId, request.ready());
    }

    @PostMapping("/{gameId}/start")
    LobbyView start(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId) {
        return lobby.start(player, gameId);
    }

    @ExceptionHandler(LobbyException.class)
    ProblemDetail lobbyError(LobbyException e) {
        return ProblemDetail.forStatusAndDetail(e.status(), e.getMessage());
    }
}
