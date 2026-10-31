package br.imperiourbano.engine;

/** Dívida que o jogador não conseguiu pagar; {@code creditorId} nulo = banco. */
public record Debt(String debtorId, String creditorId, int amount) {
}
