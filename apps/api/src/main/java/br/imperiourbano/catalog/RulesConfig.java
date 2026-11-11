package br.imperiourbano.catalog;

import java.util.List;
import java.util.Map;

public record RulesConfig(
        int version,
        PlayerLimits players,
        int startingCredits,
        int passStartBonus,
        DiceConfig dice,
        ConstructionRules construction,
        OlympicsRules olympics,
        RestRules rest,
        NationalTravelRules nationalTravel,
        TaxRules tax,
        DebtSaleRules debtSale,
        TurnTimers turnTimers,
        AbandonmentRules abandonment,
        EconomyRules economy,
        Map<GameMode, ModeConfig> modes) {

    public RulesConfig {
        modes = Map.copyOf(modes);
    }

    public record PlayerLimits(int min, int max) {
    }

    /** Na {@code maxDoublesInRow}-ésima dupla seguida o jogador vai para o Descanso (D9). */
    public record DiceConfig(int count, int faces, int maxDoublesInRow) {
    }

    public record ConstructionRules(
            int maxHouses,
            int firstVisitMaxHouses,
            boolean requiresFullColorGroup,
            int fullGroupBaseRentMultiplier) {
    }

    public record OlympicsRules(int hostFee, List<Integer> multipliers) {

        public OlympicsRules {
            multipliers = List.copyOf(multipliers);
        }

        /** Multiplicador da edição (1ª = índice 0); após a última, mantém o máximo. */
        public int multiplierForEdition(int edition) {
            return multipliers.get(Math.min(edition, multipliers.size()) - 1);
        }
    }

    /** Descanso (D2): jogadas perdidas ao parar; uma dupla libera antes. */
    public record RestRules(int turnsLost) {
    }

    /** Viagem Nacional (D3): taxa para viajar a qualquer casa na jogada seguinte. */
    public record NationalTravelRules(int fee) {
    }

    /**
     * Taxa: {@code equityPercent}% do patrimônio de quem para na casa (pedido do usuário, 10/11/2026), arredondado
     * para baixo. O valor vai para o fundo do Saque; sem saldo, vira dívida com o banco.
     */
    public record TaxRules(int equityPercent) {

        public int amountFor(int equity) {
            return Math.max(0, equity) * equityPercent / 100;
        }
    }

    /** Dívida sem saldo: vende estados inteiros (terreno + construções) ao banco por {@code refundPercent}%. */
    public record DebtSaleRules(int refundPercent) {

        public int refund(int value) {
            return value * refundPercent / 100;
        }
    }

    /**
     * Prazos do turno: rolar/viajar, decidir e pagar dívida; ao acabar, o servidor executa a ação padrão
     * (na dívida, vende o necessário para pagar).
     * {@code automaticSeconds}: pausa entre as jogadas do modo automático (jogador desconectado).
     */
    public record TurnTimers(int rollSeconds, int decisionSeconds, int debtSeconds, int automaticSeconds) {
    }

    /**
     * Partida em andamento sem ninguém conectado por {@code seconds} é encerrada sem vencedor;
     * contra bots, por {@code botGameSeconds} (o anfitrião é o único que se conecta).
     */
    public record AbandonmentRules(int seconds, int botGameSeconds) {
    }

    /**
     * Moedas fora da partida: apostas permitidas ao criar a sala, saldo inicial do convidado e a recarga
     * diária grátis de quem ficou abaixo de {@code dailyRefill.below} (vai a {@code dailyRefill.amount}).
     */
    public record EconomyRules(List<Integer> stakes, int guestStartingCoins, DailyRefill dailyRefill) {

        public EconomyRules {
            stakes = List.copyOf(stakes);
        }
    }

    public record DailyRefill(int below, int amount) {
    }

    /** {@code roundLimit} / {@code timeLimitMinutes} nulos = sem limite de rodadas / de tempo. */
    public record ModeConfig(Integer roundLimit, Integer timeLimitMinutes) {
    }
}
