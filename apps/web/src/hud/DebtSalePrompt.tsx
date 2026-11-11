// Dívida maior que o saldo (08/11/2026): como na escolha da sede, o jogador toca nos próprios estados no
// tabuleiro (ChoiceHighlights destaca e marca) e este aviso soma quanto o banco paga por eles, inteiros.
// "Vender" só libera quando a soma com o saldo paga a dívida; sem como pagar, resta a falência.
import { useEffect } from 'react';
import { SALE_PERCENT, saleSummary } from '../game/debtSale';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { useSaleStore } from '../store/saleStore';
import { useViewStore } from '../store/viewStore';
import { Countdown } from './ActionBar';
import emblem from './art/debt-emblem.webp';
import './debtArt.css';

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
    // Dentro do miolo do tabuleiro (BoardCenterSlot): os estados a vender ficam à vista para tocar.
    // Arte do Codex (assets/debt/payment-v1, 11/11/2026): moldura em nove partes e emblema do livro-caixa.
    <section role="dialog" aria-labelledby="debt-art-title" className={`debt-art pointer-events-auto${summary.hopeless ? ' debt-art-hopeless' : ''}`}>
      <header className="debt-art-intro">
        <img className="debt-art-emblem" src={emblem} alt="" />
        <h2 id="debt-art-title">Pagar a dívida</h2>
        {deadline !== null && (
          <span className="debt-art-timer">
            <Countdown deadline={deadline} warn />
          </span>
        )}
      </header>

      <dl className="debt-art-numbers">
        <div>
          <dt>Você deve a {creditor}</dt>
          <dd className="debt-art-debt">{formatCredits(summary.debt)}</dd>
        </div>
        <div>
          <dt>Seu saldo</dt>
          <dd>{formatCredits(summary.credits)}</dd>
        </div>
      </dl>

      {summary.hopeless ? (
        <p role="status" className="debt-art-status">Nem vendendo todos os seus estados dá para pagar.</p>
      ) : (
        <>
          {summary.items.length === 0 ? (
            <p className="debt-art-instruction">
              <b>Toque nos seus estados destacados.</b>
              <small>O banco paga {SALE_PERCENT}% do terreno e das construções.</small>
            </p>
          ) : (
            <ul className="debt-art-list">
              {summary.items.map((item) => (
                <li key={item.stateId}>
                  <span className="debt-art-item">
                    <b>{item.name}</b> <small>{buildingsText(item.buildings)}</small>
                  </span>
                  <strong>+{formatCredits(item.value)}</strong>
                  <button type="button" aria-label={`Desmarcar ${item.name}`} onClick={() => toggle(item.tile)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {summary.items.length > 0 && (
            <p className="debt-art-total">
              <span>Você recebe</span>
              <strong>{formatCredits(summary.total)}</strong>
            </p>
          )}
          <p role="status" className={`debt-art-status${summary.covers ? ' debt-art-covers' : ''}`}>
            {summary.covers ? `Paga a dívida e sobram ${formatCredits(leftover)}` : `Faltam ${formatCredits(summary.missing)}`}
          </p>
        </>
      )}

      <div className="debt-art-actions">
        {!summary.hopeless && (
          <button type="button" className="debt-art-confirm" disabled={offline || !summary.covers} onClick={sell}>
            {summary.items.length ? `Vender ${summary.items.length === 1 ? '1 estado' : `${summary.items.length} estados`}` : 'Marque estados'}
          </button>
        )}
        <button type="button" className="debt-art-bankrupt" disabled={offline} onClick={() => send({ type: 'DECLARE_BANKRUPTCY' })}>
          Falência
        </button>
      </div>
    </section>
  );
}
