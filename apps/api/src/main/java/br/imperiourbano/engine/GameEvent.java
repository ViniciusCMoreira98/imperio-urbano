package br.imperiourbano.engine;

import br.imperiourbano.catalog.GameMode;
import java.util.List;

/** Fatos já validados. Aplicá-los em ordem reconstrói o estado (ver GameEngine.replay). */
public sealed interface GameEvent {

    record StartingPlayer(String id, String nickname) {
    }

    /** {@code eventDeck}: ids das cartas já embaralhadas, sorteadas uma única vez aqui. */
    record GameStarted(String gameId, GameMode mode, List<StartingPlayer> turnOrder, int startingCredits,
            List<String> eventDeck) implements GameEvent {

        public GameStarted {
            turnOrder = List.copyOf(turnOrder);
            eventDeck = List.copyOf(eventDeck);
        }
    }

    record DiceRolled(String playerId, DiceRoll dice) implements GameEvent {
    }

    /** {@code startBonus} > 0 quando passou ou parou no Início; {@code sentToRest} na 3ª dupla seguida. */
    record PlayerMoved(String playerId, int from, int to, int startBonus, boolean sentToRest) implements GameEvent {
    }

    /** Rolou sem dupla no Descanso: perde a jogada. */
    record RestTurnLost(String playerId) implements GameEvent {
    }

    /** Tirou dupla no Descanso: sai e anda normalmente, sem jogada extra. */
    record RestLeft(String playerId) implements GameEvent {
    }

    record TravelChosen(String playerId, int tileIndex, int fee) implements GameEvent {
    }

    record TravelDeclined(String playerId) implements GameEvent {
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

    record EventCardDrawn(String playerId, String cardId) implements GameEvent {
    }

    /** A carta pede um estado e há candidatos: o jogador escolhe no tabuleiro. */
    record EventTargetRequested(String playerId, String cardId) implements GameEvent {
    }

    /** A carta não tem alvo agora (ninguém para atingir, sem sede): fica sem efeito. */
    record EventCardWithoutEffect(String playerId, String cardId) implements GameEvent {
    }

    /** O prazo para escolher o estado acabou: a carta fica sem efeito. */
    record EventTargetSkipped(String playerId, String cardId) implements GameEvent {
    }

    /** Incêndio: o estado volta ao banco sem as construções; o dono não recebe nada. */
    record PropertyBurned(String playerId, String stateId, String ownerId) implements GameEvent {
    }

    /** Escolha da sede (carta): nova edição das Olimpíadas no estado de {@code ownerId}, sem taxa. */
    record OlympicsHostAppointed(String playerId, String stateId, String ownerId, int edition, int multiplier)
            implements GameEvent {
    }

    /** Apagão: sem aluguel no estado até o dono parar nele {@code visits} vezes. */
    record BlackoutStarted(String playerId, String stateId, int visits) implements GameEvent {
    }

    record CreditsFromBank(String playerId, int amount) implements GameEvent {
    }

    record CreditsToBank(String playerId, int amount) implements GameEvent {
    }

    /** Pagamento na casa Taxa: sai do jogador e vai para o fundo do Saque. */
    record TaxPaid(String playerId, int amount) implements GameEvent {
    }

    /** Parou no Saque: leva o fundo da Taxa inteiro, que volta a zero. */
    record SaqueCollected(String playerId, int amount) implements GameEvent {
    }

    record CreditsTransferred(String fromId, String toId, int amount) implements GameEvent {
    }

    record RentPaid(String fromId, String toId, String stateId, int amount) implements GameEvent {
    }

    /** Pagamento maior que o saldo; {@code toTaxPool}: dívida da Taxa, paga ao fundo do Saque. */
    record DebtIncurred(String debtorId, String creditorId, int amount, boolean toTaxPool) implements GameEvent {

        public DebtIncurred(String debtorId, String creditorId, int amount) {
            this(debtorId, creditorId, amount, false);
        }
    }

    record BuildingSold(String playerId, String stateId, int refund) implements GameEvent {
    }

    record PropertySold(String playerId, String stateId, int refund) implements GameEvent {
    }

    /** Dívida pendente quitada após vendas; {@code creditorId} nulo = banco. */
    record DebtSettled(String debtorId, String creditorId, int amount) implements GameEvent {
    }

    /** Bens vão para o credor; com o banco como credor, os estados voltam livres (D11). */
    record PlayerBankrupt(String playerId, String creditorId) implements GameEvent {
    }

    /** Todos saíram e ninguém voltou a tempo: partida encerrada sem vencedor. */
    record GameAbandoned() implements GameEvent {
    }

    record GameFinished(List<String> winnerIds) implements GameEvent {

        public GameFinished {
            winnerIds = List.copyOf(winnerIds);
        }
    }

    /** {@code nextPlayerId} igual ao atual quando a dupla dá nova jogada. */
    record TurnEnded(String playerId, String nextPlayerId, int round) implements GameEvent {
    }
}
