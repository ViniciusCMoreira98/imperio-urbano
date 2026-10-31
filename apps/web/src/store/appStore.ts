// Navegação entre telas e sessão do convidado (sem router: poucas telas, ADR A9).
import { create } from 'zustand';
import type { GuestSession, LobbyView } from '@imperio/shared-types';
import { loadGameId, loadSession, saveGameId, saveSession } from '../net/session';

export type Screen = 'menu' | 'lobby' | 'game';

interface AppState {
  session: GuestSession | null;
  screen: Screen;
  gameId: string | null;
  lobby: LobbyView | null;
  setSession: (session: GuestSession | null) => void;
  openLobby: (lobby: LobbyView) => void;
  updateLobby: (lobby: LobbyView) => void;
  openGame: () => void;
  leave: () => void;
}

const initialGameId = loadGameId();

export const useAppStore = create<AppState>()((set) => ({
  session: loadSession(),
  // Com uma sala salva, a tela de sala confere no servidor e segue para a partida se já começou.
  screen: initialGameId ? 'lobby' : 'menu',
  gameId: initialGameId,
  lobby: null,
  setSession: (session) => {
    saveSession(session);
    set({ session });
  },
  openLobby: (lobby) => {
    saveGameId(lobby.gameId);
    set({ screen: 'lobby', gameId: lobby.gameId, lobby });
  },
  updateLobby: (lobby) => set({ lobby }),
  openGame: () => set({ screen: 'game' }),
  leave: () => {
    saveGameId(null);
    set({ screen: 'menu', gameId: null, lobby: null });
  },
}));
