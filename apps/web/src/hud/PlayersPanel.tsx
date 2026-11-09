import { PAWN_COLORS } from '../game/presentation';
import { LeaderCrown, PlayerPortrait } from './AvatarPortrait';
import { HOTEL_LEVEL, leaders, netWorth } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { heldCredits } from '../game/eventCards';
import { heldMoveCredits } from '../game/heldMoney';
import { usePawnStore } from '../store/pawnStore';
import { useCardStore } from '../store/cardStore';
import { useGameStore } from '../store/gameStore';
import { useShownTurnPlayerId } from '../store/shownTurn';

/** Escurece a cor (0 a 1); escura o bastante para o saldo amarelo e o nome branco seguirem legíveis. */
function darken(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * (1 - amount));
  return `rgb(${c((n >> 16) & 255)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

/** Fundo do card na cor do peão do jogador (pedido do usuário, 07/11/2026). */
export function playerCardBackground(color: string): string {
  return `linear-gradient(145deg, ${darken(color, 0.35)}, ${darken(color, 0.72)} 75%)`;
}

/**
 * Jogadores em ordem de patrimônio (1º a 4º), como na referência: retrato, posição, nome e saldo num
 * painel roxo com borda neon na cor do peão; coroa no líder e brilho em quem joga agora.
 * Contagens e patrimônio ficam na dica (passar o mouse / tocar e segurar). No celular vira uma faixa
 * horizontal no topo; no computador, uma coluna à esquerda.
 */
export function PlayersPanel({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  // Dinheiro de carta de evento só aparece quando a carta some da tela.
  const cards = useGameStore((s) => s.cards);
  const doneId = useCardStore((s) => s.doneId);
  // Aluguel, taxa, saque e bônus do Início só aparecem quando o personagem chega.
  const money = useGameStore((s) => s.money);
  const landed = usePawnStore((s) => s.landed);
  const passedStart = usePawnStore((s) => s.passedStart);
  // O destaque da vez acompanha a mesa, como o card da vez.
  const turnId = useShownTurnPlayerId();
  if (!snapshot) return null;
  const held = heldCredits(cards, doneId);
  for (const [id, amount] of Object.entries(heldMoveCredits(money, landed, passedStart))) held[id] = (held[id] ?? 0) + amount;
  const leading = new Set(leaders(snapshot));
  // Falidos vão para o fim; os demais pelo patrimônio, mantendo o assento como desempate.
  const ranked = [...snapshot.players].sort(
    (a, b) => Number(a.bankrupt) - Number(b.bankrupt) || netWorth(snapshot, b.id) - netWorth(snapshot, a.id) || a.seat - b.seat,
  );

  return (
    <ol style={{['--mobile-player-rows' as string]:Math.ceil(ranked.length/2)}} className="hud-players flex gap-1.5 sm:w-56 sm:flex-col sm:gap-2" aria-label="Jogadores">
      {ranked.map((p, index) => {
        const owned = snapshot.properties.filter((prop) => prop.ownerId === p.id);
        const houses = owned.reduce((n, prop) => n + (prop.buildingLevel < HOTEL_LEVEL ? prop.buildingLevel : 0), 0);
        const hotels = owned.filter((prop) => prop.buildingLevel === HOTEL_LEVEL).length;
        const isTurn = turnId === p.id && snapshot.status === 'IN_PROGRESS';
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
            className={`hud-player-row hud-panel relative flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 sm:flex-none sm:gap-2.5 sm:px-2 sm:py-1.5 ${
              p.bankrupt ? 'opacity-45 grayscale' : ''
            }`}
            style={{
              ['--mobile-player-column' as string]:index<Math.ceil(ranked.length/2)?1:3,
              ['--mobile-player-row' as string]:index<Math.ceil(ranked.length/2)?index+1:index-Math.ceil(ranked.length/2)+1+Math.ceil(ranked.length/2)-(ranked.length-Math.ceil(ranked.length/2)),
              background: playerCardBackground(color),
              borderColor: color,
              boxShadow: isTurn ? `0 0 18px ${color}, 0 0 0 2px #fde68a` : `0 0 10px ${color}66`,
            }}
            aria-current={isTurn ? 'true' : undefined}
          >
            <span className="hud-player-portrait relative shrink-0">
              <span
                className="hud-avatar-frame flex h-9 w-9 items-center justify-center rounded-full text-xl ring-2 sm:h-12 sm:w-12 sm:text-3xl"
                style={{ background: `${color}55`, ['--tw-ring-color' as string]: color }}
                aria-hidden
              >
                <PlayerPortrait avatarId={p.avatarId} photoUrl={p.photoUrl}/>
              </span>
              <span className="hud-player-rank absolute -bottom-1 -left-1 hidden h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-indigo-900 text-[10px] font-black text-amber-200 sm:flex">
                {index + 1}º
              </span>
              {/* Status como selo sobre o retrato: não ocupa largura no card. */}
              {status && (
                <span className="hud-player-status absolute -right-1.5 -top-1.5 text-sm leading-none" aria-label={details}>
                  {status}
                </span>
              )}
              {crowned && (
                <span className="absolute -top-2.5 -left-1 text-base sm:text-lg">
                  <LeaderCrown/>
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="hud-player-name truncate text-xs font-bold text-white sm:text-base">
                {p.nickname}
                {p.id === myId && <span className="font-normal text-white/60"> (você)</span>}
              </p>
              <p className="hud-player-balance text-sm font-black text-amber-300 drop-shadow sm:text-lg">{formatCredits(p.credits - (held[p.id] ?? 0))}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
