import { rules } from '@imperio/game-data';
import type { Command } from '@imperio/shared-types';
import { HOTEL_LEVEL, affordablePurchaseHouses, buildOptions, isMyTurn, playerOf, propertyAt, saleRefunds } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { Button } from '../ui/ui';

/** Ações do jogador da vez que dependem da casa selecionada. O servidor confere cada uma. */
export function TileActions({ tileIndex, myId }: { tileIndex: number; myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  if (!snapshot || !isMyTurn(snapshot, myId)) return null;

  const me = playerOf(snapshot, myId)!;
  const { definition, property } = propertyAt(snapshot, tileIndex);
  const here = me.position === tileIndex;
  const mine = property?.ownerId === myId;
  const phase = snapshot.phase;
  const act = (command: Command) => send(command);
  const buttons: { label: string; command: Command; variant?: 'confirm' | 'primary' | 'secondary' }[] = [];

  if (phase === 'AWAITING_PURCHASE' && here && definition && !property) {
    const max = affordablePurchaseHouses(definition, me.credits);
    for (let houses = 0; houses <= max; houses++) {
      const total = definition.price + houses * definition.houseCost;
      buttons.push({
        label: houses === 0 ? `COMPRAR — ${formatCredits(total)}` : `Comprar + ${houses} 🏠 — ${formatCredits(total)}`,
        command: { type: 'BUY_PROPERTY', houses },
        variant: houses === 0 ? 'confirm' : 'secondary',
      });
    }
  }

  if (phase === 'AWAITING_BUILD' && here && definition && property && mine) {
    const options = buildOptions(property);
    for (let houses = 1; houses <= options.houses; houses++) {
      const cost = houses * definition.houseCost;
      if (cost <= me.credits) {
        buttons.push({ label: `Construir ${houses} 🏠 — ${formatCredits(cost)}`, command: { type: 'BUILD', houses }, variant: 'confirm' });
      }
    }
    if (options.hotel && definition.hotelCost <= me.credits) {
      buttons.push({ label: `Construir 🏨 hotel — ${formatCredits(definition.hotelCost)}`, command: { type: 'BUILD_HOTEL' }, variant: 'confirm' });
    }
  }

  if (phase === 'AWAITING_OLYMPICS_HOST' && definition && mine) {
    buttons.push({
      label: `🔥 Sediar Olimpíadas aqui — ${formatCredits(rules.olympics.hostFee)}`,
      command: { type: 'HOST_OLYMPICS', stateId: definition.id },
      variant: 'primary',
    });
  }

  if (phase === 'AWAITING_TRAVEL_DESTINATION' && !here) {
    buttons.push({
      label: `✈️ Viajar para cá — ${formatCredits(rules.nationalTravel.fee)}`,
      command: { type: 'CHOOSE_TRAVEL', tileIndex },
      variant: 'primary',
    });
  }

  // Vender ao banco só para pagar uma dívida que o saldo não cobre (D10).
  const sales: typeof buttons = [];
  if (definition && property && mine && phase === 'AWAITING_DEBT_RESOLUTION') {
    const refunds = saleRefunds(definition, property);
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
  }

  if (buttons.length === 0 && sales.length === 0) return null;

  return (
    <div className="space-y-2 border-t border-white/10 pt-3">
      {buttons.map((b) => (
        <Button key={b.label} variant={b.variant} className="w-full text-sm" disabled={offline} onClick={() => act(b.command)}>
          {b.label}
        </Button>
      ))}
      {sales.length > 0 && (
        <div className="space-y-2 text-sm">
          <p className="text-rose-300">Venda ao banco para pagar sua dívida:</p>
          {sales.map((b) => (
            <Button key={b.label} className="w-full text-sm" disabled={offline} onClick={() => act(b.command)}>
              {b.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
