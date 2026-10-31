// Painel lateral direito: dados da casa selecionada (seção 11 dos requisitos), dono e construções
// vindos do servidor e as ações disponíveis para o jogador da vez.
import { PAWN_COLORS } from '../game/presentation';
import { HOTEL_LEVEL, currentRent, propertyAt } from '../game/rules';
import { formatCredits, regionName, tileInfo } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { TileActions } from './TileActions';

const panelClass = 'w-72 overflow-hidden rounded-xl bg-slate-900/85 text-sm shadow-lg backdrop-blur';

/** Texto escuro sobre cores claras, claro sobre escuras. */
function readableTextColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
  return luminance > 0.6 ? '#1f2a3a' : '#ffffff';
}

export function PropertyPanel({ myId }: { myId: string }) {
  const index = useViewStore((s) => s.selectedTile);
  const clearFocus = useViewStore((s) => s.clearFocus);
  const snapshot = useGameStore((s) => s.snapshot);

  if (index === null) {
    return <div className={`${panelClass} p-3 text-white/70`}>Clique em uma casa para ver os detalhes.</div>;
  }

  const info = tileInfo(index);
  const closeButton = (
    <button
      type="button"
      onClick={clearFocus}
      className="rounded px-2 text-lg leading-none opacity-80 hover:opacity-100"
      aria-label="Fechar"
    >
      ×
    </button>
  );

  if (info.kind === 'special') {
    return (
      <section className={panelClass} aria-label={info.title}>
        <header className="flex items-start justify-between bg-white/10 px-3 py-2">
          <h2 className="text-base font-bold">{info.title}</h2>
          {closeButton}
        </header>
        <div className="space-y-3 p-3">
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

  return (
    <section className={panelClass} aria-label={state.name}>
      <header
        className="flex items-start justify-between px-3 py-2"
        style={{ background: group.color, color: readableTextColor(group.color) }}
      >
        <div>
          <h2 className="text-lg font-extrabold leading-tight">{state.name}</h2>
          <p className="text-xs font-semibold opacity-85">
            {state.abbreviation} · {regionName(state)} · Grupo {group.name}
          </p>
        </div>
        {closeButton}
      </header>

      <div className="space-y-3 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-white/70">Valor de compra</span>
          <span className="text-lg font-bold">{formatCredits(state.price)}</span>
        </div>

        <table className="w-full">
          <caption className="pb-1 text-left text-xs uppercase tracking-wide text-white/60">Aluguel</caption>
          <tbody>
            {rents.map((row, i) => (
              <tr key={row.label} className={`border-t border-white/10 ${property && i === level ? 'font-bold text-amber-300' : ''}`}>
                <td className="py-1">{row.label}</td>
                <td className="py-1 text-right tabular-nums">{formatCredits(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="grid grid-cols-2 gap-y-1">
          <dt className="text-white/70">Cada casa</dt>
          <dd className="text-right font-semibold">{formatCredits(state.houseCost)}</dd>
          <dt className="text-white/70">Hotel</dt>
          <dd className="text-right font-semibold">{formatCredits(state.hotelCost)}</dd>
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
              <dd className="text-right font-bold text-amber-300">{formatCredits(currentRent(snapshot!, state))}</dd>
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
