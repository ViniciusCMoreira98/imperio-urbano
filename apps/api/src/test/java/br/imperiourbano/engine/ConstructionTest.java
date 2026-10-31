package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand.Build;
import br.imperiourbano.engine.GameCommand.BuildHotel;
import br.imperiourbano.engine.GameCommand.BuyProperty;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SkipBuild;
import br.imperiourbano.engine.GameEvent.HotelBuilt;
import br.imperiourbano.engine.GameEvent.HouseBuilt;
import br.imperiourbano.engine.GameEvent.PropertyPurchased;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Construção por etapas e visitas (D4). Rolar 1 + 2 a partir do Início leva ao Amapá. */
class ConstructionTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final StateDefinition AP = CATALOG.state("AP");

    private final GameEngine engine = new GameEngine(CATALOG);
    private GameState state;

    @BeforeEach
    void startGame() {
        state = engine.apply(null, engine.start("g1", GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"),
                new StartingPlayer("bia", "Bia"))));
    }

    private GameEngine.Result run(String playerId, GameCommand command, int... dice) {
        GameEngine.Result result = engine.execute(state, playerId, command, FixedDice.of(dice));
        state = result.state();
        return result;
    }

    /** Ana já possui o Amapá com o nível e visitas informados e para nele de novo. */
    private void anaReturnsToAmapa(int level, int visits, int reachedAtVisit) {
        state = state.withProperty(new PropertyState("AP", "ana", level, visits, reachedAtVisit));
        run("ana", new RollDice(), 1, 2);
    }

    private PropertyState amapa() {
        return state.property("AP").orElseThrow();
    }

    @Test
    void buyingWithThreeHousesOnFirstVisit() {
        run("ana", new RollDice(), 1, 2);
        GameEngine.Result result = run("ana", new BuyProperty(3));

        assertThat(result.events()).containsExactly(
                new PropertyPurchased("ana", "AP", AP.price()),
                new HouseBuilt("ana", "AP", 3, 3 * AP.houseCost()));
        assertThat(amapa().buildingLevel()).isEqualTo(3);
        assertThat(state.player("ana").credits()).isEqualTo(1500 - AP.price() - 3 * AP.houseCost());
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void cannotBuyWithMoreThanThreeHouses() {
        run("ana", new RollDice(), 1, 2);

        assertThatThrownBy(() -> run("ana", new BuyProperty(4)))
                .isInstanceOf(RuleViolationException.class)
                .hasMessage("Na compra é possível construir de 0 a 3 casas.");
    }

    @Test
    void housesOnPurchaseMustFitTheBalance() {
        state = state.updatePlayer("ana", p -> p.withCredits(AP.price() + AP.houseCost()));
        run("ana", new RollDice(), 1, 2);

        assertThatThrownBy(() -> run("ana", new BuyProperty(2))).isInstanceOf(RuleViolationException.class);
        run("ana", new BuyProperty(1));
        assertThat(amapa().buildingLevel()).isEqualTo(1);
    }

    @Test
    void returningOwnerCompletesFirstStage() {
        anaReturnsToAmapa(1, 1, 1);

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_BUILD);
        assertThat(amapa().ownerVisits()).isEqualTo(2);
        assertThatThrownBy(() -> run("ana", new Build(3)))
                .hasMessage("Você pode construir de 1 a 2 casa(s) agora.");

        run("ana", new Build(2));
        assertThat(amapa().buildingLevel()).isEqualTo(3);
        assertThat(amapa().levelReachedAtVisit()).isEqualTo(2);
    }

    @Test
    void fourthHouseNeedsAVisitAfterReachingThree() {
        anaReturnsToAmapa(3, 1, 1);

        assertThatThrownBy(() -> run("ana", new Build(2))).isInstanceOf(RuleViolationException.class);
        assertThatThrownBy(() -> run("ana", new BuildHotel())).isInstanceOf(RuleViolationException.class);
        GameEngine.Result result = run("ana", new Build(1));

        assertThat(result.events()).containsExactly(new HouseBuilt("ana", "AP", 1, AP.houseCost()));
        assertThat(amapa().buildingLevel()).isEqualTo(4);
    }

    @Test
    void noFourthHouseOnTheVisitThatReachedThree() {
        anaReturnsToAmapa(2, 1, 1);
        run("ana", new Build(1));

        assertThat(amapa().buildingLevel()).isEqualTo(3);
        assertThat(engine.buildOptions(amapa())).isEqualTo(new GameEngine.BuildOptions(0, false));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void hotelReplacesFourHousesOnALaterVisit() {
        anaReturnsToAmapa(4, 2, 2);

        assertThatThrownBy(() -> run("ana", new Build(1))).isInstanceOf(RuleViolationException.class);
        GameEngine.Result result = run("ana", new BuildHotel());

        assertThat(result.events()).containsExactly(new HotelBuilt("ana", "AP", AP.hotelCost()));
        assertThat(amapa().buildingLevel()).isEqualTo(PropertyState.HOTEL_LEVEL);
        assertThat(state.player("ana").credits()).isEqualTo(1500 - AP.hotelCost());
        assertThat(engine.rentFor(state, "AP")).isEqualTo(AP.rent().hotel());
    }

    @Test
    void nothingToBuildAfterHotel() {
        anaReturnsToAmapa(PropertyState.HOTEL_LEVEL, 3, 3);

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void skippingConstructionStillCountsTheVisit() {
        anaReturnsToAmapa(3, 1, 1);
        run("ana", new SkipBuild());

        assertThat(amapa().buildingLevel()).isEqualTo(3);
        assertThat(amapa().ownerVisits()).isEqualTo(2);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void noBuildPhaseWhenOwnerCannotAffordAHouse() {
        state = state.updatePlayer("ana", p -> p.withCredits(AP.houseCost() - 1));
        anaReturnsToAmapa(1, 1, 1);

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void opponentVisitsDoNotAdvanceConstruction() {
        state = state.withProperty(new PropertyState("AP", "bia", 3, 1, 1));

        run("ana", new RollDice(), 1, 2);

        assertThat(amapa().ownerVisits()).isEqualTo(1);
        assertThatThrownBy(() -> run("ana", new Build(1))).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void constructionRaisesRentImmediately() {
        anaReturnsToAmapa(1, 1, 1);
        run("ana", new Build(2));

        assertThat(engine.rentFor(state, "AP")).isEqualTo(AP.rent().house3());
    }
}
