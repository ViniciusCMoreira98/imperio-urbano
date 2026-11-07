package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.catalog.TileType;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.UseRestPass;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.PlayerMoved;
import br.imperiourbano.engine.GameEvent.RentPaid;
import br.imperiourbano.engine.GameEvent.RentWaived;
import br.imperiourbano.engine.GameEvent.RentWaiverGranted;
import br.imperiourbano.engine.GameEvent.RestPassGranted;
import br.imperiourbano.engine.GameEvent.RestPassUsed;
import br.imperiourbano.engine.GameEvent.RestTurnLost;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TurnEnded;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Cartas de 07/11/2026: Descanso merecido, Passe Livre (guardado, uso manual) e Aluguel Zero (guardado, uso automático). */
class StoredItemCardsTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final int REST_TILE = restTile();

    private final GameEngine engine = new GameEngine(CATALOG, new Random(42));
    private final List<GameEvent> log = new ArrayList<>();
    private GameState state;

    @BeforeEach
    void startGame() {
        GameStarted started = engine.start("g1", GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"),
                new StartingPlayer("bia", "Bia")));
        log.add(started);
        state = engine.apply(null, started);
    }

    private GameEngine.Result run(String playerId, GameCommand command, int... dice) {
        GameEngine.Result result = engine.execute(state, playerId, command, FixedDice.of(dice));
        state = result.state();
        log.addAll(result.events());
        return result;
    }

    /** Rolar 1 + 3 do Início leva à casa 4 (Eventos) com a carta no topo. */
    private GameEngine.Result anaDraws(String cardId) {
        state = state.withEventDeck(new EventDeck(List.of(cardId), 0));
        return run("ana", new RollDice(), 1, 3);
    }

    private PlayerState ana() {
        return state.player("ana");
    }

    private void anaAtRest(int passes) {
        state = state.updatePlayer("ana", p -> p.withPosition(REST_TILE).withSkipTurns(1).withRestPasses(passes));
    }

    // Descanso merecido

    @Test
    void restCardSendsStraightToRestWithoutStartBonus() {
        GameEngine.Result result = anaDraws("descanso-merecido");

        assertThat(result.events()).contains(new PlayerMoved("ana", 4, REST_TILE, 0, true));
        assertThat(ana().position()).isEqualTo(REST_TILE);
        assertThat(ana().skipTurns()).isEqualTo(1);
        assertThat(ana().credits()).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void restCardAfterADoubleGivesNoExtraRoll() {
        state = state.withEventDeck(new EventDeck(List.of("descanso-merecido"), 0));
        run("ana", new RollDice(), 2, 2);

        GameEngine.Result end = run("ana", new EndTurn());

        assertThat(end.events()).contains(new TurnEnded("ana", "bia", 1));
    }

    // Passe Livre

    @Test
    void restPassCardIsKept() {
        GameEngine.Result result = anaDraws("passe-livre");

        assertThat(result.events()).contains(new RestPassGranted("ana"));
        assertThat(ana().restPasses()).isEqualTo(1);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void restPassLeavesRestAndThePlayerRollsNormally() {
        anaAtRest(1);

        GameEngine.Result used = run("ana", new UseRestPass());

        assertThat(used.events()).containsExactly(new RestPassUsed("ana"));
        assertThat(ana().skipTurns()).isZero();
        assertThat(ana().restPasses()).isZero();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_ROLL);

        GameEngine.Result roll = run("ana", new RollDice(), 1, 2);

        assertThat(roll.events()).noneMatch(e -> e instanceof RestTurnLost);
        assertThat(ana().position()).isEqualTo(REST_TILE + 3);
    }

    @Test
    void restPassNeedsToBeAtRest() {
        state = state.updatePlayer("ana", p -> p.withRestPasses(1));

        assertThatThrownBy(() -> run("ana", new UseRestPass())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void restPassNeedsAPass() {
        anaAtRest(0);

        assertThatThrownBy(() -> run("ana", new UseRestPass())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void restPassOnlyBeforeRolling() {
        anaAtRest(1);
        run("ana", new RollDice(), 1, 2); // sem dupla: perde a jogada

        assertThatThrownBy(() -> run("ana", new UseRestPass())).isInstanceOf(RuleViolationException.class);
        assertThat(ana().restPasses()).isEqualTo(1);
    }

    @Test
    void restPassOnlyOnOwnTurn() {
        state = state.updatePlayer("bia", p -> p.withPosition(REST_TILE).withSkipTurns(1).withRestPasses(1));

        assertThatThrownBy(() -> run("bia", new UseRestPass())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void withoutUsingThePassTheRestRuleIsUnchanged() {
        anaAtRest(1);

        GameEngine.Result roll = run("ana", new RollDice(), 1, 2);

        assertThat(roll.events()).contains(new RestTurnLost("ana"));
        assertThat(ana().restPasses()).isEqualTo(1);
    }

    // Aluguel Zero

    @Test
    void rentWaiverCardIsKept() {
        GameEngine.Result result = anaDraws("aluguel-zero");

        assertThat(result.events()).contains(new RentWaiverGranted("ana"));
        assertThat(ana().rentWaivers()).isEqualTo(1);
    }

    @Test
    void rentWaiverIsSpentAutomaticallyOnTheNextOpponentRent() {
        int ap = CATALOG.tileIndex("AP");
        int rent = CATALOG.state("AP").rent().base();
        state = state.withProperty(PropertyState.purchased("AP", "bia"))
                .updatePlayer("ana", p -> p.withPosition(ap - 3).withRentWaivers(1));

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(result.events()).contains(new RentWaived("ana", "bia", "AP", rent));
        assertThat(result.events()).noneMatch(e -> e instanceof RentPaid || e instanceof DebtIncurred);
        assertThat(ana().rentWaivers()).isZero();
        assertThat(ana().credits()).isEqualTo(1500);
        assertThat(state.player("bia").credits()).isEqualTo(1500);
    }

    @Test
    void rentWaiverAlsoAvoidsADebt() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "bia"))
                .updatePlayer("ana", p -> p.withPosition(ap - 3).withCredits(0).withRentWaivers(1));

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(result.events()).anyMatch(e -> e instanceof RentWaived);
        assertThat(state.pendingDebt()).isNull();
    }

    @Test
    void rentWaiverIsKeptOnABlackedOutState() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "bia").withBlackout(3))
                .updatePlayer("ana", p -> p.withPosition(ap - 3).withRentWaivers(1));

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(result.events()).noneMatch(e -> e instanceof RentWaived);
        assertThat(ana().rentWaivers()).isEqualTo(1);
    }

    @Test
    void rentWaiverIsKeptOnOwnState() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "ana"))
                .updatePlayer("ana", p -> p.withPosition(ap - 3).withRentWaivers(1));

        run("ana", new RollDice(), 1, 2);

        assertThat(ana().rentWaivers()).isEqualTo(1);
    }

    @Test
    void secondRentIsPaidAfterTheWaiverIsSpent() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "bia"))
                .updatePlayer("ana", p -> p.withPosition(ap - 3).withRentWaivers(1));
        run("ana", new RollDice(), 1, 2);
        state = state.updatePlayer("ana", p -> p.withPosition(ap - 3)).withPhase(TurnPhase.AWAITING_ROLL);

        GameEngine.Result second = run("ana", new RollDice(), 1, 2);

        assertThat(second.events()).anyMatch(e -> e instanceof RentPaid);
    }

    @Test
    void bankruptcyLosesStoredItems() {
        PlayerState broke = new PlayerState("x", "X", 10, 0, false, 1, true, 2, 3).asBankrupt();

        assertThat(broke.restPasses()).isZero();
        assertThat(broke.rentWaivers()).isZero();
    }

    @Test
    void replayReproducesStoredItems() {
        anaDraws("passe-livre");
        run("ana", new EndTurn());
        state = state.withEventDeck(new EventDeck(List.of("aluguel-zero"), 0));
        run("bia", new RollDice(), 1, 3);

        GameState replayed = engine.replay(log);

        assertThat(replayed.player("ana").restPasses()).isEqualTo(1);
        assertThat(replayed.player("bia").rentWaivers()).isEqualTo(1);
    }

    private static int restTile() {
        for (int i = 0; i < CATALOG.board().tileCount(); i++) {
            if (CATALOG.tile(i).type() == TileType.REST) return i;
        }
        throw new IllegalStateException();
    }
}
