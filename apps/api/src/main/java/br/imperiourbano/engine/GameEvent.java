package br.imperiourbano.engine;

import br.imperiourbano.catalog.GameMode;
import java.util.List;

/** Fatos já validados. Aplicá-los em ordem reconstrói o estado (ver GameEngine.replay). */
public sealed interface GameEvent {

    record StartingPlayer(String id, String nickname) {
    }

    record GameStarted(String gameId, GameMode mode, List<StartingPlayer> turnOrder, int startingCredits)
            implements GameEvent {

        public GameStarted {
            turnOrder = List.copyOf(turnOrder);
        }
    }

    record DiceRolled(String playerId, DiceRoll dice) implements GameEvent {
    }

    /** {@code startBonus} > 0 quando passou ou parou no Início; {@code sentToRest} na 3ª dupla seguida. */
    record PlayerMoved(String playerId, int from, int to, int startBonus, boolean sentToRest) implements GameEvent {
    }

    /** {@code nextPlayerId} igual ao atual quando a dupla dá nova jogada. */
    record TurnEnded(String playerId, String nextPlayerId, int round) implements GameEvent {
    }
}
