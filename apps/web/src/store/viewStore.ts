// Estado de visualização (somente cliente). A câmera fica parada na vista geral: só se aproxima
// quando o jogador pede (duplo clique numa casa). Selecionar uma casa apenas abre o painel.
import { create } from 'zustand';

interface ViewState {
  /** Casa mostrada no painel lateral. */
  selectedTile: number | null;
  /** Casa em que a câmera está aproximada; null = vista geral. */
  focusedTile: number | null;
  /** Quartos de volta da vista geral; inteiro sem limite, para girar sempre no sentido pedido. */
  quarterTurns: number;
  selectTile: (index: number) => void;
  focusTile: (index: number) => void;
  clearFocus: () => void;
  rotate: (direction: 1 | -1) => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  selectedTile: null,
  focusedTile: null,
  quarterTurns: 0,
  selectTile: (index) => set({ selectedTile: index }),
  focusTile: (index) => set({ selectedTile: index, focusedTile: index }),
  clearFocus: () => set({ selectedTile: null, focusedTile: null }),
  rotate: (direction) => set((s) => ({ quarterTurns: s.quarterTurns + direction, focusedTile: null })),
}));
