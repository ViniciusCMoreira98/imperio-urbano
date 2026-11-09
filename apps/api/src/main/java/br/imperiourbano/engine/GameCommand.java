package br.imperiourbano.engine;

import java.util.List;

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

    /**
     * Só com dívida pendente: vende ao banco os estados escolhidos, inteiros (terreno + construções), pelo
     * percentual de {@code rules.debtSale}. Só vale se a venda, somada ao saldo, pagar a dívida (08/11/2026).
     */
    record SellStates(List<String> stateIds) implements GameCommand {

        public SellStates {
            stateIds = stateIds == null ? List.of() : List.copyOf(stateIds);
        }
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

    /** No próprio turno, no Descanso e antes de rolar: gasta um Passe Livre e sai sem perder a vez. */
    record UseRestPass() implements GameCommand {
    }

    record EndTurn() implements GameCommand {
    }
}
