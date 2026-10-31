// DEMONSTRAÇÃO LOCAL (D16): dados sorteados no navegador apenas para exercitar o tabuleiro.
// Será removida na E18, quando o servidor passar a decidir dados e movimentos.
import { create } from 'zustand';
import { board } from '@imperio/game-data';
import { passesStart } from '../board/movement';
import { useViewStore } from '../store/viewStore';

const TILE_COUNT = board.tiles.length;
const rollDie = () => 1 + Math.floor(Math.random() * 6);

interface DemoState {
  position: number;
  dice: [number, number] | null;
  moving: boolean;
  passedStart: boolean;
  roll: () => void;
  arrive: () => void;
}

export const useDemoStore = create<DemoState>()((set, get) => ({
  position: 0,
  dice: null,
  moving: false,
  passedStart: false,
  roll: () => {
    const { moving, position } = get();
    if (moving) return;
    const dice: [number, number] = [rollDie(), rollDie()];
    const steps = dice[0] + dice[1];
    useViewStore.getState().clearFocus();
    set({
      dice,
      moving: true,
      passedStart: passesStart(position, steps, TILE_COUNT),
      position: (position + steps) % TILE_COUNT,
    });
  },
  arrive: () => {
    set({ moving: false });
    useViewStore.getState().focusTile(get().position);
  },
}));
