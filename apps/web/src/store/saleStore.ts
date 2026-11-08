// Estados marcados no tabuleiro para vender ao banco e pagar uma dívida (somente cliente). O servidor só
// recebe a lista quando o jogador confirma, e confere tudo de novo.
import { create } from 'zustand';

interface SaleSelection {
  /** Casas (índices do tabuleiro) marcadas para vender. */
  picked: number[];
  toggle: (tileIndex: number) => void;
  clear: () => void;
}

export const useSaleStore = create<SaleSelection>()((set) => ({
  picked: [],
  toggle: (tileIndex) =>
    set((s) => ({ picked: s.picked.includes(tileIndex) ? s.picked.filter((t) => t !== tileIndex) : [...s.picked, tileIndex] })),
  clear: () => set((s) => (s.picked.length ? { picked: [] } : s)),
}));
