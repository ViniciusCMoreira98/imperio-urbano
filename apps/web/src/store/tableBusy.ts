// A mesa ainda mostra uma jogada já decidida: dados rolando (ou esperando a vez) ou personagens andando.
// Enquanto isso a interface não antecipa o que vem depois (prazo, aviso e casas destacadas da escolha).
import { useDiceStore } from './diceStore';
import { usePawnStore } from './pawnStore';

export function useTableBusy(): boolean {
  const diceRolling = useDiceStore((s) => s.rolling);
  const pawnsMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  return diceRolling || pawnsMoving;
}
