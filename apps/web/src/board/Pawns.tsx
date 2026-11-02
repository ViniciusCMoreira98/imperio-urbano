// Personagens dos jogadores no tabuleiro, posicionados só a partir do snapshot oficial.
// Quem falir continua na tela o tempo da saída (no último lugar que ocupou); quem vencer comemora.
import { useMemo, useRef } from 'react';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { tileAnchor } from './layout';
import { Pawn } from './Pawn';
import { type PawnSpot, pawnCenter, pawnSpots } from './pawnLayout';

export function Pawns() {
  const players = useGameStore((s) => s.snapshot?.players);
  const status = useGameStore((s) => s.snapshot?.status);
  const winnerIds = useGameStore((s) => s.snapshot?.winnerIds);
  const currentPlayerId = useGameStore((s) => (s.snapshot?.status === 'IN_PROGRESS' ? s.snapshot.currentPlayerId : null));
  const selectedTile = useViewStore((s) => s.selectedTile);
  const standing = useMemo(() => players?.filter((p) => !p.bankrupt) ?? [], [players]);
  const spots = useMemo(() => pawnSpots(standing), [standing]);
  // Último lugar de cada um: quem acabou de falir sai dali, sem pular para outro ponto.
  const lastSpots = useRef(new Map<string, PawnSpot>());

  return (
    <>
      {(players ?? []).map((p) => {
        const base = spots.get(p.id) ?? lastSpots.current.get(p.id) ?? pawnCenter(p.position);
        // A casa selecionada sobe um pouco; quem está nela sobe junto (sem afundar no tabuleiro).
        const spot = p.position === selectedTile && !p.bankrupt ? { ...base, y: base.y + tileAnchor(p.position).selectedLift } : base;
        if (!p.bankrupt) lastSpots.current.set(p.id, base);
        return (
          <Pawn
            key={p.id}
            playerId={p.id}
            position={p.position}
            spot={spot}
            avatarId={p.avatarId}
            color={PAWN_COLORS[p.pawnColor].hex}
            active={p.id === currentPlayerId}
            leaving={p.bankrupt}
            celebrating={status === 'FINISHED' && (winnerIds ?? []).includes(p.id)}
          />
        );
      })}
    </>
  );
}
