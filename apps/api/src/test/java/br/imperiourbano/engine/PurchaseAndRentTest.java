package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.RulesConfig;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand.BuyProperty;
import br.imperiourbano.engine.GameCommand.DeclinePurchase;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.PropertyPurchased;
import br.imperiourbano.engine.GameEvent.RentPaid;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PurchaseAndRentTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    /** Rolar 4 + 6 a partir do Início leva à casa 10 (Acre). */
    private static final StateDefinition AC = CATALOG.state("AC");

    private GameEngine engine = new GameEngine(CATALOG);
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

    private void giveTo(String ownerId, String... stateIds) {
        for (String id : stateIds) {
            state = state.withProperty(PropertyState.purchased(id, ownerId));
        }
    }

    private void setCredits(String playerId, int credits) {
        state = state.updatePlayer(playerId, p -> p.withCredits(credits));
    }

    @Test
    void landingOnFreeStateOffersPurchase() {
        run("ana", new RollDice(), 4, 6);

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_PURCHASE);
    }

    @Test
    void buyingTransfersOwnershipAndChargesPrice() {
        run("ana", new RollDice(), 4, 6);
        GameEngine.Result result = run("ana", new BuyProperty(0));

        assertThat(result.events()).containsExactly(new PropertyPurchased("ana", "AC", AC.price()));
        assertThat(state.player("ana").credits()).isEqualTo(1500 - AC.price());
        assertThat(state.property("AC")).hasValueSatisfying(p -> {
            assertThat(p.ownerId()).isEqualTo("ana");
            assertThat(p.buildingLevel()).isZero();
            assertThat(p.ownerVisits()).isEqualTo(1);
        });
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void decliningKeepsStateWithTheBank() {
        run("ana", new RollDice(), 4, 6);
        run("ana", new DeclinePurchase());

        assertThat(state.property("AC")).isEmpty();
        assertThat(state.player("ana").credits()).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void cannotBuyOutsidePurchasePhase() {
        assertThatThrownBy(() -> run("ana", new BuyProperty(0)))
                .isInstanceOf(RuleViolationException.class)
                .hasMessage("Não há estado para comprar agora.");
    }

    @Test
    void noPurchaseOfferWithoutEnoughCredits() {
        setCredits("ana", AC.price() - 1);

        run("ana", new RollDice(), 4, 6);

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
        assertThatThrownBy(() -> run("ana", new BuyProperty(0))).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void opponentPaysBaseRentAutomatically() {
        run("ana", new RollDice(), 4, 6);
        run("ana", new BuyProperty(0));
        run("ana", new EndTurn());

        GameEngine.Result result = run("bia", new RollDice(), 4, 6);

        int rent = AC.rent().base();
        assertThat(result.events()).last().isEqualTo(new RentPaid("bia", "ana", "AC", rent));
        assertThat(state.player("bia").credits()).isEqualTo(1500 - rent);
        assertThat(state.player("ana").credits()).isEqualTo(1500 - AC.price() + rent);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void rentFollowsBuildingLevel() {
        state = state.withProperty(new PropertyState("AC", "bia", 3, 2, 1));

        run("ana", new RollDice(), 4, 6);

        assertThat(state.player("ana").credits()).isEqualTo(1500 - AC.rent().house3());
    }

    @Test
    void landingOnOwnStateChargesNothing() {
        giveTo("ana", "AC");

        GameEngine.Result result = run("ana", new RollDice(), 4, 6);

        assertThat(result.events()).noneMatch(e -> e instanceof RentPaid);
        assertThat(state.player("ana").credits()).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_BUILD);
    }

    @Test
    void rentAboveBalanceBecomesPendingDebt() {
        giveTo("bia", "AC");
        setCredits("ana", 5);

        GameEngine.Result result = run("ana", new RollDice(), 4, 6);

        assertThat(result.events()).last().isEqualTo(new DebtIncurred("ana", "bia", AC.rent().base()));
        assertThat(state.pendingDebt()).isEqualTo(new Debt("ana", "bia", AC.rent().base()));
        assertThat(state.player("ana").credits()).isEqualTo(5);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
        assertThatThrownBy(() -> run("ana", new EndTurn())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void fullColorGroupMultipliesBaseRentWhenConfigured() {
        RulesConfig rules = CATALOG.rules();
        RulesConfig doubled = new RulesConfig(rules.version(), rules.players(), rules.startingCredits(),
                rules.passStartBonus(), rules.dice(),
                new RulesConfig.ConstructionRules(4, 3, false, 2),
                rules.olympics(), rules.rest(), rules.nationalTravel(), rules.tax(), rules.turnTimers(), rules.abandonment(), rules.modes());
        engine = new GameEngine(new Catalog(CATALOG.states(), CATALOG.board(), doubled, CATALOG.eventCards()));
        giveTo("bia", "AC", "RR", "AP");

        run("ana", new RollDice(), 4, 6);

        assertThat(state.player("ana").credits()).isEqualTo(1500 - 2 * AC.rent().base());
    }

    @Test
    void groupBonusDoesNotApplyWithDefaultRules() {
        giveTo("bia", "AC", "RR", "AP");

        assertThat(engine.rentFor(state, "AC")).isEqualTo(AC.rent().base());
        assertThat(engine.rentFor(state, "AM")).isZero();
    }
}
