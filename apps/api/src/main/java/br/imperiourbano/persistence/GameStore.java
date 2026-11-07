package br.imperiourbano.persistence;

import br.imperiourbano.catalog.Catalog;
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
 *
 * <p>Cada snapshot leva a versão do tabuleiro em que foi jogado. Snapshot de outra versão (as partidas de
 * 36 casas) não é carregado: a partida fica guardada, mas não continua.
 */
@Service
public class GameStore {

    private final GameRecordRepository games;
    private final GameEventRecordRepository events;
    private final GameSnapshotRecordRepository snapshots;
    private final ProcessedCommandRecordRepository commands;
    private final int boardVersion;

    GameStore(GameRecordRepository games, GameEventRecordRepository events,
            GameSnapshotRecordRepository snapshots, ProcessedCommandRecordRepository commands, Catalog catalog) {
        this.games = games;
        this.events = events;
        this.snapshots = snapshots;
        this.commands = commands;
        this.boardVersion = catalog.board().version();
    }

    @Transactional
    public void createGame(String gameId, String inviteCode, GameMode mode, String hostPlayerId, int stake,
            boolean publicRoom) {
        games.save(new GameRecord(gameId, inviteCode, mode.name(), GameStatus.LOBBY.name(), hostPlayerId, stake,
                publicRoom));
    }

    @Transactional(readOnly = true)
    public Optional<GameInfo> find(String gameId) {
        return games.findById(gameId).map(GameRecord::info);
    }

    @Transactional(readOnly = true)
    public Optional<GameInfo> findByInviteCode(String inviteCode) {
        return games.findByInviteCode(inviteCode).map(GameRecord::info);
    }

    /** Salas públicas ainda esperando jogadores, das mais novas para as mais antigas. */
    @Transactional(readOnly = true)
    public List<GameInfo> publicLobbies(int limit) {
        return games.findPublicLobbies(org.springframework.data.domain.PageRequest.of(0, limit)).stream()
                .map(GameRecord::info).toList();
    }

    @Transactional(readOnly = true)
    public List<String> inProgressGameIds() {
        return games.findInProgressIds(boardVersion);
    }

    @Transactional(readOnly = true)
    public boolean inviteCodeExists(String inviteCode) {
        return games.findByInviteCode(inviteCode).isPresent();
    }

    /** Lê a partida travando a linha; use dentro da transação de quem vai alterá-la. */
    @Transactional
    public Optional<GameInfo> lock(String gameId) {
        return games.lockById(gameId).map(GameRecord::info);
    }

    @Transactional
    public void changeHost(String gameId, String hostPlayerId) {
        games.changeHost(gameId, hostPlayerId);
    }

    /** Fim da contagem do início automático da sala; nulo desliga. */
    @Transactional
    public void setStartsAt(String gameId, java.time.Instant startsAt) {
        games.setStartsAt(gameId, startsAt);
    }

    @Transactional(readOnly = true)
    public Optional<java.time.Instant> startsAt(String gameId) {
        return games.findStartsAt(gameId);
    }

    @Transactional(readOnly = true)
    public List<String> dueLobbies(java.time.Instant now) {
        return games.findDueLobbies(now);
    }

    /** Apaga uma sala que ainda não começou (ficou vazia). */
    @Transactional
    public void deleteLobby(String gameId) {
        games.deleteLobby(gameId);
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
        snapshot.update(state.version(), GameJson.write(state), boardVersion);
        snapshots.save(snapshot);
        if (commandId != null) {
            commands.save(new ProcessedCommandRecord(commandId, gameId, playerId, state.version()));
        }
    }

    @Transactional(readOnly = true)
    public Optional<GameState> loadSnapshot(String gameId) {
        return snapshots.findById(gameId)
                .filter(s -> s.boardVersion() == boardVersion)
                .map(s -> GameJson.readState(s.state()));
    }

    /** Partida jogada num tabuleiro anterior ao atual: não pode continuar. */
    @Transactional(readOnly = true)
    public boolean usesOldBoard(String gameId) {
        return snapshots.findById(gameId).filter(s -> s.boardVersion() != boardVersion).isPresent();
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
