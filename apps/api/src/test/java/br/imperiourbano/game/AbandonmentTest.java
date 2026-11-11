package br.imperiourbano.game;

import static org.assertj.core.api.Assertions.assertThat;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import br.imperiourbano.identity.GuestPrincipal;
import br.imperiourbano.identity.GuestSessionService;
import br.imperiourbano.lobby.LobbyService;
import br.imperiourbano.lobby.LobbyView;
import br.imperiourbano.persistence.GameStore;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

/** Encerramento por abandono com prazos curtos (1 s; 2,5 s contra bots) em vez dos de rules.json. */
@SpringBootTest
@Import({TestcontainersConfiguration.class, AbandonmentTest.Config.class})
class AbandonmentTest {

    @TestConfiguration
    static class Config {
        @Bean
        @Primary
        AbandonmentWatcher.Policy fastAbandonment() {
            return new AbandonmentWatcher.Policy(Duration.ofSeconds(1), Duration.ofMillis(2_500));
        }
    }

    @Autowired
    GuestSessionService sessions;

    @Autowired
    LobbyService lobby;

    @Autowired
    GameStore store;

    @Autowired
    Presence presence;

    @Autowired
    TurnTimer timer;

    private GuestPrincipal ana;
    private String gameId;

    @BeforeEach
    void startGame() {
        ana = sessions.create("Ana").player();
        GuestPrincipal bia = sessions.create("Bia").player();
        LobbyView room = lobby.create(ana, GameMode.CLASSIC, 200, false);
        gameId = room.gameId();
        lobby.join(bia, room.inviteCode());
        lobby.setReady(ana, gameId, true);
        lobby.setReady(bia, gameId, true);
        presence.joined(gameId, ana.playerId());
        lobby.start(ana, gameId);
    }

    private GameState state() {
        return store.loadSnapshot(gameId).orElseThrow();
    }

    private void waitFor(Duration max, java.util.function.BooleanSupplier condition) throws InterruptedException {
        long deadline = System.nanoTime() + max.toNanos();
        while (!condition.getAsBoolean() && System.nanoTime() < deadline) {
            Thread.sleep(100);
        }
    }

    @Test
    void gameIsClosedWithoutWinnerWhenEveryoneLeaves() throws InterruptedException {
        presence.left(gameId, ana.playerId());

        waitFor(Duration.ofSeconds(4), () -> state().status() == GameStatus.FINISHED);

        assertThat(state().status()).isEqualTo(GameStatus.FINISHED);
        assertThat(state().winnerIds()).isEmpty();
        assertThat(store.loadEvents(gameId)).last().isEqualTo(new GameEvent.GameAbandoned());
        assertThat(timer.remainingMillis(gameId)).isEmpty();
        assertThat(lobby.activeGames(ana)).noneMatch(g -> g.gameId().equals(gameId));
    }

    @Test
    void returningInTimeKeepsTheGameGoing() throws InterruptedException {
        presence.left(gameId, ana.playerId());
        Thread.sleep(400);
        presence.joined(gameId, ana.playerId());

        Thread.sleep(1_200);

        assertThat(state().status()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void gameNobodyEverConnectedToIsAlsoClosed() throws InterruptedException {
        GuestPrincipal caio = sessions.create("Caio").player();
        GuestPrincipal davi = sessions.create("Davi").player();
        LobbyView room = lobby.create(caio, GameMode.QUICK, 200, false);
        lobby.join(davi, room.inviteCode());
        lobby.setReady(caio, room.gameId(), true);
        lobby.setReady(davi, room.gameId(), true);
        lobby.start(caio, room.gameId());

        waitFor(Duration.ofSeconds(4),
                () -> store.loadSnapshot(room.gameId()).orElseThrow().status() == GameStatus.FINISHED);

        assertThat(store.loadSnapshot(room.gameId()).orElseThrow().status()).isEqualTo(GameStatus.FINISHED);
    }

    /** Contra bots, o prazo é o próprio (3 minutos em rules.json; pedido do usuário, 11/11/2026). */
    @Test
    void botGameUsesItsOwnLongerDeadline() throws InterruptedException {
        GuestPrincipal caio = sessions.create("Caio").player();
        String botGame = lobby.createVsBots(caio, GameMode.CLASSIC, 2).gameId();

        Thread.sleep(1_500);
        assertThat(store.loadSnapshot(botGame).orElseThrow().status()).isEqualTo(GameStatus.IN_PROGRESS);

        waitFor(Duration.ofSeconds(5),
                () -> store.loadSnapshot(botGame).orElseThrow().status() == GameStatus.FINISHED);
        assertThat(store.loadSnapshot(botGame).orElseThrow().status()).isEqualTo(GameStatus.FINISHED);
        assertThat(store.loadEvents(botGame)).last().isEqualTo(new GameEvent.GameAbandoned());
    }
}
