// Sessão do convidado guardada no navegador. sessionStorage = uma sessão por aba: sobrevive ao
// recarregar e permite testar dois jogadores em abas diferentes. O último convidado também fica no
// localStorage, para oferecer "Continuar como …" numa aba nova ou depois de fechar o navegador.
import type { GuestSession } from '@imperio/shared-types';

const SESSION_KEY = 'imperio.session';
const GAME_KEY = 'imperio.gameId';
const LAST_SESSION_KEY = 'imperio.lastSession';

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    // Armazenamento indisponível (modo privado restrito): a sessão vale só até recarregar.
  }
}

const tab = () => sessionStorage;
const device = () => localStorage;

function parse(raw: string | null): GuestSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function loadSession(): GuestSession | null {
  return parse(read(tab, SESSION_KEY));
}

/** Guardar nulo ("trocar apelido" ou token inválido) também esquece o último convidado do dispositivo. */
export function saveSession(session: GuestSession | null) {
  const value = session ? JSON.stringify(session) : null;
  write(tab, SESSION_KEY, value);
  write(device, LAST_SESSION_KEY, value);
}

export function loadLastSession(): GuestSession | null {
  return parse(read(device, LAST_SESSION_KEY));
}

export function loadGameId(): string | null {
  return read(tab, GAME_KEY);
}

export function saveGameId(gameId: string | null) {
  write(tab, GAME_KEY, gameId);
}
