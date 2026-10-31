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

    /** {@code roundLimit} nulo = sem limite de rodadas. */
    public record ModeConfig(Integer roundLimit) {
    }
}
