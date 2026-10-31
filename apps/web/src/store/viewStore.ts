// Estado de visualização (somente cliente): qual casa está em foco e a rotação da vista geral.
import { create } from 'zustand';

interface ViewState {
  focusedTile: number | null;
  /** Quartos de volta da vista geral; inteiro sem limite, para girar sempre no sentido pedido. */
  quarterTurns: number;
  focusTile: (index: number) => void;
  clearFocus: () => void;
  rotate: (direction: 1 | -1) => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  focusedTile: null,
  quarterTurns: 0,
  focusTile: (index) => set({ focusedTile: index }),
  clearFocus: () => set({ focusedTile: null }),
  rotate: (direction) => set((s) => ({ quarterTurns: s.quarterTurns + direction, focusedTile: null })),
}));
