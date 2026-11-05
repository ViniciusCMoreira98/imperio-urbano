import { PAWN_COLORS } from '../game/presentation';
import { AvatarPortrait } from './AvatarPortrait';
import { useGameStore } from '../store/gameStore';

/** Retrato e vez integrados à barra de ação; o rótulo acessível preserva o contrato da engenharia. */
export function TurnBadge({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const current = snapshot?.players.find((p) => p.id === snapshot.currentPlayerId);
  if (!snapshot || snapshot.status !== 'IN_PROGRESS' || !current) return null;
  const color = PAWN_COLORS[current.pawnColor].hex;
  const name = current.id === myId ? 'Você' : current.nickname;
  return (
    <div role="status" aria-label={'Turno de: ' + name} className="hud-turn-badge hud-panel flex items-center gap-3 rounded-2xl px-3 py-2" style={{ borderColor: color }}>
      <span
        className="hud-avatar-frame flex h-11 w-11 items-center justify-center rounded-full text-3xl ring-2"
        style={{ background: `${color}55`, ['--tw-ring-color' as string]: color }}
        aria-hidden
      >
        <AvatarPortrait avatarId={current.avatarId}/>
      </span>
      <div className="leading-tight">
        <p className="text-xs text-white/80">{current.id===myId?'Jogando agora':'Vez de'}</p>
        <p className="text-lg font-black text-amber-300">{current.id===myId?'Sua vez':name}</p>
      </div>
    </div>
  );
}
