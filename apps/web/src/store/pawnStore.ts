// Quais personagens estão animando (somente cliente). O servidor já decidiu a posição; isto só diz se
// o desenho chegou lá, para a interface esperar o pouso antes de abrir a compra/construção.
import { create } from 'zustand';

interface PawnMotionState {
  /** Em salto ou deslize; ausente = parado (ou sem personagem desenhado). */
  moving: Record<string, true>;
  /** Parado esperando os próprios dados pararem (também conta em moving: a interface espera). */
  waiting: Record<string, true>;
  /** Último movimento (versão do PLAYER_MOVED) que o desenho terminou, por jogador. */
  landed: Record<string, number>;
  /** Último movimento em que o desenho já passou pelo Início (casa 0), por jogador. */
  passedStart: Record<string, number>;
  setMoving: (playerId: string, moving: boolean) => void;
  setLanded: (playerId: string, moveId: number) => void;
  setPassedStart: (playerId: string, moveId: number) => void;
  setWaiting: (playerId: string, waiting: boolean) => void;
}

export const usePawnStore = create<PawnMotionState>()((set) => ({
  moving: {},
  waiting: {},
  landed: {},
  passedStart: {},
  setLanded: (playerId, moveId) => set((s) => (s.landed[playerId] === moveId ? s : { landed: { ...s.landed, [playerId]: moveId } })),
  setPassedStart: (playerId, moveId) =>
    set((s) => (s.passedStart[playerId] === moveId ? s : { passedStart: { ...s.passedStart, [playerId]: moveId } })),
  setWaiting: (playerId, waiting) =>
    set((s) => {
      if (waiting === !!s.waiting[playerId]) return s;
      const next = { ...s.waiting };
      if (waiting) next[playerId] = true;
      else delete next[playerId];
      return { waiting: next };
    }),
  setMoving: (playerId, moving) =>
    set((s) => {
      if (moving === !!s.moving[playerId]) return s;
      const next = { ...s.moving };
      if (moving) next[playerId] = true;
      else delete next[playerId];
      return { moving: next };
    }),
}));
