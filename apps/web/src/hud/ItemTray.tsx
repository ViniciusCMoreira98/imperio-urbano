import { useEffect, useState } from 'react';
import type { GameSnapshot } from '@imperio/shared-types';
import { RentWaiverItemIndicator } from '../event-art/RentWaiverItemIndicator';
import { RestExitItemButton } from '../event-art/RestExitItemButton';
import { isMyTurn } from '../game/rules';
import { useGameStore } from '../store/gameStore';

/** Pode usar o Passe Livre agora: própria vez, antes de rolar e ainda no Descanso. */
export function canUseRestPass(snapshot: GameSnapshot, myId: string): boolean {
  const me = snapshot.players.find((p) => p.id === myId);
  return (
    !!me &&
    snapshot.status === 'IN_PROGRESS' &&
    isMyTurn(snapshot, myId) &&
    snapshot.phase === 'AWAITING_ROLL' &&
    me.skipTurns > 0 &&
    (me.restPasses ?? 0) > 0
  );
}

/**
 * Itens guardados das cartas de evento (Passe Livre e Aluguel Zero). Quantidades vêm só do servidor:
 * nada é descontado antes da resposta. O Passe Livre aparece enquanto o jogador está no Descanso, quando serve.
 */
export function ItemTray({ snapshot, myId, busy }: { snapshot: GameSnapshot; myId: string; busy: boolean }) {
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const rejection = useGameStore((s) => s.rejection);
  const [pending, setPending] = useState(false);
  // Qualquer snapshot novo (uso aceito) ou recusa encerra a espera.
  useEffect(() => setPending(false), [snapshot.version, rejection]);

  const me = snapshot.players.find((p) => p.id === myId);
  if (!me || me.bankrupt || snapshot.status !== 'IN_PROGRESS') return null;
  const passes = me.skipTurns > 0 ? (me.restPasses ?? 0) : 0;
  const waivers = me.rentWaivers ?? 0;
  if (passes <= 0 && waivers <= 0) return null;

  return (
    <div className="hud-item-tray">
      <RestExitItemButton
        quantity={passes}
        canUse={canUseRestPass(snapshot, myId) && !offline && !busy}
        pending={pending}
        onUse={() => {
          setPending(true);
          send({ type: 'USE_REST_PASS' });
        }}
      />
      <RentWaiverItemIndicator quantity={waivers} />
    </div>
  );
}
