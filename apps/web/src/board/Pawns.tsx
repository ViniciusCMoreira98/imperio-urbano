// Personagens dos jogadores no tabuleiro, posicionados só a partir do snapshot oficial.
import { useMemo } from 'react';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { Pawn } from './Pawn';
import { pawnSpots } from './pawnLayout';

export function Pawns() {
  const players = useGameStore((s) => s.snapshot?.players);
  const currentPlayerId = useGameStore((s) => (s.snapshot?.status === 'IN_PROGRESS' ? s.snapshot.currentPlayerId : null));
  const active = useMemo(() => players?.filter((p) => !p.bankrupt) ?? [], [players]);
  const spots = useMemo(() => pawnSpots(active), [active]);

  return (
    <>
      {active.map((p) => (
        <Pawn
          key={p.id}
          position={p.position}
          spot={spots.get(p.id)!}
          avatarId={p.avatarId}
          color={PAWN_COLORS[p.pawnColor].hex}
          active={p.id === currentPlayerId}
        />
      ))}
    </>
  );
}
