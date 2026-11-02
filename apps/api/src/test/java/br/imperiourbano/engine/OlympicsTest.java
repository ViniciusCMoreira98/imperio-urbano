package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand.HostOlympics;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SkipOlympics;
import br.imperiourbano.engine.GameEvent.OlympicsHostSelected;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OlympicsTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final int OLYMPICS_TILE = 9;
    private static final int FEE = CATALOG.rules().olympics().hostFee();
    private static final StateDefinition AC = CATALOG.state("AC");

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

    private void give(String ownerId, String stateId) {
        state = state.withProperty(PropertyState.purchased(stateId, ownerId));
    }

    /** Ana sai três casas antes e para nas Olimpíadas com 1 + 2. */
    private void anaLandsOnOlympics() {
        state = state.updatePlayer("ana", p -> p.withPosition(OLYMPICS_TILE - 3));
        run("ana", new RollDice(), 1, 2);
    }

    @Test
    void ownerLandingOnOlympicsChoosesAHost() {
        give("ana", "AC");
        anaLandsOnOlympics();

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_OLYMPICS_HOST);
    }

    @Test
    void firstEditionDoublesTheHostRent() {
        give("ana", "AC");
        anaLandsOnOlympics();
        GameEngine.Result result = run("ana", new HostOlympics("AC"));

        assertThat(result.events()).containsExactly(new OlympicsHostSelected("ana", "AC", 1, 2, FEE));
        assertThat(state.olympics()).isEqualTo(new OlympicsState(1, "AC", "ana", 2));
        assertThat(state.player("ana").credits()).isEqualTo(1500 - FEE);
        assertThat(engine.rentFor(state, "AC")).isEqualTo(2 * AC.rent().base());
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void newEditionMovesTheHostAndRaisesTheMultiplier() {
        give("ana", "AC");
        give("ana", "AP");
        state = state.withOlympics(new OlympicsState(1, "AC", "ana", 2));
        anaLandsOnOlympics();
        run("ana", new HostOlympics("AP"));

        assertThat(state.olympics()).isEqualTo(new OlympicsState(2, "AP", "ana", 3));
        assertThat(engine.rentFor(state, "AC")).isEqualTo(AC.rent().base());
        assertThat(engine.rentFor(state, "AP")).isEqualTo(3 * CATALOG.state("AP").rent().base());
    }

    @Test
    void multiplierStopsAtTen() {
        give("ana", "AC");
        state = state.withOlympics(new OlympicsState(9, "AC", "ana", 10));
        anaLandsOnOlympics();
        run("ana", new HostOlympics("AC"));

        assertThat(state.olympics()).isEqualTo(new OlympicsState(10, "AC", "ana", 10));
    }

    @Test
    void multiplierAppliesOverBuildings() {
        state = state.withProperty(new PropertyState("AC", "bia", 3, 1, 1))
                .withOlympics(new OlympicsState(2, "AC", "bia", 3));

        run("ana", new RollDice(), 4, 6);

        assertThat(state.player("ana").credits()).isEqualTo(1500 - 3 * AC.rent().house3());
    }

    @Test
    void cannotHostWithAnotherPlayersState() {
        give("ana", "AC");
        give("bia", "AP");
        anaLandsOnOlympics();

        assertThatThrownBy(() -> run("ana", new HostOlympics("AP")))
                .isInstanceOf(RuleViolationException.class)
                .hasMessage("Escolha um estado que você possui para sediar as Olimpíadas.");
        assertThatThrownBy(() -> run("ana", new HostOlympics("SP"))).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void noHostingWithoutProperties() {
        anaLandsOnOlympics();

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void noHostingWithoutCreditsForTheFee() {
        give("ana", "AC");
        state = state.updatePlayer("ana", p -> p.withCredits(FEE - 1));
        anaLandsOnOlympics();

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void skippingKeepsTheCurrentEdition() {
        give("ana", "AC");
        state = state.withOlympics(new OlympicsState(1, "AC", "ana", 2));
        anaLandsOnOlympics();
        run("ana", new SkipOlympics());

        assertThat(state.olympics()).isEqualTo(new OlympicsState(1, "AC", "ana", 2));
        assertThat(state.player("ana").credits()).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void cannotHostOutsideTheOlympicsTile() {
        give("ana", "AC");

        assertThatThrownBy(() -> run("ana", new HostOlympics("AC"))).isInstanceOf(RuleViolationException.class);
    }
}
