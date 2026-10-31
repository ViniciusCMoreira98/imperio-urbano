package br.imperiourbano.engine;

/** Intenções do jogador. Nunca carregam valores calculados: o motor decide. */
public sealed interface GameCommand {

    record RollDice() implements GameCommand {
    }

    record EndTurn() implements GameCommand {
    }
}
