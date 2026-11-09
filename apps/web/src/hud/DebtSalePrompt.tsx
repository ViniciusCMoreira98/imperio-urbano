// Dívida maior que o saldo (08/11/2026): como na escolha da sede, o jogador toca nos próprios estados no
// tabuleiro (ChoiceHighlights destaca e marca) e este aviso soma quanto o banco paga por eles, inteiros.
// "Vender" só libera quando a soma com o saldo paga a dívida; sem como pagar, resta a falência.
import { useEffect } from 'react';
import { SALE_PERCENT, saleSummary } from '../game/debtSale';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { useSaleStore } from '../store/saleStore';
import { useViewStore } from '../store/viewStore';
import { Button } from '../ui/ui';
import { Countdown } from './ActionBar';

const buildingsText = (b: number | 'hotel') => (b === 'hotel' ? 'com hotel' : b === 0 ? 'só terreno' : b === 1 ? 'com 1 casa' : `com ${b} casas`);

export function DebtSalePrompt({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const deadline = useGameStore((s) => s.turnDeadline);
  const selected = useViewStore((s) => s.selectedTile);
  const clearSelection = useViewStore((s) => s.clearSelection);
  const picked = useSaleStore((s) => s.picked);
  const toggle = useSaleStore((s) => s.toggle);
  const clearPicked = useSaleStore((s) => s.clear);
  const summary = snapshot ? saleSummary(snapshot, myId, picked) : null;
  const ownKey = summary?.ownTiles.join(',') ?? '';

  // Cada dívida começa sem estados marcados.
  useEffect(() => {
    clearPicked();
    return () => clearPicked();
  }, [clearPicked]);

  // Tocar num estado próprio marca ou desmarca; tocar em outro só some (o aviso não abre a consulta).
  useEffect(() => {
    if (selected === null) return;
    if (ownKey.split(',').includes(String(selected))) toggle(selected);
    clearSelection();
  }, [selected, ownKey, toggle, clearSelection]);

  if (!snapshot || !summary) return null;
  const debt = snapshot.pendingDebt!;
  const creditor = debt.toTaxPool
    ? 'a Taxa'
    : debt.creditorId
      ? (snapshot.players.find((p) => p.id === debt.creditorId)?.nickname ?? 'outro jogador')
      : 'o banco';
  const leftover = summary.credits + summary.total - summary.debt;
  const sell = () => {
    send({ type: 'SELL_STATES', stateIds: summary.items.map((i) => i.stateId) });
    clearPicked();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-3">
      <section role="dialog" aria-label="Pagar a dívida" className="debt-sale hud-panel pointer-events-auto w-[min(24rem,100%)] rounded-2xl border border-rose-300/60 px-4 py-3 text-white shadow-2xl">
        <div className="mb-1 flex items-center justify-center gap-2">
          <h2 className="text-lg font-black tracking-wide text-amber-200 sm:text-xl">💰 Pagar a dívida</h2>
          {deadline !== null && <Countdown deadline={deadline} warn />}
        </div>

        <dl className="debt-sale-numbers grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm">
          <dt className="text-white/75">Você deve a {creditor}</dt>
          <dd className="text-right font-black text-rose-200">{formatCredits(summary.debt)}</dd>
          <dt className="text-white/75">Seu saldo</dt>
          <dd className="text-right font-bold">{formatCredits(summary.credits)}</dd>
        </dl>

        {summary.hopeless ? (
          <p className="mt-2 text-center text-sm text-rose-200">Nem vendendo todos os seus estados dá para pagar.</p>
        ) : (
          <>
            <p className="mt-2 text-center text-xs text-white/80">
              Toque nos seus estados destacados. O banco paga {SALE_PERCENT}% do terreno e das construções.
            </p>
            {summary.items.length > 0 && (
              <ul className="debt-sale-list mt-2 max-h-32 space-y-1 overflow-y-auto pr-1 text-sm">
                {summary.items.map((item) => (
                  <li key={item.stateId} className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/60 px-2 py-1">
                    <span>
                      <strong>{item.name}</strong> <span className="text-xs text-white/60">{buildingsText(item.buildings)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-emerald-200">+{formatCredits(item.value)}</span>
                      <button type="button" className="px-1 text-white/70" aria-label={`Desmarcar ${item.name}`} onClick={() => toggle(item.tile)}>
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="debt-sale-total mt-2 flex items-center justify-between rounded-lg bg-slate-900/70 px-3 py-1.5 text-sm">
              <span>Você recebe</span>
              <strong className="text-base text-emerald-200">{formatCredits(summary.total)}</strong>
            </div>
            <p role="status" className={`mt-1 text-center text-sm font-bold ${summary.covers ? 'text-emerald-200' : 'text-rose-200'}`}>
              {summary.covers ? `Paga a dívida e sobram ${formatCredits(leftover)}` : `Faltam ${formatCredits(summary.missing)}`}
            </p>
          </>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {!summary.hopeless && (
            <Button variant="primary" disabled={offline || !summary.covers} onClick={sell}>
              {summary.items.length ? `Vender ${summary.items.length === 1 ? '1 estado' : `${summary.items.length} estados`}` : 'Marque estados para vender'}
            </Button>
          )}
          <Button variant="danger" disabled={offline} onClick={() => send({ type: 'DECLARE_BANKRUPTCY' })}>
            Falência
          </Button>
        </div>
      </section>
    </div>
  );
}
