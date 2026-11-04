package br.imperiourbano.game;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.Dice;
import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.TurnPhase;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.lobby.LobbyView;
import br.imperiourbano.persistence.GameStore;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

/**
 * Dados sempre 3 + 5 (Ana para no Acre, livre); prazos curtos: 3 s para rolar, 1 s para decidir,
 * 1,5 s para pagar dívida e 300 ms entre jogadas do modo automático. As duas começam conectadas.
 */
@SpringBootTest
@Import({TestcontainersConfiguration.class, TurnAutomationTest.Config.class})
class TurnAutomationTest {

    @TestConfiguration
    static class Config {
        @Bean
        @Primary
        Dice fixedDice() {
            return () -> new DiceRoll(3, 5);
        }

        @Bean
        @Primary
        TurnTimeouts fastTimeouts(Catalog catalog) {
            return new TurnTimeouts(Duration.ofSeconds(3), Duration.ofSeconds(1), Duration.ofMillis(1500), Duration.ofMillis(300), catalog);
        }
    }

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    GameService games;

    @Autowired
    GameStore store;

    @Autowired
    TurnTimer timer;

    @Autowired
    Presence presence;

    @Autowired
    GameEngine engine;

    @Autowired
    Catalog catalog;

    private GuestPrincipal ana;
    private GuestPrincipal bia;
    private String gameId;

    @BeforeEach
    void startGame() {
        ana = sessions.create("Ana").player();
        bia = sessions.create("Bia").player();
        LobbyView room = lobby.create(ana, GameMode.CLASSIC);
        gameId = room.gameId();
        lobby.join(bia, room.inviteCode());
        lobby.setReady(ana, gameId, true);
        lobby.setReady(bia, gameId, true);
        presence.joined(gameId, ana.playerId());
        presence.joined(gameId, bia.playerId());
        lobby.start(ana, gameId);
    }

    private GameState state() {
        return store.loadSnapshot(gameId).orElseThrow();
    }

    private GameService.Outcome send(GuestPrincipal player, GameCommand command) {
        return games.execute(gameId, player.playerId(),
                new CommandEnvelope(UUID.randomUUID().toString(), state().version(), command));
    }

    @Test
    void firstTurnStartsWithADeadline() {
        assertThat(timer.remainingMillis(gameId)).isPresent();
        assertThat(timer.remainingMillis(gameId).getAsLong()).isBetween(1L, 3000L);
    }

    @Test
    void buyingEndsTheTurnAutomatically() {
        send(ana, new GameCommand.RollDice());
        assertThat(state().phase()).isEqualTo(TurnPhase.AWAITING_PURCHASE);

        GameService.Outcome bought = send(ana, new GameCommand.BuyProperty(0));

        assertThat(bought).isInstanceOf(GameService.Applied.class);
        assertThat(((GameService.Applied) bought).events())
                .anyMatch(e -> e instanceof GameEvent.PropertyPurchased)
                .last().isEqualTo(new GameEvent.TurnEnded(ana.playerId(), bia.playerId(), 1));
        assertThat(state().currentPlayer().id()).isEqualTo(bia.playerId());
        assertThat(state().phase()).isEqualTo(TurnPhase.AWAITING_ROLL);
    }

    @Test
    void idlePlayerRollsAndLosesThePurchaseWhenTimeRunsOut() throws InterruptedException {
        long deadline = System.nanoTime() + Duration.ofSeconds(10).toNanos();
        while (!state().currentPlayer().id().equals(bia.playerId()) && System.nanoTime() < deadline) {
            Thread.sleep(100);
        }

        List<GameEvent> log = store.loadEvents(gameId);
        assertThat(log).contains(
                new GameEvent.DiceRolled(ana.playerId(), new DiceRoll(3, 5)),
                new GameEvent.PurchaseDeclined(ana.playerId(), "AC"),
                new GameEvent.TurnEnded(ana.playerId(), bia.playerId(), 1));
        assertThat(state().property("AC")).isEmpty();
    }

    @Test
    void disconnectedPlayerIsPlayedAutomaticallyRightAway() throws InterruptedException {
        presence.left(gameId, ana.playerId());
        long start = System.nanoTime();
        games.announce(gameId);

        while (!state().currentPlayer().id().equals(bia.playerId()) && System.nanoTime() - start < Duration.ofSeconds(5).toNanos()) {
            Thread.sleep(50);
        }

        // Rolou e recusou a compra em segundos, sem esperar os prazos de 3 s + 1 s.
        assertThat(Duration.ofNanos(System.nanoTime() - start)).isLessThan(Duration.ofMillis(2_500));
        assertThat(store.loadEvents(gameId)).contains(new GameEvent.PurchaseDeclined(ana.playerId(), "AC"));
        // Bia está conectada: a vez dela volta ao prazo normal.
        assertThat(timer.remainingMillis(gameId).getAsLong()).isGreaterThan(1_000L);
    }

    @Test
    void abandonedGameWaitsAndResumesWhenSomeoneReturns() throws InterruptedException {
        presence.left(gameId, bia.playerId());
        presence.left(gameId, ana.playerId());
        games.announce(gameId);
        long version = state().version();

        Thread.sleep(3_500);
        assertThat(state().version()).isEqualTo(version);

        presence.joined(gameId, ana.playerId());
        games.announce(gameId);
        assertThat(timer.remainingMillis(gameId).getAsLong()).isGreaterThan(2_000L);

        long deadline = System.nanoTime() + Duration.ofSeconds(6).toNanos();
        while (state().version() == version && System.nanoTime() < deadline) {
            Thread.sleep(100);
        }
        assertThat(store.loadEvents(gameId)).contains(new GameEvent.DiceRolled(ana.playerId(), new DiceRoll(3, 5)));
    }

    @Test
    void connectedPlayerInDebtSellsEverythingNeededWhenTimeRunsOut() throws InterruptedException {
        // Ana tem SP com 2 casas e deve ao banco o saldo mais uma casa e pouco: precisa de duas vendas.
        GameState before = state();
        int houseRefund = catalog.state("SP").houseCost() / 2;
        List<GameEvent> holdings = List.of(new GameEvent.PropertyPurchased(ana.playerId(), "SP", 0),
                new GameEvent.HouseBuilt(ana.playerId(), "SP", 2, 0));
        GameState owning = applyAll(before, holdings);
        List<GameEvent> events = new ArrayList<>(holdings);
        events.add(new GameEvent.DebtIncurred(ana.playerId(), null, owning.player(ana.playerId()).credits() + houseRefund + 1));
        store.append(gameId, before.version(), events, applyAll(before, events), null, null);
        long start = System.nanoTime();
        games.announce(gameId);
        assertThat(timer.remainingMillis(gameId).getAsLong()).isBetween(1_000L, 1_500L);

        long deadline = start + Duration.ofSeconds(5).toNanos();
        while (state().phase() == TurnPhase.AWAITING_DEBT_RESOLUTION && System.nanoTime() < deadline) {
            Thread.sleep(50);
        }

        // As duas vendas saem no mesmo prazo, sem esperar outro prazo a cada venda.
        assertThat(Duration.ofNanos(System.nanoTime() - start)).isLessThan(Duration.ofMillis(2_500));
        List<GameEvent> log = store.loadEvents(gameId);
        assertThat(log.stream().filter(e -> e.equals(new GameEvent.BuildingSold(ana.playerId(), "SP", houseRefund)))).hasSize(2);
        assertThat(log).anyMatch(e -> e instanceof GameEvent.DebtSettled settled && settled.debtorId().equals(ana.playerId()));
        assertThat(state().player(ana.playerId()).bankrupt()).isFalse();
        assertThat(state().property("SP")).hasValueSatisfying(p -> assertThat(p.buildingLevel()).isZero());
    }

    private GameState applyAll(GameState state, List<GameEvent> events) {
        for (GameEvent event : events) state = engine.apply(state, event);
        return state;
    }

    @Test
    void actingBeforeTheDeadlineIsNotOverridden() throws InterruptedException {
        send(ana, new GameCommand.RollDice());
        send(ana, new GameCommand.BuyProperty(1));
        long version = state().version();

        Thread.sleep(500);

        assertThat(state().property("AC")).hasValueSatisfying(p -> assertThat(p.buildingLevel()).isEqualTo(1));
        assertThat(state().version()).isEqualTo(version);
    }
}
