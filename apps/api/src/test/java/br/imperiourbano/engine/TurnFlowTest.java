package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.DeclinePurchase;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameEvent.PlayerMoved;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TurnFlowTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final int REST_TILE = 9;

    private final GameEngine engine = new GameEngine(CATALOG);
    private final List<GameEvent> log = new ArrayList<>();
    private GameState state;

    @BeforeEach
    void startGame() {
        GameEvent started = engine.start("g1", GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"),
                new StartingPlayer("bia", "Bia"),
                new StartingPlayer("caio", "Caio")));
        log.add(started);
        state = engine.apply(null, started);
    }

    private GameEngine.Result run(String playerId, GameCommand command, Dice dice) {
        GameEngine.Result result = engine.execute(state, playerId, command, dice);
        state = result.state();
        log.addAll(result.events());
        return result;
    }

    private void roll(String playerId, int a, int b) {
        run(playerId, new RollDice(), FixedDice.of(a, b));
    }

    /** Recusa a compra pendente, se houver, e passa a vez. */
    private void endTurn(String playerId) {
        if (state.phase() == TurnPhase.AWAITING_PURCHASE) {
            run(playerId, new DeclinePurchase(), FixedDice.of());
        }
        run(playerId, new EndTurn(), FixedDice.of());
    }

    @Test
    void startsWithEveryoneOnStartWithStartingCredits() {
        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(state.round()).isEqualTo(1);
        assertThat(state.currentPlayer().id()).isEqualTo("ana");
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_ROLL);
        assertThat(state.players()).allSatisfy(p -> {
            assertThat(p.credits()).isEqualTo(1500);
            assertThat(p.position()).isZero();
        });
    }

    @Test
    void rejectsGamesOutsidePlayerLimits() {
        assertThatThrownBy(() -> engine.start("g2", GameMode.QUICK, List.of(new StartingPlayer("solo", "Solo"))))
                .isInstanceOf(RuleViolationException.class);
        assertThatThrownBy(() -> engine.start("g3", GameMode.QUICK, List.of(
                new StartingPlayer("a", "A"), new StartingPlayer("a", "A2"))))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void rollMovesTheCurrentPlayerBySum() {
        roll("ana", 3, 4);

        assertThat(state.player("ana").position()).isEqualTo(7);
        assertThat(state.lastDice()).isEqualTo(new DiceRoll(3, 4));
        // Casa 7 é o Amazonas, livre: o jogador decide se compra.
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_PURCHASE);
    }

    @Test
    void onlyTheCurrentPlayerCanAct() {
        assertThatThrownBy(() -> roll("bia", 1, 2))
                .isInstanceOf(RuleViolationException.class)
                .hasMessage("Não é a sua vez.");
    }

    @Test
    void cannotRollTwiceOrEndTurnBeforeRolling() {
        assertThatThrownBy(() -> run("ana", new EndTurn(), FixedDice.of())).isInstanceOf(RuleViolationException.class);
        roll("ana", 1, 2);
        assertThatThrownBy(() -> roll("ana", 1, 2)).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void endTurnPassesToNextPlayerAndCountsRounds() {
        roll("ana", 1, 2);
        endTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
        assertThat(state.round()).isEqualTo(1);

        roll("bia", 1, 2);
        endTurn("bia");
        roll("caio", 1, 2);
        endTurn("caio");

        assertThat(state.currentPlayer().id()).isEqualTo("ana");
        assertThat(state.round()).isEqualTo(2);
    }

    @Test
    void passingStartPaysBonus() {
        moveAnaTo(33);

        roll("ana", 2, 3);

        assertThat(state.player("ana").position()).isEqualTo(2);
        assertThat(state.player("ana").credits()).isEqualTo(1700);
    }

    @Test
    void landingExactlyOnStartPaysBonus() {
        moveAnaTo(30);

        roll("ana", 2, 4);

        assertThat(state.player("ana").position()).isZero();
        assertThat(state.player("ana").credits()).isEqualTo(1700);
    }

    @Test
    void doubleGivesAnotherRollToSamePlayer() {
        roll("ana", 2, 2);
        endTurn("ana");

        assertThat(state.currentPlayer().id()).isEqualTo("ana");
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_ROLL);

        roll("ana", 1, 2);
        endTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void thirdDoubleInRowSendsToRestWithoutMovingByDice() {
        roll("ana", 1, 1);
        endTurn("ana");
        roll("ana", 2, 2);
        endTurn("ana");
        GameEngine.Result third = run("ana", new RollDice(), FixedDice.of(3, 3));

        assertThat(third.events()).last().isEqualTo(new PlayerMoved("ana", 6, REST_TILE, 0, true));
        assertThat(state.player("ana").position()).isEqualTo(REST_TILE);
        assertThat(state.doublesInRow()).isZero();

        endTurn("ana");
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void doublesCounterResetsForNextPlayer() {
        roll("ana", 4, 4);
        endTurn("ana");
        roll("ana", 1, 2);
        endTurn("ana");

        roll("bia", 5, 5);
        assertThat(state.doublesInRow()).isEqualTo(1);
    }

    @Test
    void replayingTheLogRebuildsTheSameState() {
        roll("ana", 6, 6);
        endTurn("ana");
        roll("ana", 5, 3);
        endTurn("ana");
        roll("bia", 2, 1);

        GameState rebuilt = engine.replay(log);

        assertThat(rebuilt).isEqualTo(state);
        assertThat(rebuilt.version()).isEqualTo(log.size());
    }

    /** Leva Ana até a casa desejada e devolve a vez para ela, sem passar pelo Início. */
    private void moveAnaTo(int target) {
        int remaining = target - state.player("ana").position();
        while (remaining > 0) {
            // Passos de 3 a 11 sem dupla; nunca deixa sobrar 1 ou 2 (impossível sem dupla).
            int step = remaining <= 11 ? remaining : Math.min(11, remaining - 3);
            int first = Math.min(6, step - 1);
            int second = step - first;
            if (first == second) {
                first--;
                second++;
            }
            roll("ana", first, second);
            finishRound();
            remaining -= step;
        }
        assertThat(state.player("ana").position()).isEqualTo(target);
    }

    private void finishRound() {
        endTurn("ana");
        for (String id : List.of("bia", "caio")) {
            roll(id, 1, 2);
            endTurn(id);
        }
    }
}
