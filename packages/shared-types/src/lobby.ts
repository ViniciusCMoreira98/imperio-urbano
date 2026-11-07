// Salas (REST /api/games): mesma forma do LobbyView do servidor.
import type { GameMode } from './catalog';
import type { AvatarId, GameStatus, PawnColor } from './game';

export interface LobbyMember {
  playerId: string;
  nickname: string;
  seat: number;
  avatarId: AvatarId;
  pawnColor: PawnColor;
  ready: boolean;
}

export interface LobbyView {
  gameId: string;
  inviteCode: string;
  mode: GameMode;
  /** Aposta de cada jogador, cobrada ao iniciar; o vencedor leva aposta × jogadores. */
  stake: number;
  /** Aparece na lista de salas públicas; privada só entra com o código. */
  publicRoom: boolean;
  status: GameStatus;
  hostPlayerId: string;
  players: LobbyMember[];
  /** Todos prontos, 2–4 jogadores e sala ainda aberta. */
  canStart: boolean;
}

/** POST /api/sessions */
export interface GuestSession {
  playerId: string;
  nickname: string;
  token: string;
}

/** Sala na lista pública (GET /api/games/public): sem código de convite. */
export interface PublicRoom {
  gameId: string;
  hostName: string;
  mode: GameMode;
  stake: number;
  players: number;
  capacity: number;
}
