package br.imperiourbano.engine;

/** Intenções do jogador. Nunca carregam valores calculados: o motor decide. */
public sealed interface GameCommand {

    record RollDice() implements GameCommand {
    }

    /** Compra o estado onde o peão parou. Casas na compra entram na E9. */
    record BuyProperty() implements GameCommand {
    }

    record DeclinePurchase() implements GameCommand {
    }

    record EndTurn() implements GameCommand {
    }
}
