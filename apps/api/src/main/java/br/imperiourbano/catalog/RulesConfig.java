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
        Map<GameMode, ModeConfig> modes) {

    public RulesConfig {
        modes = Map.copyOf(modes);
    }

    public record PlayerLimits(int min, int max) {
    }

    public record DiceConfig(int count, int faces) {
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

    /** {@code roundLimit} nulo = sem limite de rodadas. */
    public record ModeConfig(Integer roundLimit) {
    }
}
