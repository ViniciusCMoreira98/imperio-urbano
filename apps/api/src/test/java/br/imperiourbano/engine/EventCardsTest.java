package br.imperiourbano.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.CatalogLoader;
import br.imperiourbano.catalog.EventCard;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameCommand.ChooseEventTarget;
import br.imperiourbano.engine.GameCommand.EndTurn;
import br.imperiourbano.engine.GameCommand.RollDice;
import br.imperiourbano.engine.GameCommand.SkipEventTarget;
import br.imperiourbano.engine.GameEvent.BlackoutStarted;
import br.imperiourbano.engine.GameEvent.CreditsFromBank;
import br.imperiourbano.engine.GameEvent.CreditsToBank;
import br.imperiourbano.engine.GameEvent.DebtIncurred;
import br.imperiourbano.engine.GameEvent.EventCardDrawn;
import br.imperiourbano.engine.GameEvent.EventCardWithoutEffect;
import br.imperiourbano.engine.GameEvent.EventTargetRequested;
import br.imperiourbano.engine.GameEvent.EventTargetSkipped;
import br.imperiourbano.engine.GameEvent.GameStarted;
import br.imperiourbano.engine.GameEvent.OlympicsHostAppointed;
import br.imperiourbano.engine.GameEvent.PropertyBurned;
import br.imperiourbano.engine.GameEvent.RentPaid;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Rolar 1 + 3 a partir do Início leva à casa 4 (Eventos). Baralho brasileiro de 6 cartas (06/11/2026). */
class EventCardsTest {

    private static final Catalog CATALOG = CatalogLoader.load();

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

    private void give(String ownerId, String stateId) {
        state = state.withProperty(PropertyState.purchased(stateId, ownerId));
    }

    @Test
    void deckHasTheSixBrazilianCards() {
        assertThat(CATALOG.eventCards()).extracting(EventCard::id).containsExactlyInAnyOrder(
                "assalto", "caramelo-viral", "incendio", "visita-olimpica", "escolha-sede", "apagao");
    }

    @Test
    void startShufflesTheWholeDeckOnce() {
        GameStarted started = (GameStarted) log.getFirst();

        assertThat(started.eventDeck())
                .containsExactlyInAnyOrderElementsOf(CATALOG.eventCards().stream().map(EventCard::id).toList());
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
    void oldDeckWithRemovedCardsStillDraws() {
        state = state.withEventDeck(new EventDeck(List.of("festa-junina", "carona"), 0));

        GameEngine.Result result = run("ana", new RollDice(), 1, 3);

        assertThat(result.events()).anyMatch(e -> e instanceof EventCardDrawn);
    }

    @Test
    void viralDanceGains300() {
        GameEngine.Result result = anaDraws("caramelo-viral");

        assertThat(result.events()).contains(new CreditsFromBank("ana", 300));
        assertThat(credits("ana")).isEqualTo(1800);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void robberyPays200ToTheBank() {
        GameEngine.Result result = anaDraws("assalto");

        assertThat(result.events()).last().isEqualTo(new CreditsToBank("ana", 200));
        assertThat(credits("ana")).isEqualTo(1300);
    }

    @Test
    void robberyWithoutBalanceBecomesDebtToTheBank() {
        state = state.updatePlayer("ana", p -> p.withCredits(30));

        GameEngine.Result result = anaDraws("assalto");

        assertThat(result.events()).last().isEqualTo(new DebtIncurred("ana", null, 200));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_DEBT_RESOLUTION);
    }

    @Test
    void fireAsksForAnOpponentStateAndFreesItWithoutBuildings() {
        give("ana", "AC");
        state = state.withProperty(new PropertyState("AP", "bia", 3, 2, 2));

        GameEngine.Result drawn = anaDraws("incendio");
        assertThat(drawn.events()).last().isEqualTo(new EventTargetRequested("ana", "incendio"));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_EVENT_TARGET);
        assertThat(state.eventDeck().pendingCardId()).isEqualTo("incendio");
        assertThat(engine.eventTargets(state, "ana", CATALOG.eventCard("incendio").effect())).containsExactly("AP");

        assertThatThrownBy(() -> run("ana", new ChooseEventTarget("AC"))).isInstanceOf(RuleViolationException.class);
        GameEngine.Result chosen = run("ana", new ChooseEventTarget("AP"));

        assertThat(chosen.events()).containsExactly(new PropertyBurned("ana", "AP", "bia"));
        assertThat(state.property("AP")).isEmpty();
        assertThat(credits("bia")).isEqualTo(1500);
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
        assertThat(state.eventDeck().pendingCardId()).isNull();
    }

    @Test
    void fireOnTheOlympicHostRemovesTheHost() {
        give("bia", "AP");
        state = state.withOlympics(new OlympicsState(2, "AP", "bia", 3));
        anaDraws("incendio");

        run("ana", new ChooseEventTarget("AP"));

        assertThat(state.olympics()).isEqualTo(new OlympicsState(2, null, null, 1));
    }

    @Test
    void targetCardWithoutCandidatesHasNoEffect() {
        give("ana", "AC");

        GameEngine.Result result = anaDraws("apagao");

        assertThat(result.events()).last().isEqualTo(new EventCardWithoutEffect("ana", "apagao"));
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void timeoutSkipsTheChoiceAndTheCardHasNoEffect() {
        give("bia", "AP");
        anaDraws("incendio");

        GameEngine.Result result = run("ana", new SkipEventTarget());

        assertThat(result.events()).containsExactly(new EventTargetSkipped("ana", "incendio"));
        assertThat(state.property("AP")).isPresent();
        assertThat(state.phase()).isEqualTo(TurnPhase.AWAITING_END_TURN);
    }

    @Test
    void cannotEndTurnWhileChoosingTheTarget() {
        give("bia", "AP");
        anaDraws("incendio");

        assertThatThrownBy(() -> run("ana", new EndTurn())).isInstanceOf(RuleViolationException.class);
    }

    @Test
    void blackoutStopsRentUntilTheOwnerLandsThreeTimes() {
        give("bia", "AP");
        anaDraws("apagao");
        assertThatThrownBy(() -> run("ana", new ChooseEventTarget("AC"))).isInstanceOf(RuleViolationException.class);

        GameEngine.Result chosen = run("ana", new ChooseEventTarget("AP"));

        assertThat(chosen.events()).containsExactly(new BlackoutStarted("ana", "AP", 3));
        assertThat(engine.rentFor(state, "AP")).isZero();
        PropertyState ap = state.property("AP").orElseThrow();
        assertThat(ap.blackoutVisitsLeft()).isEqualTo(3);

        // Duas visitas do dono: ainda sem luz; a terceira devolve o aluguel.
        state = state.withProperty(ap.withOwnerVisit().withOwnerVisit());
        assertThat(engine.rentFor(state, "AP")).isZero();
        state = state.withProperty(state.property("AP").orElseThrow().withOwnerVisit());
        assertThat(engine.rentFor(state, "AP")).isEqualTo(CATALOG.state("AP").rent().base());
    }

    @Test
    void landingOnABlackedOutStatePaysNoRent() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "bia").withBlackout(3))
                .updatePlayer("ana", p -> p.withPosition(ap - 3));

        GameEngine.Result result = run("ana", new RollDice(), 1, 2);

        assertThat(state.player("ana").position()).isEqualTo(ap);
        assertThat(result.events()).noneMatch(e -> e instanceof RentPaid);
        assertThat(credits("ana")).isEqualTo(1500);
    }

    @Test
    void ownerLandingCountsTowardsTheEndOfTheBlackout() {
        int ap = CATALOG.tileIndex("AP");
        state = state.withProperty(PropertyState.purchased("AP", "ana").withBlackout(3))
                .updatePlayer("ana", p -> p.withPosition(ap - 3));

        run("ana", new RollDice(), 1, 2);

        assertThat(state.property("AP").orElseThrow().blackoutVisitsLeft()).isEqualTo(2);
    }

    @Test
    void anotherBlackoutRestartsTheCount() {
        state = state.withProperty(PropertyState.purchased("AP", "bia").withBlackout(1));
        anaDraws("apagao");

        run("ana", new ChooseEventTarget("AP"));

        assertThat(state.property("AP").orElseThrow().blackoutVisitsLeft()).isEqualTo(3);
    }

    @Test
    void newOwnerEndsTheBlackout() {
        PropertyState dark = PropertyState.purchased("AP", "bia").withBlackout(3);

        assertThat(dark.transferredTo("caio").blackout()).isFalse();
    }

    @Test
    void hostChoiceAppointsAnyOwnedStateWithoutFee() {
        give("bia", "AP");
        give("ana", "AC");
        anaDraws("escolha-sede");
        assertThat(engine.eventTargets(state, "ana", CATALOG.eventCard("escolha-sede").effect()))
                .containsExactly("AC", "AP");
        assertThatThrownBy(() -> run("ana", new ChooseEventTarget("RR"))).isInstanceOf(RuleViolationException.class);

        GameEngine.Result chosen = run("ana", new ChooseEventTarget("AP"));

        assertThat(chosen.events()).containsExactly(new OlympicsHostAppointed("ana", "AP", "bia", 1, 2));
        assertThat(state.olympics()).isEqualTo(new OlympicsState(1, "AP", "bia", 2));
        assertThat(credits("ana")).isEqualTo(1500);
    }

    @Test
    void hostChoiceWithoutOwnedStatesHasNoEffect() {
        GameEngine.Result result = anaDraws("escolha-sede");

        assertThat(result.events()).last().isEqualTo(new EventCardWithoutEffect("ana", "escolha-sede"));
    }

    @Test
    void olympicVisitGoesToTheHostAndPaysTheMultipliedRent() {
        give("bia", "AP");
        state = state.withOlympics(new OlympicsState(1, "AP", "bia", 2));

        anaDraws("visita-olimpica");

        assertThat(state.player("ana").position()).isEqualTo(CATALOG.tileIndex("AP"));
        assertThat(credits("ana")).isEqualTo(1500 - 2 * CATALOG.state("AP").rent().base());
    }

    @Test
    void olympicVisitPassingStartPaysTheBonus() {
        // Do Acre (9), 1 + 3 cai em Eventos (13); voltar ao Acre passa pelo Início.
        give("bia", "AC");
        state = state.withOlympics(new OlympicsState(1, "AC", "bia", 2));
        int events = eventsTileAfter(CATALOG.tileIndex("AC"));
        state = state.updatePlayer("ana", p -> p.withPosition(events - 4));
        nextCard("visita-olimpica");

        run("ana", new RollDice(), 1, 3);

        assertThat(state.player("ana").position()).isEqualTo(CATALOG.tileIndex("AC"));
        assertThat(credits("ana")).isEqualTo(1500 + CATALOG.rules().passStartBonus() - 2 * CATALOG.state("AC").rent().base());
    }

    @Test
    void olympicVisitWithoutHostHasNoEffect() {
        GameEngine.Result result = anaDraws("visita-olimpica");

        assertThat(result.events()).last().isEqualTo(new EventCardWithoutEffect("ana", "visita-olimpica"));
        assertThat(state.player("ana").position()).isEqualTo(4);
    }

    @Test
    void replayReproducesCardEffects() {
        anaDraws("caramelo-viral");
        run("ana", new EndTurn());

        assertThat(engine.replay(log).players()).isEqualTo(state.players());
    }

    /** Primeira casa de Eventos depois de {@code from} no percurso. */
    private static int eventsTileAfter(int from) {
        int count = CATALOG.board().tileCount();
        for (int step = 1; step <= count; step++) {
            int index = (from + step) % count;
            if (CATALOG.tile(index).type() == br.imperiourbano.catalog.TileType.EVENT) return index;
        }
        throw new IllegalStateException();
    }
}
