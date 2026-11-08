import { useEffect, useState } from 'react';
import type { GameSnapshot } from '@imperio/shared-types';
import { RentWaiverItemIndicator } from '../event-art/RentWaiverItemIndicator';
import { RestExitItemButton } from '../event-art/RestExitItemButton';
import { isMyTurn } from '../game/rules';
import { useCardBusy } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';
import cardsIcon from './art/cards/cards-v1.svg';
import './itemDrawer.css';

/** Pode usar o Passe Livre agora: própria vez, antes de rolar e ainda no Descanso. */
export function canUseRestPass(snapshot: GameSnapshot, myId: string): boolean {
  const me = snapshot.players.find((p) => p.id === myId);
  return (
    !!me &&
    snapshot.status === 'IN_PROGRESS' &&
    isMyTurn(snapshot, myId) &&
    snapshot.phase === 'AWAITING_ROLL' &&
    me.skipTurns > 0 &&
    (me.restPasses ?? 0) > 0
  );
}

/** Cartas guardadas do jogador desta tela (Passe Livre + Aluguel Zero); 0 fora da partida ou falido. */
export function heldItemCount(snapshot: GameSnapshot, myId: string): number {
  const me = snapshot.players.find((p) => p.id === myId);
  if (!me || me.bankrupt || snapshot.status !== 'IN_PROGRESS') return 0;
  return (me.restPasses ?? 0) + (me.rentWaivers ?? 0);
}

/**
 * Cartas guardadas (pedido do usuário, 07/11/2026): um botão com ícone de cartas na coluna da direita abre
 * uma gaveta lateral, sem ocupar o tabuleiro. O botão só aparece com alguma carta guardada e brilha quando
 * o Passe Livre pode ser usado. Quantidades vêm só do servidor: nada é descontado antes da resposta.
 */
export function ItemDrawer({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const rejection = useGameStore((s) => s.rejection);
  // Não usar enquanto a jogada anterior ainda aparece na mesa (dados, personagens ou carta).
  const diceRolling = useDiceStore((s) => s.rolling);
  const tableMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  const cardBusy = useCardBusy();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  // Qualquer snapshot novo (uso aceito) ou recusa encerra a espera.
  useEffect(() => setPending(false), [snapshot?.version, rejection]);
  const count = snapshot ? heldItemCount(snapshot, myId) : 0;
  useEffect(() => {
    if (count === 0) setOpen(false);
  }, [count]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!snapshot || count === 0) return null;
  const me = snapshot.players.find((p) => p.id === myId)!;
  const usable = canUseRestPass(snapshot, myId);

  return (
    <>
      <button
        type="button"
        className={`hud-cards-button${usable ? ' hud-cards-ready' : ''}`}
        aria-expanded={open}
        aria-controls="hud-cards-drawer"
        aria-haspopup="dialog"
        aria-label={`Cartas guardadas: ${count}${usable ? '. Passe Livre disponível agora' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <img className="hud-cards-icon" src={cardsIcon} alt="" draggable={false}/>
        <span className="hud-cards-label">Cartas</span>
        <span className="hud-cards-count">{count}</span>
      </button>
      {open && (
        <aside id="hud-cards-drawer" className="hud-cards-drawer" role="dialog" aria-label="Cartas guardadas">
          <header>
            <div className="hud-cards-heading"><img src={cardsIcon} alt=""/><div><h2>Suas cartas</h2><p>{count} {count===1?'carta guardada':'cartas guardadas'}</p></div></div>
            <button type="button" aria-label="Fechar cartas" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <div className="hud-cards-list">
            <RestExitItemButton
              quantity={me.restPasses ?? 0}
              canUse={usable && !offline && !diceRolling && !tableMoving && !cardBusy}
              pending={pending}
              onUse={() => {
                setPending(true);
                send({ type: 'USE_REST_PASS' });
              }}
            />
            <RentWaiverItemIndicator quantity={me.rentWaivers ?? 0} />
          </div>
        </aside>
      )}
    </>
  );
}
