import { useEffect, useRef, useState } from 'react';
import { eventCards } from '@imperio/game-data';
import type { EventCard } from '@imperio/shared-types';
import { useGameStore } from '../store/gameStore';

const cardsById = new Map(eventCards.map((c) => [c.id, c]));
const SHOW_MS = 4500;

/** Mostra por alguns segundos a carta de eventos que alguém acabou de tirar. */
export function CardReveal() {
  const log = useGameStore((s) => s.log);
  const players = useGameStore((s) => s.snapshot?.players);
  const seen = useRef(log.length);
  const [shown, setShown] = useState<{ card: EventCard; who: string } | null>(null);

  useEffect(() => {
    const fresh = log.slice(Math.min(seen.current, log.length));
    seen.current = log.length;
    const drawn = [...fresh].reverse().find((event) => event.type === 'EVENT_CARD_DRAWN');
    if (!drawn || drawn.type !== 'EVENT_CARD_DRAWN') return;
    const card = cardsById.get(drawn.cardId);
    if (!card) return;
    setShown({ card, who: players?.find((p) => p.id === drawn.playerId)?.nickname ?? 'Alguém' });
  }, [log]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prazo próprio: eventos que chegam depois não reiniciam nem cancelam o fechamento.
  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(null), SHOW_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  if (!shown) return null;
  return (
    <div
      role="status"
      className="pointer-events-auto w-72 cursor-pointer rounded-2xl border-4 border-violet-300 bg-gradient-to-b from-violet-600 to-violet-900 p-4 text-center text-white shadow-2xl"
      onClick={() => setShown(null)}
      title="Clique para fechar"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Evento · {shown.who}</p>
      <p className="my-1 text-4xl" aria-hidden>
        ❓
      </p>
      <h3 className="text-lg font-black">{shown.card.title}</h3>
      <p className="mt-1 text-sm leading-snug text-white/90">{shown.card.text}</p>
    </div>
  );
}
