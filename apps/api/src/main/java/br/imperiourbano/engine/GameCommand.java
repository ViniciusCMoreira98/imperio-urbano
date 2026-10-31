package br.imperiourbano.engine;

/** Intenções do jogador. Nunca carregam valores calculados: o motor decide. */
public sealed interface GameCommand {

    record RollDice() implements GameCommand {
    }

    /** Compra o estado onde o peão parou e, opcionalmente, já constrói casas da primeira etapa. */
    record BuyProperty(int houses) implements GameCommand {
    }

    record DeclinePurchase() implements GameCommand {
    }

    /** Constrói casas no próprio estado onde o peão parou. */
    record Build(int houses) implements GameCommand {
    }

    /** Troca as quatro casas por um hotel. */
    record BuildHotel() implements GameCommand {
    }

    record SkipBuild() implements GameCommand {
    }

    /** Paga a taxa e torna um estado próprio a sede da próxima edição. */
    record HostOlympics(String stateId) implements GameCommand {
    }

    record SkipOlympics() implements GameCommand {
    }

    record EndTurn() implements GameCommand {
    }
}
