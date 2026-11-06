// Estado dos dados 3D na mesa (somente cliente). O resultado já é oficial; isto só ordena a
// apresentação: a barra não antecipa o valor, o peão espera os seus dados pararem e o próximo jogador
// só rola com a mesa parada.
import { create } from 'zustand';

interface DiceMotionState {
  /** Lance recebido e ainda não terminado na mesa (esperando a vez de animar ou rolando). */
  rolling: boolean;
  /** Versão do último lance já mostrado parado na mesa. */
  shownRollId: number;
  setRolling: (rolling: boolean) => void;
  setShown: (rollId: number) => void;
}

export const useDiceStore = create<DiceMotionState>()((set) => ({
  rolling: false,
  shownRollId: -1,
  setRolling: (rolling) => set((s) => (s.rolling === rolling ? s : { rolling })),
  setShown: (rollId) => set((s) => (rollId <= s.shownRollId ? s : { shownRollId: rollId })),
}));
