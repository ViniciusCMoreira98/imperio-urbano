package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.DeclareBankruptcy;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SellStates;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.DebtSettled;
import br.imperiourbano.engine.GameEvent.SaqueCollected;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TaxPaid;
import br.imperiourbano.persistence.GameJson;
import java.util.List;
import org.junit.jupiter.api.Test;

/** A Taxa enche um fundo; quem para no Saque leva tudo e o fundo volta a zero. */
class TaxAndSaqueTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    /** Fundo de exemplo para os testes do Saque. */
    private static final int TAX = 100;
    private static final int TAX_TILE = CATALOG.tileIndex("TAX");
    private static final int SAQUE_TILE = CATALOG.tileIndex("SAQUE");

    private final GameEngine engine = new GameEngine(CATALOG);
    private GameState state = engine.apply(null, engine.start("g1", GameMode.CLASSIC,
            List.of(new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia"))));

    private GameEngine.Result run(GameCommand command, int... dice) {
        GameEngine.Result result = engine.execute(state, "ana", command, FixedDice.of(dice));
        state = result.state();
        return result;
    }

    /** Ana a 6 casas (2 + 4, sem dupla) do destino. */
    private void anaSixStepsBefore(int tile, int credits) {
        state = state.updatePlayer("ana", p -> p.withPosition(tile - 6).withCredits(credits));
    }

    @Test
    void theBoardHasThirtyFourTilesWithRnBeforeAmAndTheSaqueBetweenAlAndCe() {
        assertThat(CATALOG.board().tiles()).hasSize(34);
        assertThat(CATALOG.tileIndex("RN")).isEqualTo(1);
        assertThat(CATALOG.tileIndex("AM")).isEqualTo(2);
        assertThat(SAQUE_TILE).isEqualTo(CATALOG.tileIndex("AL") + 1).isEqualTo(CATALOG.tileIndex("CE") - 1);
    }

    @Test
    void taxGoesToThePoolInsteadOfTheBank() {
        anaSixStepsBefore(TAX_TILE, 1000);

        GameEngine.Result result = run(new RollDice(), 2, 4);

        // Sem estados, o patrimônio é o saldo: 10% de 1000.
        assertThat(result.events()).contains(new TaxPaid("ana", 100));
        assertThat(state.player("ana").credits()).isEqualTo(900);
        assertThat(state.taxPool()).isEqualTo(100);
    }

    @Test
    void taxIsTenPercentOfTheWholeEquityRoundedDown() {
        state = state.withProperty(PropertyState.purchased("AC", "ana")).withProperty(PropertyState.purchased("SP", "ana"));
        anaSixStepsBefore(TAX_TILE, 1234);
        int equity = engine.equity(state, "ana");
        assertThat(equity).isGreaterThan(1234);

        GameEngine.Result result = run(new RollDice(), 2, 4);

        assertThat(result.events()).contains(new TaxPaid("ana", equity / 10));
        assertThat(state.player("ana").credits()).isEqualTo(1234 - equity / 10);
    }

    @Test
    void landingOnSaqueTakesTheWholePoolAndEmptiesIt() {
        state = state.withTaxPool(3 * TAX);
        anaSixStepsBefore(SAQUE_TILE, 100);

        GameEngine.Result result = run(new RollDice(), 2, 4);

        assertThat(result.events()).contains(new SaqueCollected("ana", 3 * TAX));
        assertThat(state.player("ana").credits()).isEqualTo(100 + 3 * TAX);
        assertThat(state.taxPool()).isZero();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void anEmptyPoolPaysNothing() {
        anaSixStepsBefore(SAQUE_TILE, 100);

        GameEngine.Result result = run(new RollDice(), 2, 4);

        assertThat(result.events()).noneMatch(e -> e instanceof SaqueCollected);
        assertThat(state.player("ana").credits()).isEqualTo(100);
    }

    @Test
    void anUnpaidTaxBecomesADebtThatStillFillsThePoolWhenSettled() {
        // Pouco saldo e um estado: 10% do patrimônio passa do saldo.
        state = state.withProperty(PropertyState.purchased("AC", "ana"));
        anaSixStepsBefore(TAX_TILE, 5);
        int tax = engine.equity(state, "ana") / 10;
        assertThat(tax).isGreaterThan(5);

        GameEngine.Result landed = run(new RollDice(), 2, 4);
        assertThat(landed.events()).contains(new DebtIncurred("ana", null, tax, true));
        assertThat(state.pendingDebt().toTaxPool()).isTrue();

        GameEngine.Result sold = run(new SellStates(java.util.List.of("AC")));

        assertThat(sold.events()).last().isEqualTo(new DebtSettled("ana", null, tax));
        assertThat(state.taxPool()).isEqualTo(tax);
    }

    @Test
    void bankruptcyOnTheTaxSendsTheRemainingCreditsToThePool() {
        state = state.withProperty(PropertyState.purchased("AC", "ana"));
        anaSixStepsBefore(TAX_TILE, 5);
        run(new RollDice(), 2, 4);

        run(new DeclareBankruptcy());

        assertThat(state.player("ana").bankrupt()).isTrue();
        assertThat(state.taxPool()).isEqualTo(5);
    }

    @Test
    void otherBankDebtsDoNotFillThePool() {
        state = state.withPendingDebt(new Debt("ana", null, 9_999)).withPhase(TurnPhase.AWAITING_DEBT_RESOLUTION)
                .updatePlayer("ana", p -> p.withCredits(50));

        run(new DeclareBankruptcy());

        assertThat(state.taxPool()).isZero();
    }

    @Test
    void thePoolSurvivesPersistence() {
        state = state.withTaxPool(250).withPendingDebt(new Debt("ana", null, TAX, true));

        GameState read = GameJson.readState(GameJson.write(state));

        assertThat(read.taxPool()).isEqualTo(250);
        assertThat(read.pendingDebt().toTaxPool()).isTrue();
        assertThat(GameJson.readEvent(GameJson.write(new DebtIncurred("ana", null, TAX, true))))
                .isEqualTo(new DebtIncurred("ana", null, TAX, true));
    }
}
