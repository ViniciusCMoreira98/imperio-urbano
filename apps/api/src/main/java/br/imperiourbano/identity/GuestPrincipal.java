package br.imperiourbano.identity;

/** Jogador autenticado por sessão de convidado; {@code playerId} é o id usado nas partidas. */
public record GuestPrincipal(String playerId, String nickname) {
}
