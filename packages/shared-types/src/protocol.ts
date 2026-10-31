// Contrato WebSocket /ws/games/{gameId}?token=...: comandos (cliente → servidor) e mensagens do servidor.
// Os comandos nunca carregam valores calculados (dados, preços, saldos): o servidor decide.
// Sala, avatar, cor e "pronto" são REST (/api/games), antes da partida começar.
import type { GameSnapshot } from './game';
import type { GameMode, StateId } from './catalog';

export type Command =
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_PROPERTY'; houses: number }
  | { type: 'DECLINE_PURCHASE' }
  | { type: 'BUILD'; houses: number }
  | { type: 'BUILD_HOTEL' }
  | { type: 'SKIP_BUILD' }
  | { type: 'HOST_OLYMPICS'; stateId: StateId }
  | { type: 'SKIP_OLYMPICS' }
  | { type: 'CHOOSE_TRAVEL'; tileIndex: number }
  | { type: 'SELL_BUILDING'; stateId: StateId }
  | { type: 'SELL_PROPERTY'; stateId: StateId }
  | { type: 'DECLARE_BANKRUPTCY' }
  | { type: 'END_TURN' };

export interface CommandEnvelope {
  /** UUID gerado pelo cliente; o servidor ignora comandos repetidos. */
  commandId: string;
  /** Versão do snapshot que o cliente via ao enviar (detecção de conflito). */
  expectedVersion: number;
  command: Command;
}

export type DomainEvent =
  /** A ordem do baralho de eventos não é enviada. */
  | { type: 'GAME_STARTED'; gameId: string; mode: GameMode; turnOrder: { id: string; nickname: string }[]; startingCredits: number }
  | { type: 'DICE_ROLLED'; playerId: string; dice: { first: number; second: number } }
  /** startBonus > 0 ao passar/parar no Início; sentToRest na 3ª dupla seguida. */
  | { type: 'PLAYER_MOVED'; playerId: string; from: number; to: number; startBonus: number; sentToRest: boolean }
  /** Rolou sem dupla no Descanso e perdeu a jogada. */
  | { type: 'REST_TURN_LOST'; playerId: string }
  /** Dupla no Descanso: sai e anda, sem jogada extra. */
  | { type: 'REST_LEFT'; playerId: string }
  | { type: 'TRAVEL_CHOSEN'; playerId: string; tileIndex: number; fee: number }
  | { type: 'TRAVEL_DECLINED'; playerId: string }
  | { type: 'PROPERTY_PURCHASED'; playerId: string; stateId: StateId; price: number }
  | { type: 'PURCHASE_DECLINED'; playerId: string; stateId: StateId }
  /** count = casas construídas agora; cost = custo total. */
  | { type: 'HOUSE_BUILT'; playerId: string; stateId: StateId; count: number; cost: number }
  | { type: 'HOTEL_BUILT'; playerId: string; stateId: StateId; cost: number }
  | { type: 'BUILD_SKIPPED'; playerId: string; stateId: StateId }
  | { type: 'RENT_PAID'; fromId: string; toId: string; stateId: StateId; amount: number }
  /** Aluguel maior que o saldo; creditorId nulo = banco. */
  | { type: 'DEBT_INCURRED'; debtorId: string; creditorId: string | null; amount: number }
  /** Nova sede; a anterior perde o benefício. fee = taxa paga ao banco. */
  | { type: 'OLYMPICS_HOST_SELECTED'; playerId: string; stateId: StateId; edition: number; multiplier: number; fee: number }
  | { type: 'OLYMPICS_SKIPPED'; playerId: string }
  | { type: 'EVENT_CARD_DRAWN'; playerId: string; cardId: string }
  | { type: 'CREDITS_FROM_BANK'; playerId: string; amount: number }
  | { type: 'CREDITS_TO_BANK'; playerId: string; amount: number }
  | { type: 'CREDITS_TRANSFERRED'; fromId: string; toId: string; amount: number }
  | { type: 'BUILDING_SOLD'; playerId: string; stateId: StateId; refund: number }
  | { type: 'PROPERTY_SOLD'; playerId: string; stateId: StateId; refund: number }
  | { type: 'DEBT_SETTLED'; debtorId: string; creditorId: string | null; amount: number }
  /** Bens vão para o credor; com o banco (null), os estados voltam livres. */
  | { type: 'PLAYER_BANKRUPT'; playerId: string; creditorId: string | null }
  /** nextPlayerId igual ao atual quando a dupla dá nova jogada. */
  | { type: 'TURN_ENDED'; playerId: string; nextPlayerId: string; round: number }
  | { type: 'GAME_FINISHED'; winnerIds: string[] };

/** EVENTS e SNAPSHOT vão a todos quando um comando é aplicado; COMMAND_REJECTED (+ SNAPSHOT) só a quem enviou. */
export type ServerMessage =
  | { kind: 'SNAPSHOT'; snapshot: GameSnapshot }
  | { kind: 'EVENTS'; version: number; events: DomainEvent[] }
  | { kind: 'COMMAND_REJECTED'; commandId: string; reason: string };
