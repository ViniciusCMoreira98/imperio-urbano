import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { HOTEL_LEVEL, leaders, netWorth } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';

/**
 * Jogadores: só avatar, nome e saldo, com a borda na cor do peão e coroa no maior patrimônio.
 * Contagens e patrimônio ficam na dica (passar o mouse / tocar e segurar). No celular vira uma faixa
 * horizontal no topo; no computador, uma coluna à esquerda.
 */
export function PlayersPanel({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  if (!snapshot) return null;
  const leading = new Set(leaders(snapshot));

  return (
    <ul className="flex gap-1.5 sm:w-52 sm:flex-col sm:gap-2" aria-label="Jogadores">
      {snapshot.players.map((p) => {
        const owned = snapshot.properties.filter((prop) => prop.ownerId === p.id);
        const houses = owned.reduce((n, prop) => n + (prop.buildingLevel < HOTEL_LEVEL ? prop.buildingLevel : 0), 0);
        const hotels = owned.filter((prop) => prop.buildingLevel === HOTEL_LEVEL).length;
        const isTurn = snapshot.currentPlayerId === p.id && snapshot.status === 'IN_PROGRESS';
        const color = PAWN_COLORS[p.pawnColor].hex;
        const crowned = leading.has(p.id) || snapshot.winnerIds.includes(p.id);
        const status = p.bankrupt ? '💀' : !p.connected ? '🤖' : p.skipTurns > 0 ? '😴' : p.travelPending ? '✈️' : null;
        const details = [
          `${owned.length} estado(s) · ${houses} casa(s) · ${hotels} hotel(éis)`,
          `Patrimônio: ${formatCredits(netWorth(snapshot, p.id))}`,
          p.bankrupt ? 'Faliu' : !p.connected ? 'Automático: desconectado, o servidor joga por ele' : null,
          p.skipTurns > 0 ? 'Descansando' : null,
          p.travelPending ? 'Viagem na próxima jogada' : null,
        ]
          .filter(Boolean)
          .join('\n');

        return (
          <li
            key={p.id}
            title={details}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border-2 bg-slate-900/90 px-2 py-1 backdrop-blur sm:flex-none sm:px-2.5 sm:py-1.5 ${
              p.bankrupt ? 'opacity-45 grayscale' : ''
            }`}
            style={{ borderColor: color, boxShadow: isTurn ? '0 0 0 2px #fcd34d' : undefined }}
            aria-current={isTurn ? 'true' : undefined}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg sm:h-9 sm:w-9 sm:text-xl"
              style={{ background: `${color}40` }}
              aria-hidden
            >
              {AVATARS[p.avatarId].emoji}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-bold text-white sm:text-sm">
                {p.nickname}
                {p.id === myId && <span className="font-normal text-white/60"> (você)</span>}
                {crowned && ' 👑'}
              </p>
              <p className="text-sm font-black text-amber-300 sm:text-base">{formatCredits(p.credits)}</p>
            </div>
            {status && (
              <span className="text-base" aria-label={details}>
                {status}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
