package br.imperiourbano.engine;

/**
 * Dívida que o jogador não conseguiu pagar; {@code creditorId} nulo = banco.
 * {@code toTaxPool}: dívida da casa Taxa, cujo pagamento (ou o que sobrar na falência) vai para o fundo do Saque.
 */
public record Debt(String debtorId, String creditorId, int amount, boolean toTaxPool) {

    public Debt(String debtorId, String creditorId, int amount) {
        this(debtorId, creditorId, amount, false);
    }
}
