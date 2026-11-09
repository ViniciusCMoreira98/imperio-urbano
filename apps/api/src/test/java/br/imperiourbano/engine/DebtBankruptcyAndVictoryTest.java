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
import br.imperiourbano.engine.GameCommand.SellStates;
import br.imperiourbano.engine.GameEvent.DebtSettled;
import br.imperiourbano.engine.GameEvent.GameFinished;
import br.imperiourbano.engine.GameEvent.PlayerBankrupt;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.util.List;
import org.junit.jupiter.api.Test;

class DebtBankruptcyAndVictoryTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final StateDefinition AP = CATALOG.state("AP");
    private static final StateDefinition AC = CATALOG.state("AC");

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

    /** Dívida com o banco grande o bastante para não ser quitada por uma venda. */
    private void anaOwesTheBank(int amount) {
        state = state.withPendingDebt(new Debt("ana", null, amount)).withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    /** Ana, com pouco saldo, para no Acre de Bia (4 + 6) e fica devendo o aluguel base. */
    private void anaOwesRentToBia(int anaCredits) {
        state = state.withProperty(PropertyState.purchased("AC", "bia"));
        setCredits("ana", anaCredits);
        run("ana", new RollDice(), 4, 5);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    /** Banco paga o estado inteiro (terreno + construções) pelo percentual das regras: 80% (08/11/2026). */
    private static int refund(StateDefinition state, int houses) {
        return (state.price() + houses * state.houseCost()) * CATALOG.rules().debtSale().refundPercent() / 100;
    }

    private static SellStates sell(String... ids) {
        return new SellStates(List.of(ids));
    }

    @Test
    void sellingAWholeStateSettlesTheDebtAutomatically() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AP", "ana", 2, 1, 1));
        anaOwesRentToBia(5);

        GameEngine.Result result = run("ana", sell("AP"));

        int rent = AC.rent().base();
        assertThat(result.events()).last().isEqualTo(new DebtSettled("ana", "bia", rent));
        assertThat(state.property("AP")).isEmpty();
        assertThat(state.player("ana").credits()).isEqualTo(5 + refund(AP, 2) - rent);
        assertThat(state.player("bia").credits()).isEqualTo(2500 + rent);
        assertThat(state.pendingDebt()).isNull();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void aSaleThatDoesNotCoverTheDebtIsRefused() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AP", "ana", 1, 1, 1))
                .withProperty(new PropertyState("AC", "bia", 3, 1, 1));
        setCredits("ana", 0);
        run("ana", new RollDice(), 4, 5);
        assertThat(refund(AP, 1)).isLessThan(AC.rent().house3());

        assertThatThrownBy(() -> run("ana", sell("AP"))).hasMessage("A venda não cobre a dívida. Escolha mais estados.");
        assertThat(state.property("AP")).isPresent();
        assertThat(state.pendingDebt()).isEqualTo(new Debt("ana", "bia", AC.rent().house3()));
    }

    @Test
    void salesOnlyHappenToPayADebt() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AP", "ana", 2, 1, 1));

        assertThatThrownBy(() -> run("ana", sell("AP"))).hasMessage("Só é possível vender ao banco para pagar uma dívida.");
        run("ana", new RollDice(), 4, 5);
        assertThatThrownBy(() -> run("ana", sell("AP"))).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void severalStatesAreSoldTogetherWithTheirBuildings() {
        start(GameMode.CLASSIC, "ana", "bia");
        StateDefinition rr = CATALOG.state("RR");
        state = state.withProperty(new PropertyState("AP", "ana", PropertyState.HOTEL_LEVEL, 3, 3))
                .withProperty(PropertyState.purchased("RR", "ana"));
        int hotel = (AP.price() + 4 * AP.houseCost() + AP.hotelCost()) * CATALOG.rules().debtSale().refundPercent() / 100;
        int debt = 2500 + hotel + 1;
        anaOwesTheBank(debt);

        assertThatThrownBy(() -> run("ana", sell("AP"))).isInstanceOf(RuleViolationException.class);
        run("ana", sell("AP", "RR"));

        assertThat(state.property("AP")).isEmpty();
        assertThat(state.property("RR")).isEmpty();
        assertThat(state.player("ana").credits()).isEqualTo(2500 + hotel + refund(rr, 0) - debt);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void sellingAStateReturnsItToTheBankAndRemovesOlympicHost() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(new PropertyState("AP", "ana", 2, 1, 1))
                .withOlympics(new OlympicsState(3, "AP", "ana", 4));
        anaOwesTheBank(2501);

        run("ana", sell("AP"));

        assertThat(state.property("AP")).isEmpty();
        assertThat(state.player("ana").credits()).isEqualTo(2500 + refund(AP, 2) - 2501);
        assertThat(state.olympics()).isEqualTo(new OlympicsState(3, null, null, 1));
    }

    @Test
    void canOnlySellOwnStatesEachOnce() {
        start(GameMode.CLASSIC, "ana", "bia");
        state = state.withProperty(PropertyState.purchased("AP", "ana"))
                .withProperty(PropertyState.purchased("RR", "bia"));
        anaOwesTheBank(2501);

        assertThatThrownBy(() -> run("ana", sell("RR"))).hasMessage("Você só pode vender estados que possui.");
        assertThatThrownBy(() -> run("ana", sell())).hasMessage("Escolha ao menos um estado para vender.");
        assertThatThrownBy(() -> run("ana", sell("AP", "AP"))).hasMessage("Cada estado só pode ser vendido uma vez.");
    }

    @Test
    void bankruptcyOnlyWithUnpayableDebt() {
        start(GameMode.CLASSIC, "ana", "bia");

        assertThatThrownBy(() -> run("ana", new DeclareBankruptcy())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void bankruptcyHandsAssetsToCreditorAndTurnMovesOn() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        state = state.withProperty(new PropertyState("AP", "ana", 3, 2, 2))
                .withOlympics(new OlympicsState(1, "AP", "ana", 2));
        anaOwesRentToBia(5);

        GameEngine.Result result = run("ana", new DeclareBankruptcy());

        assertThat(result.events()).containsExactly(
                new PlayerBankrupt("ana", "bia"),
                new TurnEnded("ana", "bia", 1));
        assertThat(state.player("ana").bankrupt()).isTrue();
        assertThat(state.player("ana").credits()).isZero();
        assertThat(state.player("bia").credits()).isEqualTo(2505);
        assertThat(state.property("AP")).contains(new PropertyState("AP", "bia", 3, 0, 0));
        assertThat(state.olympics().hostStateId()).isNull();
        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void bankruptPlayersAreSkipped() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        anaOwesRentToBia(5);
        run("ana", new DeclareBankruptcy());

        // Bia para no próprio Acre (fase de construção); Caio para em Rondônia, livre.
        run("bia", new RollDice(), 4, 5);
        run("bia", new GameCommand.SkipBuild());
        run("bia", new EndTurn());
        run("caio", new RollDice(), 3, 4);
        run("caio", new GameCommand.DeclinePurchase());
        run("caio", new EndTurn());

        assertThat(state.currentPlayer().id()).isEqualTo("bia");
        assertThat(state.round()).isEqualTo(2);
    }

    @Test
    void bankruptcyToTheBankFreesTheStates() {
        start(GameMode.CLASSIC, "ana", "bia", "caio");
        state = state.withProperty(new PropertyState("AP", "ana", 2, 1, 1))
                .withPendingDebt(new Debt("ana", null, 999))
                .withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION);

        run("ana", new DeclareBankruptcy());

        assertThat(state.property("AP")).isEmpty();
        assertThat(state.player("bia").credits()).isEqualTo(2500);
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
        assertThatThrownBy(() -> run("bia", new RollDice(), 4, 5))
                .hasMessage("A partida não está em andamento.");
    }

    @Test
    void quickGameEndsAfterTheRoundLimitWithHighestEquity() {
        start(GameMode.QUICK, "ana", "bia");
        state = state.withProperty(new PropertyState("AP", "ana", 1, 1, 1))
                .withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);

        GameEngine.Result result = run("bia", new EndTurn());

        assertThat(engine.equity(state, "ana")).isEqualTo(2500 + AP.price() + AP.houseCost() + AP.rent().forLevel(1));
        assertThat(result.events()).containsExactly(new GameFinished(List.of("ana")));
        assertThat(state.status()).isEqualTo(GameStatus.FINISHED);
    }

    @Test
    void quickGameTieIsBrokenByCredits() {
        start(GameMode.QUICK, "ana", "bia");
        // Mesmo patrimônio: Ana tem o Amapá (preço + aluguel atual), Bia tem esse valor em dinheiro.
        state = state.withProperty(PropertyState.purchased("AP", "ana"))
                .withTurn(1, 15, TurnPhase.AWAITING_END_TURN, 0);
        setCredits("bia", 2500 + AP.price() + AP.rent().base());

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
