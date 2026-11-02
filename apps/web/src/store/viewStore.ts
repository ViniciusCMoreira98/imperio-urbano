// Estado de visualização (somente cliente). A câmera é estática: selecionar uma casa só abre o
// painel, sem mover a câmera (contrato em docs/11-contratos-claude-codex.md).
import { create } from 'zustand';

interface ViewState {
  /** Casa mostrada no painel lateral. */
  selectedTile: number | null;
  selectTile: (index: number) => void;
  clearSelection: () => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  selectedTile: null,
  selectTile: (index) => set({ selectedTile: index }),
  clearSelection: () => set({ selectedTile: null }),
}));
