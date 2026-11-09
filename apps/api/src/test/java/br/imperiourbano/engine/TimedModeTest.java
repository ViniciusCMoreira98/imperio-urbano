package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameEvent.GameFinished;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameEvent.TimeLimitReached;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Modos por tempo (07/11/2026): relógio desde o início; ao acabar, termina a vez e vence o maior patrimônio. */
class TimedModeTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final Instant START = Instant.parse("2026-11-07T12:00:00Z");

    private final GameEngine engine = new GameEngine(CATALOG);
    private GameState state;

    private void start(GameMode mode) {
        state = engine.apply(null, engine.start("g1", mode,
                List.of(new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia")), START));
    }

    private List<GameEvent> applyAll(List<GameEvent> events) {
        for (GameEvent event : events) state = engine.apply(state, event);
        return events;
    }

    private GameEngine.Result run(String playerId, GameCommand command) {
        GameEngine.Result result = engine.execute(state, playerId, command, FixedDice.of());
        state = result.state();
        return result;
    }

    @Test
    void clockEndsTwentyFiveMinutesOrOneHourAfterTheStart() {
        start(GameMode.TIMED_25);
        assertThat(state.endsAt()).isEqualTo(START.plusSeconds(25 * 60).toEpochMilli());
        start(GameMode.TIMED_60);
        assertThat(state.endsAt()).isEqualTo(START.plusSeconds(60 * 60).toEpochMilli());
        start(GameMode.CLASSIC);
        assertThat(state.endsAt()).isNull();
        assertThatThrownBy(() -> engine.timeUp(state)).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void beforeTheTurnStartsTheGameEndsAtOnceWithTheRichestWinning() {
        start(GameMode.TIMED_25);
        state = state.withProperty(PropertyState.purchased("SP", "bia"));

        List<GameEvent> events = applyAll(engine.timeUp(state));

        assertThat(events).containsExactly(new TimeLimitReached(), new GameFinished(List.of("bia")));
        assertThat(state.status()).isEqualTo(GameStatus.FINISHED);
        assertThat(state.winnerIds()).containsExactly("bia");
    }

    @Test
    void midTurnThePlayerFinishesTheTurnAndThenTheGameEnds() {
        start(GameMode.TIMED_60);
        state = state.withPhase(TurnPhase.AWAITING_PURCHASE);
        state = state.updatePlayer("ana", p -> p.withCredits(3000));

        assertThat(applyAll(engine.timeUp(state))).containsExactly(new TimeLimitReached());
        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
        assertThat(state.timeUp()).isTrue();

        state = state.withPhase(TurnPhase.AWAITING_END_TURN);
        assertThat(run("ana", new EndTurn()).events()).containsExactly(new GameFinished(List.of("ana")));
        assertThat(state.status()).isEqualTo(GameStatus.FINISHED);
    }

    @Test
    void aDoubleDoesNotGiveAnExtraRollAfterTheClockEnds() {
        start(GameMode.TIMED_25);
        state = state.withDice(new DiceRoll(3, 3), 1).withPhase(TurnPhase.AWAITING_BUILD);
        applyAll(engine.timeUp(state));
        state = state.withPhase(TurnPhase.AWAITING_END_TURN);

        assertThat(run("ana", new EndTurn()).events()).singleElement().isInstanceOf(GameFinished.class);
    }

    /** Caso real de 07/11/2026: investir R$ 570 no fim não pode perder para quem guardou o dinheiro. */
    @Test
    void investedPropertiesCountTheirCurrentRentOnTopOfTheCost() {
        start(GameMode.TIMED_25);
        state = state.withProperty(new PropertyState("PB", "ana", 3, 1, 1));
        state = state.updatePlayer("ana", p -> p.withCredits(1500));

        int pbRent = CATALOG.state("PB").rent().forLevel(3);
        int pbCost = CATALOG.state("PB").price() + 3 * CATALOG.state("PB").houseCost();
        assertThat(engine.equity(state, "ana")).isEqualTo(1500 + pbCost + pbRent);
        assertThat(applyAll(engine.timeUp(state))).last().isEqualTo(new GameFinished(List.of("ana")));
    }

    @Test
    void tiedEquityAndCreditsSplitTheWin() {
        start(GameMode.TIMED_25);
        applyAll(engine.timeUp(state));
        assertThat(state.winnerIds()).containsExactlyInAnyOrder("ana", "bia");
    }
}
