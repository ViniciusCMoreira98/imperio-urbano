// Painel lateral direito: dados da casa selecionada (seção 11 dos requisitos).
// Proprietário e ações ainda não existem fora de uma partida; entram com o estado vindo do servidor.
import { formatCredits, regionName, tileInfo } from '../property-card/tileInfo';
import { useViewStore } from '../store/viewStore';

const panelClass = 'w-72 overflow-hidden rounded-xl bg-black/50 text-sm shadow-lg backdrop-blur';

/** Texto escuro sobre cores claras, claro sobre escuras. */
function readableTextColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
  return luminance > 0.6 ? '#1f2a3a' : '#ffffff';
}

export function PropertyPanel() {
  const index = useViewStore((s) => s.focusedTile);
  const clearFocus = useViewStore((s) => s.clearFocus);

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
        <p className="p-3 leading-relaxed">{info.description}</p>
      </section>
    );
  }

  const { state, group, rents } = info;
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
            {rents.map((row) => (
              <tr key={row.label} className="border-t border-white/10">
                <td className="py-1">{row.label}</td>
                <td className="py-1 text-right font-semibold tabular-nums">{formatCredits(row.value)}</td>
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
          <dd className="text-right">Disponível</dd>
        </dl>

        <div className="flex gap-2" title="Disponível durante a partida">
          <button type="button" disabled className="flex-1 rounded-lg bg-emerald-600 py-1.5 font-semibold disabled:opacity-40">
            Comprar
          </button>
          <button type="button" disabled className="flex-1 rounded-lg bg-amber-600 py-1.5 font-semibold disabled:opacity-40">
            Construir
          </button>
        </div>
      </div>
    </section>
  );
}
