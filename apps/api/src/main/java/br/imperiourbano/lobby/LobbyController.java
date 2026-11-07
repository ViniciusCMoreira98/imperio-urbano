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

    /** {@code stake} ausente = a menor aposta. */
    record CreateGameRequest(GameMode mode, Integer stake, Boolean publicRoom) {
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
        Integer stake = request == null ? null : request.stake();
        boolean publicRoom = request == null || request.publicRoom() == null || request.publicRoom();
        return lobby.create(player, mode, stake == null ? lobby.lowestStake() : stake, publicRoom);
    }

    @PostMapping("/join")
    LobbyView join(@AuthenticationPrincipal GuestPrincipal player, @RequestBody JoinRequest request) {
        return lobby.join(player, request.inviteCode());
    }

    /** Salas públicas em que o jogador pode entrar agora. */
    @GetMapping("/public")
    List<PublicRoomView> publicRooms(@AuthenticationPrincipal GuestPrincipal player) {
        return lobby.publicRooms(player);
    }

    @PostMapping("/{gameId}/join")
    LobbyView joinPublic(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId) {
        return lobby.joinPublic(player, gameId);
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

    /** Sai da sala antes do início (libera o assento). */
    @PostMapping("/{gameId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void leave(@AuthenticationPrincipal GuestPrincipal player, @PathVariable String gameId) {
        lobby.leave(player, gameId);
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
