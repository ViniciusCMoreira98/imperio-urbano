// Se os dados 3D estão rolando (somente cliente). O resultado já é oficial; isto só evita mostrar o
// valor na barra antes de os dados pararem na mesa.
import { create } from 'zustand';

interface DiceMotionState {
  rolling: boolean;
  setRolling: (rolling: boolean) => void;
}

export const useDiceStore = create<DiceMotionState>()((set) => ({
  rolling: false,
  setRolling: (rolling) => set((s) => (s.rolling === rolling ? s : { rolling })),
}));
