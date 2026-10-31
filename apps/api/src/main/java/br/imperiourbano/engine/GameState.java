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
        Debt pendingDebt) {

    public GameState {
        players = List.copyOf(players);
        properties = Map.copyOf(properties);
    }

    public PlayerState currentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public PlayerState player(String id) {
        return players.get(indexOf(id));
    }

    public Optional<PropertyState> property(String stateId) {
        return Optional.ofNullable(properties.get(stateId));
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
                doublesInRow, properties, olympics, pendingDebt);
    }

    GameState withTurn(int playerIndex, int roundValue, TurnPhase phaseValue, int doubles) {
        return new GameState(gameId, mode, status, version, roundValue, players, playerIndex, phaseValue, lastDice,
                doubles, properties, olympics, pendingDebt);
    }

    GameState withPhase(TurnPhase value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, value, lastDice,
                doublesInRow, properties, olympics, pendingDebt);
    }

    GameState withDice(DiceRoll dice, int doubles) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, dice,
                doubles, properties, olympics, pendingDebt);
    }

    GameState withProperty(PropertyState property) {
        Map<String, PropertyState> next = new HashMap<>(properties);
        next.put(property.stateId(), property);
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, next, olympics, pendingDebt);
    }

    GameState withOlympics(OlympicsState value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, value, pendingDebt);
    }

    GameState withPendingDebt(Debt value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, olympics, value);
    }

    GameState nextVersion() {
        return new GameState(gameId, mode, status, version + 1, round, players, currentPlayerIndex, phase, lastDice,
                doublesInRow, properties, olympics, pendingDebt);
    }
}
