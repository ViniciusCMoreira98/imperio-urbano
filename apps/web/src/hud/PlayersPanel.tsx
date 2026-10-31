import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { HOTEL_LEVEL, leaders, netWorth } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';

/**
 * Jogadores em ordem de patrimônio (1º a 4º), como na referência: retrato, posição, nome e saldo num
 * painel roxo com borda neon na cor do peão; coroa no líder e brilho em quem joga agora.
 * Contagens e patrimônio ficam na dica (passar o mouse / tocar e segurar). No celular vira uma faixa
 * horizontal no topo; no computador, uma coluna à esquerda.
 */
export function PlayersPanel({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  if (!snapshot) return null;
  const leading = new Set(leaders(snapshot));
  // Falidos vão para o fim; os demais pelo patrimônio, mantendo o assento como desempate.
  const ranked = [...snapshot.players].sort(
    (a, b) => Number(a.bankrupt) - Number(b.bankrupt) || netWorth(snapshot, b.id) - netWorth(snapshot, a.id) || a.seat - b.seat,
  );

  return (
    <ol className="flex gap-1.5 sm:w-56 sm:flex-col sm:gap-2" aria-label="Jogadores">
      {ranked.map((p, index) => {
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
            className={`hud-panel relative flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 sm:flex-none sm:gap-2.5 sm:px-2 sm:py-1.5 ${
              p.bankrupt ? 'opacity-45 grayscale' : ''
            }`}
            style={{
              borderColor: color,
              boxShadow: isTurn ? `0 0 18px ${color}, 0 0 0 2px #fde68a` : `0 0 10px ${color}66`,
            }}
            aria-current={isTurn ? 'true' : undefined}
          >
            <span className="relative shrink-0">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl ring-2 sm:h-12 sm:w-12 sm:text-3xl"
                style={{ background: `${color}55`, ['--tw-ring-color' as string]: color }}
                aria-hidden
              >
                {AVATARS[p.avatarId].emoji}
              </span>
              <span className="absolute -bottom-1 -left-1 hidden h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-indigo-900 text-[10px] font-black text-amber-200 sm:flex">
                {index + 1}º
              </span>
              {crowned && (
                <span className="absolute -top-2.5 -left-1 text-base sm:text-lg" aria-label="Líder">
                  👑
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-bold text-white sm:text-base">
                {p.nickname}
                {p.id === myId && <span className="font-normal text-white/60"> (você)</span>}
              </p>
              <p className="text-sm font-black text-amber-300 drop-shadow sm:text-lg">{formatCredits(p.credits)}</p>
            </div>
            {status && (
              <span className="text-base" aria-label={details}>
                {status}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
