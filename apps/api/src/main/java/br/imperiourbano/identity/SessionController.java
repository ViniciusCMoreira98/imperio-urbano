package br.imperiourbano.identity;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
class SessionController {

    record CreateSessionRequest(String nickname) {
    }

    record SessionResponse(String playerId, String nickname, String token) {
    }

    record PlayerResponse(String playerId, String nickname) {
    }

    private final GuestSessionService sessions;

    SessionController(GuestSessionService sessions) {
        this.sessions = sessions;
    }

    /** Cria um convidado. O token só aparece nesta resposta; o cliente o guarda para reconectar. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    SessionResponse create(@RequestBody CreateSessionRequest request) {
        GuestSessionService.NewSession session = sessions.create(request.nickname());
        return new SessionResponse(session.player().playerId(), session.player().nickname(), session.token());
    }

    /** Confere um token guardado e devolve o jogador correspondente. */
    @GetMapping("/me")
    PlayerResponse me(@AuthenticationPrincipal GuestPrincipal player) {
        return new PlayerResponse(player.playerId(), player.nickname());
    }

    @ExceptionHandler(InvalidNicknameException.class)
    ProblemDetail invalidNickname(InvalidNicknameException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }
}
