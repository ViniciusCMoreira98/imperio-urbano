package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.StateDefinition;
import br.imperiourbano.engine.GameCommand.DeclareBankruptcy;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SellBuilding;
import br.imperiourbano.engine.GameCommand.SellProperty;
import br.imperiourbano.engine.GameEvent.DebtSettled;
import br.imperiourbano.engine.GameEvent.GameFinished;
import br.imperiourbano.engine.GameEvent.PlayerBankrupt;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.util.List;
import org.junit.jupiter.api.Test;

class DebtBankruptcyAndVictoryTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final StateDefinition AC = CATALOG.state("AC");
    private static final StateDefinition AP = CATALOG.state("AP");

    private final GameEngine engine = new GameEngine(CATALOG);
    private GameState state;

    private void start(GameMode mode, String... ids) {
        List<StartingPlayer> players = java.util.Arrays.stream(ids).map(id -> new StartingPlayer(id, id)).toList();
        state = engine.apply(null, engine.start("g1", mode, players));
    }

    private GameEngine.Result run(String playerId, GameCommand command, int... dice) {
        GameEngine.Result result = engine.execute(state, playerId, command, FixedDice.of(dice));
        state = result.state();
        return result;
    }

    private void setCredits(String playerId, int credits) {
        state = state.updatePlayer(playerId, p -> p.withCredits(credits));
    }

    /** Ana, com pouco saldo, para no Amapá de Bia (1 + 2) e fica devendo o aluguel base. */
    private void anaOwesRentToBia(int anaCredits) {
        state = state.withProperty(PropertyState.purchased("AP", "bia"));
        setCredits("ana", anaCredits);
        run("ana", new RollDice(), 1, 2);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    @Test
    void sellingAHouseSettlesTheDebtAutomatically() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AC", "ana", 2, 1, 1));
        anaOwesRentToBia(5);

        GameEngine.Result result = run("ana", new SellBuilding("AC"));

        int refund = AC.houseCost() / 2;
        int rent = AP.rent().base();
        assertThat(result.events()).last().isEqualTo(new DebtSettled("ana", "bia", rent));
        assertThat(state.property("AC").orElseThrow().buildingLevel()).isEqualTo(1);
        assertThat(state.player("ana").credits()).isEqualTo(5 + refund - rent);
        assertThat(state.player("bia").credits()).isEqualTo(1500 + rent);
        assertThat(state.pendingDebt()).isNull();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void debtStaysWhileSalesAreNotEnough() {
        start(GameMode.CLASSIC, "ana", "bia");
        // Amapá de Bia com 3 casas: aluguel maior que a venda de uma casa do Acre.
        state = state.withProperty(new PropertyState("AC", "ana", 1, 1, 1))
                .withProperty(new PropertyState("AP", "bia", 3, 1, 1));
        setCredits("ana", 0);
        run("ana", new RollDice(), 1, 2);
        assertThat(AC.houseCost() / 2).isLessThan(AP.rent().house3());

        run("ana", new SellBuilding("AC"));

        assertThat(state.player("ana").credits()).isEqualTo(AC.houseCost() / 2);
        assertThat(state.pendingDebt()).isEqualTo(new Debt("ana", "bia", AP.rent().house3()));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    @Test
    void sellingAHotelGoesBackToFourHouses() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AC", "ana", PropertyState.HOTEL_LEVEL, 3, 3));

        run("ana", new SellBuilding("AC"));

        assertThat(state.property("AC").orElseThrow().buildingLevel()).isEqualTo(4);
        assertThat(state.player("ana").credits()).isEqualTo(1500 + AC.hotelCost() / 2);
    }

    @Test
    void sellingAStateReturnsItToTheBankAndRemovesOlympicHost() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AC", "ana", 2, 1, 1))
                .withOlympics(new OlympicsState(3, "AC", "ana", 4));

        run("ana", new SellProperty("AC"));

        assertThat(state.property("AC")).isEmpty();
        assertThat(state.player("ana").credits()).isEqualTo(1500 + (AC.price() + 2 * AC.houseCost()) / 2);
        assertThat(state.olympics()).isEqualTo(new OlympicsState(3, null, null, 1));
    }

    @Test
    void canOnlySellOwnStatesAndExistingBuildings() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(PropertyState.purchased("AC", "ana"))
                .withProperty(PropertyState.purchased("RR", "bia"));

        assertThatThrownBy(() -> run("ana", new SellProperty("RR")))
                .hasMessage("Você só pode vender estados que possui.");
        assertThatThrownBy(() -> run("ana", new SellBuilding("AC")))
                .hasMessage("Não há construções para vender neste estado.");
        assertThatThrownBy(() -> run("ana", new SellProperty(null))).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void bankruptcyOnlyWithUnpayableDebt() {
        start(GameMode.CLASSIC, "ana", "bia");

        assertThatThrownBy(() -> run("ana", new DeclareBankruptcy())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void bankruptcyHandsAssetsToCreditorAndTurnMovesOn() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        state = state.withProperty(new PropertyState("AC", "ana", 3, 2, 2))
                .withOlympics(new OlympicsState(1, "AC", "ana", 2));
        anaOwesRentToBia(5);

        GameEngine.Result result = run("ana", new DeclareBankruptcy());

        assertThat(result.events()).containsExactly(
                new PlayerBankrupt("ana", "bia"),
                new TurnEnded("ana", "bia", 1));
        assertThat(state.player("ana").bankrupt()).isTrue();
        assertThat(state.player("ana").credits()).isZero();
        assertThat(state.player("bia").credits()).isEqualTo(1505);
        assertThat(state.property("AC")).contains(new PropertyState("AC", "bia", 3, 0, 0));
        assertThat(state.olympics().hostStateId()).isNull();
        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void bankruptPlayersAreSkipped() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        anaOwesRentToBia(5);
        run("ana", new DeclareBankruptcy());

        // Bia para no próprio Amapá (fase de construção); Caio para em Rondônia, livre.
        run("bia", new RollDice(), 1, 2);
        run("bia", new GameCommand.SkipBuild());
        run("bia", new EndTurn());
        run("caio", new RollDice(), 2, 3);
        run("caio", new GameCommand.DeclinePurchase());
        run("caio", new EndTurn());

        assertThat(state.currentPlayer().id()).isEqualTo("bia");
        assertThat(state.round()).isEqualTo(2);
    }

    @Test
    void bankruptcyToTheBankFreesTheStates() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        state = state.withProperty(new PropertyState("AC", "ana", 2, 1, 1))
                .withPendingDebt(new Debt("ana", null, 999))
                .withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION);

        run("ana", new DeclareBankruptcy());

        assertThat(state.property("AC")).isEmpty();
        assertThat(state.player("bia").credits()).isEqualTo(1500);
    }

    @Test
    void lastPlayerStandingWinsTheClassicGame() {
        start(GameMode.CLASSIC, "ana", "bia");
        anaOwesRentToBia(5);

        GameEngine.Result result = run("ana", new DeclareBankruptcy());

        assertThat(result.events()).last().isEqualTo(new GameFinished(List.of("bia")));
        assertThat(state.status()).isEqualTo(GameStatus.FINISHED);
        assertThat(state.winnerIds()).containsExactly("bia");
        assertThat(state.phase()).isNull();
        assertThatThrownBy(() -> run("bia", new RollDice(), 1, 2))
                .hasMessage("A partida não está em andamento.");
    }

    @Test
    void quickGameEndsAfterTheRoundLimitWithHighestEquity() {
        start(GameMode.QUICK, "ana", "bia");
        state = state.withProperty(new PropertyState("AC", "ana", 1, 1, 1))
                .withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);

        GameEngine.Result result = run("bia", new EndTurn());

        assertThat(engine.equity(state, "ana")).isEqualTo(1500 + AC.price() + AC.houseCost());
        assertThat(result.events()).containsExactly(new GameFinished(List.of("ana")));
        assertThat(state.status()).isEqualTo(GameStatus.FINISHED);
    }

    @Test
    void quickGameTieIsBrokenByCredits() {
        start(GameMode.QUICK, "ana", "bia");
        // Mesmo patrimônio: Ana tem o Acre, Bia tem o valor dele em dinheiro.
        state = state.withProperty(PropertyState.purchased("AC", "ana"))
                .withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);
        setCredits("bia", 1500 + AC.price());

        run("bia", new EndTurn());

        assertThat(state.winnerIds()).containsExactly("bia");
    }

    @Test
    void quickGameExactTieHasSeveralWinners() {
        start(GameMode.QUICK, "ana", "bia");
        state = state.withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);

        run("bia", new EndTurn());

        assertThat(state.winnerIds()).containsExactlyInAnyOrder("ana", "bia");
    }

    @Test
    void classicGameIgnoresTheRoundLimit() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);

        run("bia", new EndTurn());

        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(state.round()).isEqualTo(16);
    }
}
