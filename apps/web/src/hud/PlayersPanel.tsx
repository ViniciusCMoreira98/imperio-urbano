import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';

/** Painel esquerdo: jogadores, saldo, propriedades e de quem é a vez. */
export function PlayersPanel({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  if (!snapshot) return null;

  return (
    <ul className="w-60 space-y-2" aria-label="Jogadores">
      {snapshot.players.map((p) => {
        const owned = snapshot.properties.filter((prop) => prop.ownerId === p.id);
        const houses = owned.reduce((n, prop) => n + (prop.buildingLevel < 5 ? prop.buildingLevel : 0), 0);
        const hotels = owned.filter((prop) => prop.buildingLevel === 5).length;
        const isTurn = snapshot.currentPlayerId === p.id && snapshot.status === 'IN_PROGRESS';
        const color = PAWN_COLORS[p.pawnColor].hex;
        return (
          <li
            key={p.id}
            className={`rounded-xl border-2 bg-slate-900/85 px-3 py-2 text-sm backdrop-blur ${p.bankrupt ? 'opacity-45' : ''}`}
            style={{ borderColor: isTurn ? '#fcd34d' : `${color}88` }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-xl" style={{ background: `${color}55` }} aria-hidden>
                {AVATARS[p.avatarId].emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">
                  {p.nickname}
                  {p.id === myId && <span className="font-normal text-white/60"> (você)</span>}
                  {snapshot.winnerIds.includes(p.id) && ' 👑'}
                </p>
                <p className="text-lg font-extrabold leading-tight text-amber-300">{formatCredits(p.credits)}</p>
              </div>
              {isTurn && <span className="rounded bg-amber-300 px-1.5 text-xs font-bold text-slate-900">VEZ</span>}
            </div>
            <p className="mt-1 text-xs text-white/70">
              🏠 {owned.length} estado(s) · {houses} casa(s) · {hotels} hotel(éis)
              {!p.connected && !p.bankrupt && (
                <span className="text-sky-300" title="Desconectado: o servidor joga por este jogador até ele voltar."> · 🤖 automático</span>
              )}
              {p.bankrupt && <span className="text-rose-300"> · faliu</span>}
              {p.skipTurns > 0 && <span className="text-sky-300"> · descansando</span>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
