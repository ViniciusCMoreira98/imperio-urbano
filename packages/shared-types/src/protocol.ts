// Contrato WebSocket: comandos (cliente → servidor) e eventos de domínio (servidor → cliente).
// Os comandos nunca carregam valores calculados (dados, preços, saldos): o servidor decide.
import type { AvatarId, GameSnapshot, PawnColor } from './game';
import type { StateId } from './catalog';

export type Command =
  | { type: 'JOIN_GAME'; inviteCode: string }
  | { type: 'SELECT_AVATAR'; avatarId: AvatarId; pawnColor: PawnColor }
  | { type: 'SET_READY'; ready: boolean }
  | { type: 'START_GAME' }
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
  gameId: string;
  /** Versão do snapshot que o cliente via ao enviar (detecção de conflito). */
  expectedVersion: number;
  command: Command;
}

export type DomainEvent =
  | { type: 'GAME_CREATED'; inviteCode: string }
  | { type: 'PLAYER_JOINED'; playerId: string; nickname: string }
  | { type: 'GAME_STARTED'; turnOrder: string[] }
  | { type: 'DICE_ROLLED'; playerId: string; dice: [number, number] }
  | { type: 'PLAYER_MOVED'; playerId: string; from: number; to: number; passedStart: boolean }
  | { type: 'PROPERTY_PURCHASED'; playerId: string; stateId: StateId; price: number }
  | { type: 'HOUSE_BUILT'; playerId: string; stateId: StateId; houses: number; cost: number }
  | { type: 'HOTEL_BUILT'; playerId: string; stateId: StateId; cost: number }
  | { type: 'RENT_PAID'; fromId: string; toId: string; stateId: StateId; amount: number }
  | { type: 'OLYMPICS_HOST_SELECTED'; playerId: string; stateId: StateId; edition: number; multiplier: number }
  | { type: 'EVENT_CARD_DRAWN'; playerId: string; cardId: string }
  | { type: 'PLAYER_BANKRUPT'; playerId: string; creditorId: string | null }
  | { type: 'GAME_FINISHED'; winnerIds: string[] };

export type ServerMessage =
  | { kind: 'SNAPSHOT'; snapshot: GameSnapshot }
  | { kind: 'EVENTS'; version: number; events: DomainEvent[] }
  | { kind: 'COMMAND_REJECTED'; commandId: string; reason: string };
