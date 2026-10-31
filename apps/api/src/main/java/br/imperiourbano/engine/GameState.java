package br.imperiourbano.engine;

import br.imperiourbano.catalog.GameMode;
import java.util.List;
import java.util.NoSuchElementException;
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
        int doublesInRow) {

    public GameState {
        players = List.copyOf(players);
    }

    public PlayerState currentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public PlayerState player(String id) {
        return players.stream()
                .filter(p -> p.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Jogador inexistente: " + id));
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
        return new GameState(gameId, mode, status, version, round, value, currentPlayerIndex, phase, lastDice, doublesInRow);
    }

    GameState withTurn(int playerIndex, int roundValue, TurnPhase phaseValue, int doubles) {
        return new GameState(gameId, mode, status, version, roundValue, players, playerIndex, phaseValue, lastDice, doubles);
    }

    GameState withPhase(TurnPhase value) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, value, lastDice, doublesInRow);
    }

    GameState withDice(DiceRoll dice, int doubles) {
        return new GameState(gameId, mode, status, version, round, players, currentPlayerIndex, phase, dice, doubles);
    }

    GameState nextVersion() {
        return new GameState(gameId, mode, status, version + 1, round, players, currentPlayerIndex, phase, lastDice, doublesInRow);
    }
}
