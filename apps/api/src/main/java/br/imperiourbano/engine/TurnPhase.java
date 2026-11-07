package br.imperiourbano.engine;

/** Fase do turno atual; ver docs/03-dominio-e-fluxo.md. */
public enum TurnPhase {
    AWAITING_ROLL,
    AWAITING_PURCHASE,
    AWAITING_BUILD,
    AWAITING_OLYMPICS_HOST,
    AWAITING_TRAVEL_DESTINATION,
    AWAITING_DEBT_RESOLUTION,
    /** Carta de evento revelada: o jogador escolhe um estado no tabuleiro (Incêndio, Apagão, Escolha da sede). */
    AWAITING_EVENT_TARGET,
    AWAITING_END_TURN
}
