// Cliente REST do servidor (/api, repassado pelo Vite em desenvolvimento).
import type { AvatarId, GameMode, GuestSession, LobbyView, PawnColor, PublicRoom } from '@imperio/shared-types';

export interface Wallet {
  coins: number;
  diamonds: number;
  /** Partidas vencidas (servidor antigo pode não mandar). */
  wins?: number;
}

/** Personagem preferido, escolhido no menu; `pawnColor` nulo = sem preferência de cor. */
/** LINKED: o convidado ganhou a conta Google; SIGNED_IN: conta de um jogador existente; CREATED: jogador novo. */
export interface GoogleSignIn {
  playerId: string;
  nickname: string;
  token: string;
  outcome: 'LINKED' | 'SIGNED_IN' | 'CREATED';
  email: string | null;
  photoUrl: string | null;
}

export interface Character {
  avatarId: AvatarId;
  pawnColor: PawnColor | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(method: string, path: string, token: string | null, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Não foi possível falar com o servidor.', 0);
  }
  if (!response.ok) {
    // Erros do servidor vêm como ProblemDetail, com a mensagem em "detail".
    const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(problem?.detail ?? 'Algo deu errado. Tente de novo.', response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  createSession: (nickname: string) => request<GuestSession>('POST', '/sessions', null, { nickname }),
  me: (token: string) => request<{ playerId: string; nickname: string; google: boolean; email: string | null; photoUrl: string | null }>('GET', '/sessions/me', token),
  authConfig: () => request<{ googleClientId: string | null }>('GET', '/sessions/config', null),
  /** Com o token do convidado, a conta Google nova fica ligada a ele; sem token, cria ou recupera a conta. */
  googleSignIn: (credential: string, token: string | null) =>
    request<GoogleSignIn>('POST', '/sessions/google', token, { credential }),
  logout: (token: string) => request<void>('POST', '/sessions/logout', token),
  createGame: (token: string, mode: GameMode, stake: number, publicRoom: boolean) =>
    request<LobbyView>('POST', '/games', token, { mode, stake, publicRoom }),
  /** Partida contra bots (10/11/2026): começa na hora, sem aposta. */
  createBotGame: (token: string, mode: GameMode, bots: number) => request<LobbyView>('POST', '/games/bots', token, { mode, bots }),
  /** Salas públicas em que o jogador pode entrar agora. */
  publicRooms: (token: string) => request<PublicRoom[]>('GET', '/games/public', token),
  joinPublic: (token: string, gameId: string) => request<LobbyView>('POST', `/games/${gameId}/join`, token),
  /** Moedas e diamantes; o servidor aplica a recarga grátis do dia se o saldo estiver baixo. */
  wallet: (token: string) => request<Wallet>('GET', '/wallet', token),
  joinGame: (token: string, inviteCode: string) => request<LobbyView>('POST', '/games/join', token, { inviteCode }),
  lobby: (token: string, gameId: string) => request<LobbyView>('GET', `/games/${gameId}`, token),
  /** Salas e partidas não encerradas do jogador. */
  myGames: (token: string) => request<LobbyView[]>('GET', '/games/mine', token),
  customize: (token: string, gameId: string, avatarId: AvatarId, pawnColor: PawnColor) =>
    request<LobbyView>('PUT', `/games/${gameId}/me`, token, { avatarId, pawnColor }),
  setReady: (token: string, gameId: string, ready: boolean) =>
    request<LobbyView>('PUT', `/games/${gameId}/me/ready`, token, { ready }),
  start: (token: string, gameId: string) => request<LobbyView>('POST', `/games/${gameId}/start`, token),
  /** Sai da sala antes do início: libera o assento e tira a sala de "Suas partidas". */
  leaveLobby: (token: string, gameId: string) => request<void>('POST', `/games/${gameId}/leave`, token),
  character: (token: string) => request<Character>('GET', '/character', token),
  saveCharacter: (token: string, avatarId: AvatarId, pawnColor: PawnColor) =>
    request<Character>('PUT', '/character', token, { avatarId, pawnColor }),
};
