package br.imperiourbano.catalog;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Dados estáticos do jogo, imutáveis após o carregamento. Independente do Spring. */
public final class Catalog {

    private final List<StateDefinition> states;
    private final BoardDefinition board;
    private final RulesConfig rules;
    private final Map<String, StateDefinition> statesById;

    public Catalog(List<StateDefinition> states, BoardDefinition board, RulesConfig rules) {
        this.states = List.copyOf(states);
        this.board = board;
        this.rules = rules;
        // Em caso de id duplicado mantém o primeiro; o validador reporta a duplicidade.
        this.statesById = this.states.stream()
                .collect(Collectors.toUnmodifiableMap(StateDefinition::id, Function.identity(), (a, b) -> a));
    }

    public List<StateDefinition> states() {
        return states;
    }

    public BoardDefinition board() {
        return board;
    }

    public RulesConfig rules() {
        return rules;
    }

    public StateDefinition state(String id) {
        StateDefinition state = statesById.get(id);
        if (state == null) {
            throw new NoSuchElementException("Estado inexistente: " + id);
        }
        return state;
    }

    public TileDefinition tile(int index) {
        return board.tiles().get(Math.floorMod(index, board.tileCount()));
    }
}
