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
    /** Escolhe, sem taxa, um dos próprios estados para sediar a próxima edição das Olimpíadas. */
    CHOOSE_OLYMPICS_HOST,
    /** Apagão: estado de adversário sem aluguel até o dono parar nele {@code visits} vezes. */
    BLACKOUT,
    /** Descanso merecido: vai direto para o Descanso, como na 3ª dupla (sem bônus do Início). */
    GO_TO_REST,
    /** Passe Livre: guarda um item para sair do Descanso sem perder a vez (uso manual, no turno). */
    GRANT_REST_PASS,
    /** Aluguel Zero: guarda um item gasto sozinho na próxima propriedade adversária com aluguel. */
    GRANT_RENT_WAIVER;

    /** Efeitos em que o jogador escolhe um estado no tabuleiro. */
    public boolean needsTarget() {
        return this == BURN_PROPERTY || this == CHOOSE_OLYMPICS_HOST || this == BLACKOUT;
    }
}
