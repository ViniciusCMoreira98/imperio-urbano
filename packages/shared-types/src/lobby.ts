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
