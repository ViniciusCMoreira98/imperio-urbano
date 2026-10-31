// Sessão do convidado guardada no navegador. sessionStorage = uma sessão por aba:
// sobrevive ao recarregar a página e permite testar dois jogadores em abas diferentes.
import type { GuestSession } from '@imperio/shared-types';

const SESSION_KEY = 'imperio.session';
const GAME_KEY = 'imperio.gameId';

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Armazenamento indisponível (modo privado restrito): a sessão vale só até recarregar.
  }
}

export function loadSession(): GuestSession | null {
  const raw = read(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function saveSession(session: GuestSession | null) {
  write(SESSION_KEY, session ? JSON.stringify(session) : null);
}

export function loadGameId(): string | null {
  return read(GAME_KEY);
}

export function saveGameId(gameId: string | null) {
  write(GAME_KEY, gameId);
}
