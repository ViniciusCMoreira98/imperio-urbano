package br.imperiourbano.identity;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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

    record PlayerResponse(String playerId, String nickname, boolean google, String email) {
    }

    record GoogleRequest(String credential) {
    }

    record GoogleResponse(String playerId, String nickname, String token, String outcome, String email) {
    }

    /** Configuração pública do login: o Client ID do Google (nulo = botão escondido). */
    record AuthConfig(String googleClientId) {
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

    /** Confere um token guardado e devolve o jogador correspondente, com a conta Google ligada (se houver). */
    @GetMapping("/me")
    PlayerResponse me(@AuthenticationPrincipal GuestPrincipal player) {
        GuestSessionService.Account account = sessions.account(player.playerId());
        return new PlayerResponse(player.playerId(), player.nickname(), account.google(), account.email());
    }

    @GetMapping("/config")
    AuthConfig config() {
        return new AuthConfig(sessions.googleEnabled() ? sessions.googleClientId() : null);
    }

    /**
     * Entra com Google. Com o token do convidado no cabeçalho, a conta Google (se nova) é ligada a ele.
     * Devolve um token novo, deste aparelho.
     */
    @PostMapping("/google")
    GoogleResponse google(@RequestBody GoogleRequest request, @AuthenticationPrincipal GuestPrincipal current) {
        GuestSessionService.GoogleSignIn result = sessions.signInWithGoogle(request.credential(), current);
        GuestPrincipal player = result.session().player();
        return new GoogleResponse(player.playerId(), player.nickname(), result.session().token(), result.outcome(), result.email());
    }

    /** Sair neste aparelho. */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            sessions.signOut(authorization.substring("Bearer ".length()).strip());
        }
    }

    @ExceptionHandler(InvalidNicknameException.class)
    ProblemDetail invalidNickname(InvalidNicknameException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(GoogleLoginException.class)
    ProblemDetail googleLogin(GoogleLoginException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }
}
