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

    /** Só com dívida pendente: vende ao banco uma casa (ou o hotel, que volta a quatro casas) por metade do custo. */
    record SellBuilding(String stateId) implements GameCommand {
    }

    /** Só com dívida pendente: vende o estado ao banco por metade do preço e das construções. */
    record SellProperty(String stateId) implements GameCommand {
    }

    record DeclareBankruptcy() implements GameCommand {
    }

    /** Viagem Nacional: viaja até a casa escolhida pagando a taxa. Rolar os dados recusa a viagem. */
    record ChooseTravel(int tileIndex) implements GameCommand {
    }

    /** Carta de evento que pede um estado: o escolhido no tabuleiro. */
    record ChooseEventTarget(String stateId) implements GameCommand {
    }

    /** Só o servidor usa (prazo esgotado): a carta que pedia um estado fica sem efeito. */
    record SkipEventTarget() implements GameCommand {
    }

    record EndTurn() implements GameCommand {
    }
}
