// Carta de evento na tela, com a arte passiva do Codex (EventNotificationCard). Aparece quando a mesa
// para (o peão chega em Eventos), fica CARD_MS e some sozinha. O efeito já foi decidido pelo servidor;
// o que depende da carta espera ela sumir: o peão da visita às Olimpíadas, o dinheiro no painel e a
// escolha do estado no tabuleiro (cardStore). Tirar a carta da tela não resolve nada.
import { useEffect } from 'react';
import { playSound } from '../audio/audio';
import { EventNotificationCard } from '../event-art/EventNotificationCard';
import './cardReveal.css';
import { useCardStore } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';

/** Mesmo tempo que o servidor soma ao prazo (TablePresentation.CARD). */
export const CARD_MS = 4500;

export function CardReveal() {
  const cards = useGameStore((s) => s.cards);
  const players = useGameStore((s) => s.snapshot?.players);
  const doneId = useCardStore((s) => s.doneId);
  const shownId = useCardStore((s) => s.shownId);
  const diceRolling = useDiceStore((s) => s.rolling);
  const pawnsMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  const next = cards.find((card) => card.id > doneId);

  // A próxima carta aparece com a mesa parada: dados no lugar e peão já em Eventos.
  useEffect(() => {
    if (!next || shownId !== null || diceRolling || pawnsMoving) return;
    useCardStore.getState().show(next.id);
    playSound('cartaEvento');
  }, [next, shownId, diceRolling, pawnsMoving]);

  // Prazo próprio: eventos que chegam depois não reiniciam nem cancelam o fechamento.
  useEffect(() => {
    if (shownId === null) return;
    const timer = setTimeout(() => useCardStore.getState().finish(shownId), CARD_MS);
    return () => clearTimeout(timer);
  }, [shownId]);

  const shown = shownId === null ? undefined : cards.find((card) => card.id === shownId);
  if (!shown) return null;
  const who = players?.find((p) => p.id === shown.playerId)?.nickname ?? 'Alguém';
  return (
    <div className="sc-event-layer">
      <div className="card-reveal">
        <p className="card-reveal-who">Carta de {who}</p>
        <EventNotificationCard eventId={shown.cardId} />
        {shown.withoutEffect && (
          <p className="card-reveal-note">
            {shown.cardId === 'visita-olimpica' ? 'Sem efeito agora: ainda não há sede das Olimpíadas.' : 'Sem efeito agora: não há estado para escolher.'}
          </p>
        )}
      </div>
    </div>
  );
}
