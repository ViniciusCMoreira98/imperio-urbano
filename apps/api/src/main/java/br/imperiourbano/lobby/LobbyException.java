package br.imperiourbano.lobby;

import org.springframework.http.HttpStatus;

/** Ação de sala recusada; a mensagem é exibida ao jogador. */
public class LobbyException extends RuntimeException {

    private final HttpStatus status;

    LobbyException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    static LobbyException notFound() {
        return new LobbyException(HttpStatus.NOT_FOUND, "Sala não encontrada.");
    }

    static LobbyException conflict(String message) {
        return new LobbyException(HttpStatus.CONFLICT, message);
    }

    public HttpStatus status() {
        return status;
    }
}
