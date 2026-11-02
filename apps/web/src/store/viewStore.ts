// Estado de visualização (somente cliente). A câmera é estática: selecionar uma casa só abre o
// painel, sem mover a câmera (contrato em docs/11-contratos-claude-codex.md, seção 10).
import { create } from 'zustand';

interface ViewState {
  /** Casa mostrada no painel lateral. */
  selectedTile: number | null;
  /**
   * Fixos (sem foco nem giro): só ficam enquanto o CameraRig atual ainda os lê. Saem quando a
   * câmera estática do Codex chegar.
   */
  focusedTile: null;
  quarterTurns: 0;
  selectTile: (index: number) => void;
  clearSelection: () => void;
}

export const useViewStore = create<ViewState>()((set) => ({
  selectedTile: null,
  focusedTile: null,
  quarterTurns: 0,
  selectTile: (index) => set({ selectedTile: index }),
  clearSelection: () => set({ selectedTile: null }),
}));
