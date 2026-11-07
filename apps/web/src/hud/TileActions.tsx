import type { Command } from '@imperio/shared-types';
import { HOTEL_LEVEL, isMyTurn, propertyAt, saleRefunds } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { Button } from '../ui/ui';

/**
 * Ações do jogador da vez que dependem da casa selecionada. O servidor confere cada uma.
 * Comprar e construir ficam no modal de evolução (PropertyDecisionDialog); sediar e viajar, no aviso
 * no meio da tela (BoardChoicePrompt). Aqui resta vender ao banco para pagar uma dívida (D10).
 */
export function TileActions({ tileIndex, myId }: { tileIndex: number; myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  if (!snapshot || !isMyTurn(snapshot, myId) || snapshot.phase !== 'AWAITING_DEBT_RESOLUTION') return null;

  const { definition, property } = propertyAt(snapshot, tileIndex);
  if (!definition || !property || property.ownerId !== myId) return null;

  const refunds = saleRefunds(definition, property);
  const sales: { label: string; command: Command }[] = [];
  if (refunds.building !== null) {
    sales.push({
      label: `Vender ${property.buildingLevel === HOTEL_LEVEL ? 'hotel' : 'uma casa'} (+${formatCredits(refunds.building)})`,
      command: { type: 'SELL_BUILDING', stateId: definition.id },
    });
  }
  sales.push({
    label: `Vender estado ao banco (+${formatCredits(refunds.state)})`,
    command: { type: 'SELL_PROPERTY', stateId: definition.id },
  });

  return (
    <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
      <p className="text-rose-300">Venda ao banco para pagar sua dívida:</p>
      {sales.map((b) => (
        <Button key={b.label} className="w-full text-sm" disabled={offline} onClick={() => send(b.command)}>
          {b.label}
        </Button>
      ))}
    </div>
  );
}
