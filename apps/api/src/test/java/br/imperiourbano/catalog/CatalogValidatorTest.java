package br.imperiourbano.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class CatalogValidatorTest {

    private final Catalog valid = CatalogLoader.load();

    @Test
    void detectsMissingAndDuplicatedState() {
        List<StateDefinition> states = new ArrayList<>(valid.states().subList(1, 27));
        states.add(valid.states().get(1));
        Catalog broken = new Catalog(states, valid.board(), valid.rules());

        assertThat(CatalogValidator.validate(broken)).contains(
                "Estado ausente: " + valid.states().get(0).id(),
                "Estado duplicado: " + valid.states().get(1).id());
    }

    @Test
    void detectsStateRepeatedOnBoard() {
        List<TileDefinition> tiles = new ArrayList<>(valid.board().tiles());
        TileDefinition second = tiles.get(2);
        tiles.set(2, new TileDefinition(second.index(), TileType.PROPERTY, valid.board().tiles().get(1).stateId(), null));
        BoardDefinition board = new BoardDefinition(1, valid.board().tilesPerSide(), valid.board().colorGroups(), tiles);

        assertThat(CatalogValidator.validate(new Catalog(valid.states(), board, valid.rules())))
                .anyMatch(e -> e.contains("aparece 2 vez"));
    }

    @Test
    void detectsDecreasingRent() {
        StateDefinition ac = valid.state("AC");
        RentTable bad = new RentTable(50, 40, 90, 160, 220, 300);
        List<StateDefinition> states = new ArrayList<>(valid.states());
        states.set(states.indexOf(ac), new StateDefinition(ac.id(), ac.abbreviation(), ac.name(), ac.region(),
                ac.colorGroup(), ac.price(), bad, ac.houseCost(), ac.hotelCost()));

        assertThat(CatalogValidator.validate(new Catalog(states, valid.board(), valid.rules())))
                .contains("AC: aluguéis devem ser positivos e crescentes");
    }
}
