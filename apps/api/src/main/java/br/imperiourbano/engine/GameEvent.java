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

    record PropertyPurchased(String playerId, String stateId, int price) implements GameEvent {
    }

    record PurchaseDeclined(String playerId, String stateId) implements GameEvent {
    }

    /** {@code count} casas construídas agora, ao custo total {@code cost}. */
    record HouseBuilt(String playerId, String stateId, int count, int cost) implements GameEvent {
    }

    record HotelBuilt(String playerId, String stateId, int cost) implements GameEvent {
    }

    record BuildSkipped(String playerId, String stateId) implements GameEvent {
    }

    /** Nova sede; a anterior perde o benefício. */
    record OlympicsHostSelected(String playerId, String stateId, int edition, int multiplier, int fee)
            implements GameEvent {
    }

    record OlympicsSkipped(String playerId) implements GameEvent {
    }

    record RentPaid(String fromId, String toId, String stateId, int amount) implements GameEvent {
    }

    /** Aluguel maior que o saldo: a resolução (venda ou falência) entra na E11. */
    record DebtIncurred(String debtorId, String creditorId, int amount) implements GameEvent {
    }

    /** {@code nextPlayerId} igual ao atual quando a dupla dá nova jogada. */
    record TurnEnded(String playerId, String nextPlayerId, int round) implements GameEvent {
    }
}
