package br.imperiourbano.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.imperiourbano.TestcontainersConfiguration;
import br.imperiourbano.catalog.Catalog;
import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.DiceRoll;
import br.imperiourbano.engine.GameCommand;
import br.imperiourbano.engine.GameEngine;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameEvent.StartingPlayer;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class GameStoreTest {

    @Autowired
    GameStore store;

    @Autowired
    Catalog catalog;

    @Autowired
    JdbcTemplate jdbc;

    private GameEngine engine;
    private String gameId;
    private GameState state;

    @BeforeEach
    void startPersistedGame() {
        engine = new GameEngine(catalog);
        gameId = UUID.randomUUID().toString();
        store.createGame(gameId, gameId.substring(0, 6).toUpperCase(), GameMode.CLASSIC, null);

        GameEvent started = engine.start(gameId, GameMode.CLASSIC, List.of(
                new StartingPlayer("ana", "Ana"), new StartingPlayer("bia", "Bia")));
        state = engine.apply(null, started);
        store.append(gameId, 0, List.of(started), state, null, null);
    }

    private GameEngine.Result play(String commandId, String playerId, GameCommand command, DiceRoll roll) {
        long before = state.version();
        GameEngine.Result result = engine.execute(state, playerId, command, () -> roll);
        store.append(gameId, before, result.events(), result.state(), gameId + ":" + commandId, playerId);
        state = result.state();
        return result;
    }

    @Test
    void snapshotAndEventLogRestoreTheGame() {
        play("c1", "ana", new GameCommand.RollDice(), new DiceRoll(4, 5));
        play("c2", "ana", new GameCommand.BuyProperty(1), null);

        assertThat(store.loadSnapshot(gameId)).contains(state);
        List<GameEvent> log = store.loadEvents(gameId);
        assertThat(log).hasSize((int) state.version());
        assertThat(engine.replay(log)).isEqualTo(state);
        assertThat(state.status()).isEqualTo(GameStatus.IN_PROGRESS);
    }

    @Test
    void processedCommandsAreRemembered() {
        play("cmd-roll", "ana", new GameCommand.RollDice(), new DiceRoll(4, 5));

        assertThat(store.processedVersion(gameId + ":cmd-roll")).hasValue(state.version());
        assertThat(store.processedVersion(gameId + ":never-sent")).isEmpty();
    }

    @Test
    void sameCommandIdCannotBeStoredTwice() {
        play("dup", "ana", new GameCommand.RollDice(), new DiceRoll(4, 5));

        assertThatThrownBy(() -> play("dup", "ana", new GameCommand.DeclinePurchase(), null))
                .isInstanceOf(DuplicateCommandException.class);
        assertThat(store.loadSnapshot(gameId)).contains(state);
    }

    @Test
    void staleVersionIsRejected() {
        GameState stale = state;
        play("c1", "ana", new GameCommand.RollDice(), new DiceRoll(4, 5));

        GameEngine.Result concurrent = engine.execute(stale, "ana", new GameCommand.RollDice(), () -> new DiceRoll(2, 3));

        assertThatThrownBy(() -> store.append(gameId, stale.version(), concurrent.events(), concurrent.state(), gameId + ":c2", "ana"))
                .isInstanceOf(ConcurrentGameUpdateException.class);
        assertThat(store.loadSnapshot(gameId)).contains(state);
    }

    @Test
    void gamesFromTheOldBoardAreKeptButDoNotResume() {
        assertThat(store.usesOldBoard(gameId)).isFalse();
        assertThat(store.inProgressGameIds()).contains(gameId);

        // Snapshot gravado antes da migração para 33 casas (versão 1 do tabuleiro).
        jdbc.update("update game_snapshots set board_version = 1 where game_id = ?", gameId);

        assertThat(store.usesOldBoard(gameId)).isTrue();
        assertThat(store.loadSnapshot(gameId)).isEmpty();
        assertThat(store.inProgressGameIds()).doesNotContain(gameId);
        assertThat(store.loadEvents(gameId)).hasSize((int) state.version());
    }
}
