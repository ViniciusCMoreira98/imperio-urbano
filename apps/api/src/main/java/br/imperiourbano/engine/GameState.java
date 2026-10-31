package br.imperiourbano.engine;

import br.imperiourbano.catalog.GameMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.function.UnaryOperator;

/** Estado imutável da partida. Só muda aplicando eventos (GameEngine.apply). */
public record GameState(
        String gameId,
        GameMode mode,
        GameStatus status,
        long version,
        int round,
        List<PlayerState> players,
        int currentPlayerIndex,
        TurnPhase phase,
        DiceRoll lastDice,
        int doublesInRow,
        Map<String, PropertyState> properties,
        OlympicsState olympics,
        Debt pendingDebt,
        List<String> winnerIds) {

    public GameState {
        players = List.copyOf(players);
        properties = Map.copyOf(properties);
        winnerIds = List.copyOf(winnerIds);
    }

    public PlayerState currentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public PlayerState player(String id) {
        return players.get(indexOf(id));
    }

    public List<PlayerState> activePlayers() {
        return players.stream().filter(p -> !p.bankrupt()).toList();
    }

    public Optional<PropertyState> property(String stateId) {
        return Optional.ofNullable(properties.get(stateId));
    }

    public List<PropertyState> propertiesOf(String playerId) {
        return properties.values().stream().filter(p -> p.ownerId().equals(playerId)).toList();
    }

    public boolean ownsAnyProperty(String playerId) {
        return properties.values().stream().anyMatch(p -> p.ownerId().equals(playerId));
    }

    int indexOf(String playerId) {
        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).id().equals(playerId)) return i;
        }
        throw new NoSuchElementException("Jogador inexistente: " + playerId);
    }

    GameState updatePlayer(String playerId, UnaryOperator<PlayerState> change) {
        return withPlayers(players.stream().map(p -> p.id().equals(playerId) ? change.apply(p) : p).toList());
    }

    GameState withPlayers(List<PlayerState> value) {
        return new GameState(gameId, mode, status, version, round, value, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, olympics, pendingDebt, winnerIds);
    }

    GameState withTurn(int playerIndex, int roundValue, TurnPhase phaseValue, int doubles) {
        return new GameState(gameId, mode, status, version, roundValue, players, playerIndex, phaseValue, lastDice,
                doubles, properties, olympics, pendingDebt, winnerIds);
    }

    GameState withPhase(TurnPhase value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, value, lastDice,
                doublesInRow, properties, olympics, pendingDebt, winnerIds);
    }

    GameState withDice(DiceRoll dice, int doubles) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, dice,
                doubles, properties, olympics, pendingDebt, winnerIds);
    }

    GameState withProperty(PropertyState property) {
        Map<String, PropertyState> next = new HashMap<>(properties);
        next.put(property.stateId(), property);
        return withProperties(next);
    }

    GameState withoutProperty(String stateId) {
        Map<String, PropertyState> next = new HashMap<>(properties);
        next.remove(stateId);
        return withProperties(next);
    }

    GameState withProperties(Map<String, PropertyState> value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, value, olympics, pendingDebt, winnerIds);
    }

    GameState withOlympics(OlympicsState value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, value, pendingDebt, winnerIds);
    }

    GameState withPendingDebt(Debt value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, olympics, value, winnerIds);
    }

    GameState finished(List<String> winners) {
        return new GameState(gameId, mode, GameStatus.FINISHED, version, round, players, currentPlayerIndex, null,
                lastDice, doublesInRow, properties, olympics, null, winners);
    }

    GameState nextVersion() {
        return new GameState(gameId, mode, status, version + 1, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, olympics, pendingDebt, winnerIds);
    }
}
