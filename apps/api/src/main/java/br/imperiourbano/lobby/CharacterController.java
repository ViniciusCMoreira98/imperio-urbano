package br.imperiourbano.lobby;

import br.imperiourbano.identity.GuestPrincipal;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Personagem preferido, escolhido no menu (vale para as próximas salas). */
@RestController
@RequestMapping("/api/character")
class CharacterController {

    record CharacterRequest(String avatarId, PawnColor pawnColor) {
    }

    private final CharacterPreferences preferences;

    CharacterController(CharacterPreferences preferences) {
        this.preferences = preferences;
    }

    @GetMapping
    CharacterPreferences.Character current(@AuthenticationPrincipal GuestPrincipal player) {
        return preferences.of(player.playerId());
    }

    @PutMapping
    CharacterPreferences.Character save(@AuthenticationPrincipal GuestPrincipal player, @RequestBody CharacterRequest request) {
        return preferences.save(player.playerId(), request.avatarId(), request.pawnColor());
    }

    @ExceptionHandler(LobbyException.class)
    ProblemDetail error(LobbyException e) {
        return ProblemDetail.forStatusAndDetail(e.status(), e.getMessage());
    }
}
