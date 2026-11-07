// A mesa ainda mostra uma jogada já decidida: dados rolando (ou esperando a vez), personagens andando ou
// carta de evento na tela (ou esperando a vez de aparecer). Enquanto isso a interface não antecipa o que
// vem depois (prazo, aviso e casas destacadas da escolha).
import { useCardBusy } from './cardStore';
import { useDiceStore } from './diceStore';
import { usePawnStore } from './pawnStore';

export function useTableBusy(): boolean {
  const diceRolling = useDiceStore((s) => s.rolling);
  const pawnsMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  const cardBusy = useCardBusy();
  return diceRolling || pawnsMoving || cardBusy;
}
