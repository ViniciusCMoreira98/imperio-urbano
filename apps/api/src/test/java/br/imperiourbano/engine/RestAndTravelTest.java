package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.ChooseTravel;
import br.imperiourbano.engine.GameCommand.DeclinePurchase;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameEvent.TaxPaid;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.RestLeft;
import br.imperiourbano.engine.GameEvent.RestTurnLost;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TravelChosen;
import br.imperiourbano.engine.GameEvent.TravelDeclined;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RestAndTravelTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final int REST_TILE = 17;
    private static final int TRAVEL_TILE = 26;
    private static final int TRAVEL_FEE = CATALOG.rules().nationalTravel().fee();
    private static final int TAX_TILE = 21;

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

    private void placeAna(int position) {
        state = state.updatePlayer("ana", p -> p.withPosition(position));
    }

    /** Recusa a compra, se oferecida, e passa a vez. */
    private void finishTurn(String playerId) {
        if (state.phase() == TurnPhase.AWAITING_PURCHASE) run(playerId, new DeclinePurchase());
        run(playerId, new EndTurn());
    }

    /** Bia joga uma vez sem dupla (1 + 3, a partir da casa onde estiver) e devolve a vez. */
    private void biaPlays() {
        run("bia", new RollDice(), 1, 3);
        finishTurn("bia");
    }

    private void anaRestingAtRest() {
        state = state.updatePlayer("ana", p -> p.withPosition(REST_TILE).withSkipTurns(1));
    }

    private void anaChoosingTravel() {
        state = state.updatePlayer("ana", p -> p.withPosition(TRAVEL_TILE).withTravelPending(true))
                .withPhase(TurnPhase.AWAITING_TRAVEL_DESTINATION);
    }

    /** Duas rodadas no Descanso (pedido do usuário, 11/11/2026). */
    @Test
    void landingOnRestCostsTheNextTwoTurns() {
        assertThat(CATALOG.rules().rest().turnsLost()).isEqualTo(2);
        placeAna(REST_TILE - 3);
        run("ana", new RollDice(), 1, 2);
        assertThat(state.player("ana").skipTurns()).isEqualTo(2);
        finishTurn("ana");
        biaPlays();

        GameEngine.Result lost = run("ana", new RollDice(), 2, 3);

        assertThat(lost.events()).last().isEqualTo(new RestTurnLost("ana"));
        assertThat(state.player("ana").position()).isEqualTo(REST_TILE);
        assertThat(state.player("ana").skipTurns()).isEqualTo(1);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);

        finishTurn("ana");
        biaPlays();
        assertThat(run("ana", new RollDice(), 2, 3).events()).last().isEqualTo(new RestTurnLost("ana"));
        assertThat(state.player("ana").position()).isEqualTo(REST_TILE);
        assertThat(state.player("ana").skipTurns()).isZero();

        finishTurn("ana");
        biaPlays();
        run("ana", new RollDice(), 2, 3);
        assertThat(state.player("ana").position()).isEqualTo(REST_TILE + 5);
    }

    @Test
    void doubleLeavesRestRightAwayWithoutExtraRoll() {
        anaRestingAtRest();

        GameEngine.Result result = run("ana", new RollDice(), 3, 3);

        assertThat(result.events()).contains(new RestLeft("ana"));
        assertThat(state.player("ana").position()).isEqualTo(REST_TILE + 6);
        assertThat(state.player("ana").skipTurns()).isZero();
        finishTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void restingPlayerStillCollectsRent() {
        anaRestingAtRest();
        state = state.withProperty(PropertyState.purchased("AC", "ana"))
                .withTurn(1, 1, TurnPhase.AWAITING_ROLL, 0);

        run("bia", new RollDice(), 4, 5);

        assertThat(state.player("ana").credits()).isEqualTo(2500 + CATALOG.state("AC").rent().base());
    }

    @Test
    void thirdDoubleInRowAlsoCostsTheNextTurn() {
        state = state.withDice(new DiceRoll(2, 2), 2);

        run("ana", new RollDice(), 3, 3);

        assertThat(state.player("ana").position()).isEqualTo(REST_TILE);
        assertThat(state.player("ana").skipTurns()).isEqualTo(CATALOG.rules().rest().turnsLost());
    }

    @Test
    void landingOnNationalTravelOffersTravelOnTheNextTurn() {
        placeAna(TRAVEL_TILE - 3);
        run("ana", new RollDice(), 1, 2);

        assertThat(state.player("ana").travelPending()).isTrue();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);

        finishTurn("ana");
        biaPlays();

        assertThat(state.currentPlayer().id()).isEqualTo("ana");
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_TRAVEL_DESTINATION);
    }

    @Test
    void travelPaysTheFeeAndResolvesTheDestination() {
        anaChoosingTravel();

        GameEngine.Result result = run("ana", new ChooseTravel(32));

        assertThat(result.events()).first().isEqualTo(new TravelChosen("ana", 32, TRAVEL_FEE));
        assertThat(state.player("ana").position()).isEqualTo(32);
        assertThat(state.player("ana").credits()).isEqualTo(2500 - TRAVEL_FEE);
        assertThat(state.player("ana").travelPending()).isFalse();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_PURCHASE);
    }

    /** Depois da viagem e da casa de destino, rola os dados na mesma vez (pedido do usuário, 11/11/2026). */
    @Test
    void afterTravellingThePlayerStillRollsTheDice() {
        anaChoosingTravel();
        run("ana", new ChooseTravel(32));
        finishTurn("ana");

        assertThat(state.currentPlayer().id()).isEqualTo("ana");
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_ROLL);
        assertThat(state.player("ana").rollAfterTravel()).isFalse();

        run("ana", new RollDice(), 1, 2);
        assertThat(state.player("ana").position()).isEqualTo((32 + 3) % 34);
        finishTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void decliningTheTravelGivesNoSecondRoll() {
        anaChoosingTravel();
        run("ana", new RollDice(), 1, 2);
        finishTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void travelPastStartPaysTheBonus() {
        anaChoosingTravel();

        run("ana", new ChooseTravel(1));

        assertThat(state.player("ana").credits()).isEqualTo(2500 - TRAVEL_FEE + CATALOG.rules().passStartBonus());
    }

    @Test
    void travelDestinationMustBeAState() {
        anaChoosingTravel();

        // O próprio Aeroporto, fora do tabuleiro, e casas especiais (Início, Olimpíadas, Descanso, Taxa).
        for (int invalid : new int[] {TRAVEL_TILE, -1, 34, 0, 8, 17, 21}) {
            assertThatThrownBy(() -> run("ana", new ChooseTravel(invalid)))
                    .hasMessage("Escolha um estado como destino da viagem.");
        }
    }

    @Test
    void rollingDeclinesTheTravel() {
        anaChoosingTravel();

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(result.events()).first().isEqualTo(new TravelDeclined("ana"));
        assertThat(state.player("ana").position()).isEqualTo(TRAVEL_TILE + 3);
        assertThat(state.player("ana").travelPending()).isFalse();
        assertThat(state.player("ana").credits()).isEqualTo(2500);
    }

    @Test
    void landingOnTaxPaysIntoTheSaquePool() {
        placeAna(TAX_TILE - 3);

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        // Sem estados, o patrimônio é o saldo: 10% de 2500.
        assertThat(result.events()).last().isEqualTo(new TaxPaid("ana", 250));
        assertThat(state.player("ana").credits()).isEqualTo(2250);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void taxWithoutBalanceBecomesDebtToTheBank() {
        placeAna(TAX_TILE - 3);
        state = state.withProperty(PropertyState.purchased("AC", "ana")).updatePlayer("ana", p -> p.withCredits(5));
        int tax = engine.equity(state, "ana") / 10;

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(result.events()).last().isEqualTo(new DebtIncurred("ana", null, tax, true));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    @Test
    void noTravelOfferWithoutCreditsForTheFee() {
        placeAna(TRAVEL_TILE - 3);
        state = state.updatePlayer("ana", p -> p.withCredits(TRAVEL_FEE - 1));
        run("ana", new RollDice(), 1, 2);
        finishTurn("ana");
        biaPlays();

        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_ROLL);
        assertThatThrownBy(() -> run("ana", new ChooseTravel(32))).isInstanceOf(RuleViolationException.class);
        run("ana", new RollDice(), 1, 2);
        assertThat(state.player("ana").travelPending()).isFalse();
    }
}
