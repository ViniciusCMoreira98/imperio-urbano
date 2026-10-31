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
    private final List<EventCard> eventCards;
    private final Map<String, StateDefinition> statesById;
    private final Map<String, EventCard> cardsById;

    public Catalog(List<StateDefinition> states, BoardDefinition board, RulesConfig rules, List<EventCard> eventCards) {
        this.states = List.copyOf(states);
        this.board = board;
        this.rules = rules;
        this.eventCards = List.copyOf(eventCards);
        // Em caso de id duplicado mantém o primeiro; o validador reporta a duplicidade.
        this.statesById = this.states.stream()
                .collect(Collectors.toUnmodifiableMap(StateDefinition::id, Function.identity(), (a, b) -> a));
        this.cardsById = this.eventCards.stream()
                .collect(Collectors.toUnmodifiableMap(EventCard::id, Function.identity(), (a, b) -> a));
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

    public List<EventCard> eventCards() {
        return eventCards;
    }

    public StateDefinition state(String id) {
        StateDefinition state = statesById.get(id);
        if (state == null) {
            throw new NoSuchElementException("Estado inexistente: " + id);
        }
        return state;
    }

    public EventCard eventCard(String id) {
        EventCard card = cardsById.get(id);
        if (card == null) {
            throw new NoSuchElementException("Carta inexistente: " + id);
        }
        return card;
    }

    public TileDefinition tile(int index) {
        return board.tiles().get(Math.floorMod(index, board.tileCount()));
    }
}
