package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.EventCard;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameEvent.CreditsToBank;
import br.imperiourbano.engine.GameEvent.CreditsTransferred;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.EventCardDrawn;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Rolar 1 + 3 a partir do Início leva à casa 4 (Eventos). */
class EventCardsTest {

    private static final Catalog CATALOG = CatalogLoader.load();
    private static final int REST_TILE = 9;

    private final GameEngine engine = new GameEngine(CATALOG, new Random(42));
    private final List<GameEvent> log = new ArrayList<>();
    private GameState state;

    @BeforeEach
    void startGame() {
        GameStarted started = engine.start("g1", GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"),
                new StartingPlayer("bia", "Bia"),
                new StartingPlayer("caio", "Caio")));
        log.add(started);
        state = engine.apply(null, started);
    }

    private GameEngine.Result run(String playerId, GameCommand command, int... dice) {
        GameEngine.Result result = engine.execute(state, playerId, command, FixedDice.of(dice));
        state = result.state();
        log.addAll(result.events());
        return result;
    }

    /** Coloca a carta no topo do baralho. */
    private void nextCard(String cardId) {
        state = state.withEventDeck(new EventDeck(List.of(cardId), 0));
    }

    private GameEngine.Result anaDraws(String cardId) {
        nextCard(cardId);
        return run("ana", new RollDice(), 1, 3);
    }

    private int credits(String playerId) {
        return state.player(playerId).credits();
    }

    @Test
    void startShufflesTheWholeDeckOnce() {
        GameStarted started = (GameStarted) log.getFirst();

        assertThat(started.eventDeck())
                .containsExactlyInAnyOrderElementsOf(CATALOG.eventCards().stream().map(EventCard::id).toList())
                .isNotEqualTo(CATALOG.eventCards().stream().map(EventCard::id).toList());
        assertThat(state.eventDeck().next()).isZero();
    }

    @Test
    void landingOnEventsDrawsTheTopCardAndAdvancesTheDeck() {
        GameState before = state;
        String top = before.eventDeck().peek();

        GameEngine.Result result = engine.execute(before, "ana", new RollDice(), FixedDice.of(1, 3));

        assertThat(result.events()).contains(new EventCardDrawn("ana", top));
        assertThat(result.state().eventDeck().next()).isEqualTo(1);
    }

    @Test
    void deckStartsOverAfterTheLastCard() {
        List<String> order = CATALOG.eventCards().stream().map(EventCard::id).toList();
        state = state.withEventDeck(new EventDeck(order, order.size() - 1));

        run("ana", new RollDice(), 1, 3);

        assertThat(state.eventDeck().next()).isZero();
    }

    @Test
    void gainCardPaysFromTheBank() {
        anaDraws("festa-junina");

        assertThat(credits("ana")).isEqualTo(1600);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void payCardChargesToTheBank() {
        GameEngine.Result result = anaDraws("oficina");

        assertThat(result.events()).last().isEqualTo(new CreditsToBank("ana", 100));
        assertThat(credits("ana")).isEqualTo(1400);
    }

    @Test
    void payCardWithoutBalanceBecomesDebtToTheBank() {
        state = state.updatePlayer("ana", p -> p.withCredits(30));

        GameEngine.Result result = anaDraws("multa-transito");

        assertThat(result.events()).last().isEqualTo(new DebtIncurred("ana", null, 50));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    @Test
    void repairsChargePerHouseAndHotel() {
        state = state.withProperty(new PropertyState("AC", "ana", 2, 1, 1))
                .withProperty(new PropertyState("RR", "ana", PropertyState.HOTEL_LEVEL, 3, 3))
                .withProperty(new PropertyState("AP", "ana", 0, 1, 1));

        anaDraws("reforma-urbana");

        assertThat(credits("ana")).isEqualTo(1500 - (2 * 25 + 100));
    }

    @Test
    void repairsWithoutBuildingsCostNothing() {
        GameEngine.Result result = anaDraws("reforma-urbana");

        assertThat(result.events()).noneMatch(e -> e instanceof CreditsToBank);
        assertThat(credits("ana")).isEqualTo(1500);
    }

    @Test
    void birthdayCollectsFromEachPlayerWithinTheirBalance() {
        state = state.updatePlayer("caio", p -> p.withCredits(20));

        GameEngine.Result result = anaDraws("aniversario");

        assertThat(result.events()).contains(
                new CreditsTransferred("bia", "ana", 50),
                new CreditsTransferred("caio", "ana", 20));
        assertThat(credits("ana")).isEqualTo(1570);
        assertThat(credits("caio")).isZero();
    }

    @Test
    void moveToStateResolvesTheNewTile() {
        anaDraws("voo-sao-paulo");

        assertThat(state.player("ana").position()).isEqualTo(35);
        assertThat(credits("ana")).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_PURCHASE);
    }

    @Test
    void moveToStartPaysTheBonus() {
        state = state.updatePlayer("ana", p -> p.withPosition(27));
        nextCard("volta-ao-inicio");

        run("ana", new RollDice(), 1, 3);

        assertThat(state.player("ana").position()).isZero();
        assertThat(credits("ana")).isEqualTo(1700);
    }

    @Test
    void moveBackChargesRentAtTheNewTileWithoutBonus() {
        state = state.withProperty(PropertyState.purchased("AC", "bia"));

        anaDraws("estrada-interditada");

        assertThat(state.player("ana").position()).isEqualTo(1);
        assertThat(credits("ana")).isEqualTo(1500 - CATALOG.state("AC").rent().base());
    }

    @Test
    void moveForwardByThree() {
        anaDraws("carona");

        assertThat(state.player("ana").position()).isEqualTo(7);
    }

    @Test
    void restCardEndsTheDoublesSequence() {
        nextCard("feriado-prolongado");
        run("ana", new RollDice(), 2, 2);

        assertThat(state.player("ana").position()).isEqualTo(REST_TILE);
        run("ana", new EndTurn());
        assertThat(state.currentPlayer().id()).isEqualTo("bia");
    }

    @Test
    void replayReproducesCardEffects() {
        anaDraws("aniversario");
        run("ana", new EndTurn());

        assertThat(engine.replay(log).players()).isEqualTo(state.players());
    }
}
