// Quais personagens estão animando (somente cliente). O servidor já decidiu a posição; isto só diz se
// o desenho chegou lá, para a interface esperar o pouso antes de abrir a compra/construção.
import { create } from 'zustand';

interface PawnMotionState {
  /** Em salto ou deslize; ausente = parado (ou sem personagem desenhado). */
  moving: Record<string, true>;
  setMoving: (playerId: string, moving: boolean) => void;
}

export const usePawnStore = create<PawnMotionState>()((set) => ({
  moving: {},
  setMoving: (playerId, moving) =>
    set((s) => {
      if (moving === !!s.moving[playerId]) return s;
      const next = { ...s.moving };
      if (moving) next[playerId] = true;
      else delete next[playerId];
      return { moving: next };
    }),
}));
