package br.imperiourbano.catalog;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/** Mesmas verificações de packages/game-data/src/validate.ts, aplicadas no boot do servidor. */
public final class CatalogValidator {

    public static final List<String> ALL_STATE_IDS = List.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
            "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    private static final List<TileType> REQUIRED_SPECIALS = List.of(
            TileType.START, TileType.OLYMPICS, TileType.VISIT, TileType.REST, TileType.EVENT, TileType.NATIONAL_TRAVEL);

    private CatalogValidator() {
    }

    /** Retorna a lista de erros; vazia quando o catálogo é consistente. */
    public static List<String> validate(Catalog catalog) {
        List<String> errors = new ArrayList<>();
        validateStates(catalog, errors);
        validateBoard(catalog.board(), errors);
        validateRules(catalog.rules(), errors);
        return errors;
    }

    private static void validateStates(Catalog catalog, List<String> errors) {
        Map<String, Long> counts = catalog.states().stream()
                .collect(Collectors.groupingBy(StateDefinition::id, Collectors.counting()));
        for (String id : ALL_STATE_IDS) {
            long count = counts.getOrDefault(id, 0L);
            if (count == 0) errors.add("Estado ausente: " + id);
            if (count > 1) errors.add("Estado duplicado: " + id);
        }
        counts.keySet().stream()
                .filter(id -> !ALL_STATE_IDS.contains(id))
                .forEach(id -> errors.add("Estado desconhecido: " + id));

        Set<String> groupIds = catalog.board().colorGroups().stream().map(ColorGroup::id).collect(Collectors.toSet());
        Set<Integer> prices = new HashSet<>();
        for (StateDefinition s : catalog.states()) {
            if (!s.id().equals(s.abbreviation())) errors.add(s.id() + ": sigla diferente do id");
            if (!groupIds.contains(s.colorGroup())) errors.add(s.id() + ": grupo de cor inexistente " + s.colorGroup());
            if (s.price() < 100 || s.price() > 500) errors.add(s.id() + ": preço fora de 100–500");
            if (!isStrictlyIncreasingPositive(s.rent().ladder())) {
                errors.add(s.id() + ": aluguéis devem ser positivos e crescentes");
            }
            if (s.houseCost() <= 0 || s.hotelCost() <= 0) errors.add(s.id() + ": custos de construção inválidos");
            prices.add(s.price());
        }
        if (prices.size() != catalog.states().size()) errors.add("Preços de compra repetidos");
    }

    private static void validateBoard(BoardDefinition board, List<String> errors) {
        int expected = board.tilesPerSide() * 4;
        if (board.tileCount() != expected) {
            errors.add("Tabuleiro deve ter " + expected + " casas, possui " + board.tileCount());
        }
        for (int i = 0; i < board.tileCount(); i++) {
            if (board.tiles().get(i).index() != i) {
                errors.add("Casa na posição " + i + " com índice " + board.tiles().get(i).index());
            }
        }
        Map<String, Long> onBoard = board.tiles().stream()
                .filter(t -> t.type() == TileType.PROPERTY)
                .collect(Collectors.groupingBy(t -> String.valueOf(t.stateId()), Collectors.counting()));
        for (String id : ALL_STATE_IDS) {
            long count = onBoard.getOrDefault(id, 0L);
            if (count != 1) errors.add("Estado " + id + " aparece " + count + " vez(es) no tabuleiro");
        }
        Set<TileType> present = board.tiles().stream().map(TileDefinition::type).collect(Collectors.toSet());
        REQUIRED_SPECIALS.stream()
                .filter(type -> !present.contains(type))
                .forEach(type -> errors.add("Casa especial ausente: " + type));
        if (board.tileCount() == 0 || board.tiles().getFirst().type() != TileType.START) {
            errors.add("A casa 0 deve ser o Início");
        }
    }

    private static void validateRules(RulesConfig rules, List<String> errors) {
        int[] m = rules.olympics().multipliers().stream().mapToInt(Integer::intValue).toArray();
        if (m.length == 0 || m[0] != 2 || m[m.length - 1] != 10 || !isStrictlyIncreasingPositive(m)) {
            errors.add("Multiplicadores olímpicos devem crescer de ×2 a ×10");
        }
        if (rules.construction().firstVisitMaxHouses() > rules.construction().maxHouses()) {
            errors.add("Casas da primeira visita excedem o máximo");
        }
        if (!rules.modes().keySet().containsAll(Arrays.asList(GameMode.values()))) {
            errors.add("Configuração ausente para algum modo de jogo");
        }
    }

    private static boolean isStrictlyIncreasingPositive(int[] values) {
        for (int i = 0; i < values.length; i++) {
            if (values[i] <= 0 || (i > 0 && values[i] <= values[i - 1])) return false;
        }
        return true;
    }
}
