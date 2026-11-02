// Painel lateral direito: carta do estado selecionado (seção 6 dos requisitos e arte de referência),
// com dono, construções e Olimpíadas vindos do servidor e as ações do jogador da vez.
import { PAWN_COLORS } from '../game/presentation';
import { HOTEL_LEVEL, currentRent, propertyAt } from '../game/rules';
import { formatCredits, regionName, tileInfo } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { TileActions } from './TileActions';

const panelClass = 'w-full overflow-hidden hud-panel rounded-2xl text-sm sm:w-80';

/** Ícones da linha da tabela de aluguel: sem construção, 1–4 casas, hotel. */
const RENT_ICONS = ['🌱', '🏠', '🏠🏠', '🏠🏠🏠', '🏠🏠🏠🏠', '🏨'];

/** Texto escuro sobre cores claras, claro sobre escuras. */
function readableTextColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
  return luminance > 0.6 ? '#1f2a3a' : '#ffffff';
}

export function PropertyPanel({ myId }: { myId: string }) {
  const index = useViewStore((s) => s.selectedTile);
  const clearSelection = useViewStore((s) => s.clearSelection);
  const snapshot = useGameStore((s) => s.snapshot);

  if (index === null) return null;

  const info = tileInfo(index);
  const closeButton = (
    <button
      type="button"
      onClick={clearSelection}
      className="rounded px-2 text-xl leading-none opacity-80 hover:opacity-100"
      aria-label="Fechar"
    >
      ×
    </button>
  );

  if (info.kind === 'special') {
    return (
      <section className={panelClass} aria-label={info.title}>
        <header className="flex items-start justify-between bg-sky-800 px-4 py-3">
          <h2 className="text-lg font-black uppercase tracking-wide">{info.title}</h2>
          {closeButton}
        </header>
        <div className="space-y-3 p-4">
          <p className="leading-relaxed">{info.description}</p>
          <TileActions tileIndex={index} myId={myId} />
        </div>
      </section>
    );
  }

  const { state, group, rents } = info;
  const property = snapshot ? propertyAt(snapshot, index).property : undefined;
  const owner = snapshot?.players.find((p) => p.id === property?.ownerId);
  const isHost = snapshot?.olympics.hostStateId === state.id;
  const level = property?.buildingLevel ?? 0;
  const headerText = readableTextColor(group.color);

  return (
    <section className={panelClass} aria-label={state.name}>
      <header className="flex items-start justify-between px-4 py-3" style={{ background: group.color, color: headerText }}>
        <div>
          <h2 className="text-lg font-black uppercase leading-tight tracking-wide">
            {state.name} ({state.abbreviation})
          </h2>
          <p className="text-xs font-semibold opacity-85">{regionName(state)}</p>
        </div>
        {closeButton}
      </header>

      <div className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-emerald-700 px-2 py-1.5">
            <p className="text-xs text-white/85">Valor de compra</p>
            <p className="text-xl font-black">{formatCredits(state.price)}</p>
          </div>
          <div className="rounded-lg bg-white/90 px-2 py-1.5 text-slate-900">
            <p className="text-xs">Aluguel base</p>
            <p className="text-xl font-black">{formatCredits(state.rent.base)}</p>
          </div>
        </div>

        <table className="w-full" aria-label="Aluguel por construção">
          <tbody>
            {rents.map((row, i) => {
              const current = property !== undefined && i === level;
              return (
                <tr key={row.label} className={`border-t border-white/10 ${current ? 'bg-amber-300/15 font-bold text-amber-300' : ''}`}>
                  <td className="w-16 py-1 text-xs" aria-hidden>
                    {RENT_ICONS[i]}
                  </td>
                  <td className="py-1">{row.label}</td>
                  <td className="py-1 pr-1 text-right tabular-nums">{formatCredits(row.value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <dl className="grid grid-cols-2 gap-y-1">
          <dt className="text-white/70">Construir</dt>
          <dd className="text-right">
            🏠 {formatCredits(state.houseCost)} · 🏨 {formatCredits(state.hotelCost)}
          </dd>
          <dt className="text-white/70">Proprietário</dt>
          <dd className="text-right">
            {owner ? (
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PAWN_COLORS[owner.pawnColor].hex }} />
                {owner.nickname}
              </span>
            ) : (
              'Disponível'
            )}
          </dd>
          {property && (
            <>
              <dt className="text-white/70">Construções</dt>
              <dd className="text-right">{level === HOTEL_LEVEL ? 'Hotel' : `${level} casa(s)`}</dd>
              <dt className="text-white/70">Aluguel atual</dt>
              <dd className="text-right font-black text-amber-300">{formatCredits(currentRent(snapshot!, state))}</dd>
            </>
          )}
        </dl>
        {isHost && (
          <p className="rounded-lg bg-amber-300/20 px-2 py-1 text-center text-amber-200">
            🔥 Sede olímpica · aluguel ×{snapshot!.olympics.multiplier}
          </p>
        )}

        <TileActions tileIndex={index} myId={myId} />
      </div>
    </section>
  );
}
