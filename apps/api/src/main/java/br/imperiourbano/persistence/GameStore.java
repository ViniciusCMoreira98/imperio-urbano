package br.imperiourbano.persistence;

import br.imperiourbano.catalog.GameMode;
import br.imperiourbano.engine.GameEvent;
import br.imperiourbano.engine.GameState;
import br.imperiourbano.engine.GameStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.OptionalLong;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persistência das partidas (ADR A3/A4): cada comando aceito grava seus eventos, o snapshot resultante
 * e o commandId numa única transação, com concorrência otimista pela versão da partida.
 */
@Service
public class GameStore {

    private final GameRecordRepository games;
    private final GameEventRecordRepository events;
    private final GameSnapshotRecordRepository snapshots;
    private final ProcessedCommandRecordRepository commands;

    GameStore(GameRecordRepository games, GameEventRecordRepository events,
            GameSnapshotRecordRepository snapshots, ProcessedCommandRecordRepository commands) {
        this.games = games;
        this.events = events;
        this.snapshots = snapshots;
        this.commands = commands;
    }

    @Transactional
    public void createGame(String gameId, String inviteCode, GameMode mode) {
        games.save(new GameRecord(gameId, inviteCode, mode.name(), GameStatus.LOBBY.name()));
    }

    /**
     * Grava os eventos de um comando. {@code expectedVersion} é a versão anterior aos eventos;
     * {@code commandId} nulo para eventos sem comando de jogador (ex.: início da partida).
     */
    @Transactional
    public void append(String gameId, long expectedVersion, List<GameEvent> newEvents, GameState state,
            String commandId, String playerId) {
        if (state.version() != expectedVersion + newEvents.size()) {
            throw new IllegalArgumentException("Snapshot fora de sincronia com os eventos");
        }
        if (commandId != null && commands.existsById(commandId)) {
            throw new DuplicateCommandException(commandId);
        }
        int updated = games.advance(gameId, expectedVersion, state.version(), state.status().name(), Instant.now());
        if (updated == 0) {
            throw new ConcurrentGameUpdateException(gameId, expectedVersion);
        }
        for (int i = 0; i < newEvents.size(); i++) {
            GameEvent event = newEvents.get(i);
            events.save(new GameEventRecord(gameId, expectedVersion + i + 1,
                    GameJson.typeName(event.getClass()), GameJson.write(event)));
        }
        GameSnapshotRecord snapshot = snapshots.findById(gameId).orElseGet(() -> new GameSnapshotRecord(gameId));
        snapshot.update(state.version(), GameJson.write(state));
        snapshots.save(snapshot);
        if (commandId != null) {
            commands.save(new ProcessedCommandRecord(commandId, gameId, playerId, state.version()));
        }
    }

    @Transactional(readOnly = true)
    public Optional<GameState> loadSnapshot(String gameId) {
        return snapshots.findById(gameId).map(s -> GameJson.readState(s.state()));
    }

    @Transactional(readOnly = true)
    public List<GameEvent> loadEvents(String gameId) {
        return events.findByGameIdOrderBySequenceAsc(gameId).stream()
                .map(e -> GameJson.readEvent(e.payload()))
                .toList();
    }

    /** Versão resultante de um comando já processado, para responder a reenvios sem reprocessar. */
    @Transactional(readOnly = true)
    public OptionalLong processedVersion(String commandId) {
        return commands.findById(commandId)
                .map(c -> OptionalLong.of(c.resultVersion()))
                .orElse(OptionalLong.empty());
    }
}
