package br.imperiourbano.catalog;

/**
 * Efeitos das cartas de evento (baralho brasileiro do Codex, decisão do usuário em 06/11/2026).
 * GAIN e PAY mexem no saldo; os demais pedem um estado escolhido no tabuleiro ou levam o peão à sede.
 */
public enum CardEffectType {
    /** Recebe {@code amount} do banco. */
    GAIN,
    /** Paga {@code amount} ao banco; sem saldo, vira dívida. */
    PAY,
    /** Incêndio: um estado de adversário volta ao banco, sem as construções e sem reembolso. */
    BURN_PROPERTY,
    /** Vai até a sede atual das Olimpíadas (bônus ao passar pelo Início). */
    VISIT_OLYMPICS_HOST,
    /** Escolhe, sem taxa, um estado com dono para sediar a próxima edição das Olimpíadas. */
    CHOOSE_OLYMPICS_HOST,
    /** Apagão: estado de adversário sem aluguel até o dono parar nele {@code visits} vezes. */
    BLACKOUT;

    /** Efeitos em que o jogador escolhe um estado no tabuleiro. */
    public boolean needsTarget() {
        return this == BURN_PROPERTY || this == CHOOSE_OLYMPICS_HOST || this == BLACKOUT;
    }
}
