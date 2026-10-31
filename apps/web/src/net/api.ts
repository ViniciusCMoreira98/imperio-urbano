// Cliente REST do servidor (/api, repassado pelo Vite em desenvolvimento).
import type { AvatarId, GameMode, GuestSession, LobbyView, PawnColor } from '@imperio/shared-types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, token: string | null, body?: unknown): Promise<T> {
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
  return (await response.json()) as T;
}

export const api = {
  createSession: (nickname: string) => request<GuestSession>('POST', '/sessions', null, { nickname }),
  me: (token: string) => request<{ playerId: string; nickname: string }>('GET', '/sessions/me', token),
  createGame: (token: string, mode: GameMode) => request<LobbyView>('POST', '/games', token, { mode }),
  joinGame: (token: string, inviteCode: string) => request<LobbyView>('POST', '/games/join', token, { inviteCode }),
  lobby: (token: string, gameId: string) => request<LobbyView>('GET', `/games/${gameId}`, token),
  /** Salas e partidas não encerradas do jogador. */
  myGames: (token: string) => request<LobbyView[]>('GET', '/games/mine', token),
  customize: (token: string, gameId: string, avatarId: AvatarId, pawnColor: PawnColor) =>
    request<LobbyView>('PUT', `/games/${gameId}/me`, token, { avatarId, pawnColor }),
  setReady: (token: string, gameId: string, ready: boolean) =>
    request<LobbyView>('PUT', `/games/${gameId}/me/ready`, token, { ready }),
  start: (token: string, gameId: string) => request<LobbyView>('POST', `/games/${gameId}/start`, token),
};
