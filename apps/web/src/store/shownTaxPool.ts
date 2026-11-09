// Fundo da Taxa como a mesa mostra (somente apresentação): a taxa paga e o Saque recolhido só mudam o
// valor quando o personagem pousa na casa, como os saldos dos jogadores.
import { heldMoveCredits, TAX_POOL } from '../game/heldMoney';
import { useGameStore } from './gameStore';
import { usePawnStore } from './pawnStore';

export function useShownTaxPool(): number | null {
  const pool = useGameStore((s) => s.snapshot?.taxPool);
  const version = useGameStore((s) => s.snapshot?.version);
  const money = useGameStore((s) => s.money);
  const landed = usePawnStore((s) => s.landed);
  const passedStart = usePawnStore((s) => s.passedStart);
  if (typeof pool !== 'number') return null;
  return pool - (heldMoveCredits(money, landed, passedStart, version)[TAX_POOL] ?? 0);
}
