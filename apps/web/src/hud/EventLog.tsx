import { useEffect, useRef, useState } from 'react';
import { eventCards } from '@imperio/game-data';
import { describeEvent } from '../game/presentation';
import { useGameStore } from '../store/gameStore';

type Tab = 'history' | 'cards';

const cardsById = new Map(eventCards.map((c) => [c.id, c]));

/** Histórico das jogadas e das cartas tiradas, recolhido num botão para não poluir a tela. */
export function EventLog() {
  const log = useGameStore((s) => s.log);
  const players = useGameStore((s) => s.snapshot?.players);
  const [tab, setTab] = useState<Tab>('history');
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [log, tab]);

  const name = (id: string) => players?.find((p) => p.id === id)?.nickname ?? 'Alguém';
  const lines =
    tab === 'history'
      ? log.map((event) => describeEvent(event, name)).filter((line): line is string => line !== null)
      : log.flatMap((event) => {
          if (event.type !== 'EVENT_CARD_DRAWN') return [];
          const card = cardsById.get(event.cardId);
          return card ? [`${name(event.playerId)} · ${card.title}: ${card.text}`] : [];
        });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-xl border-2 border-white/10 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white/85 backdrop-blur hover:bg-slate-800"
      >
        📜 Histórico
      </button>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-xl border-2 border-white/10 bg-slate-900/90 text-xs text-white/85 backdrop-blur sm:w-72" aria-label="Histórico">
      <div className="flex border-b border-white/10" role="tablist">
        {(
          [
            ['history', 'Histórico'],
            ['cards', 'Cartas'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 text-sm font-bold ${tab === id ? 'bg-sky-800 text-white' : 'text-white/60 hover:bg-white/5'}`}
          >
            {label}
          </button>
        ))}
        <button type="button" className="px-3 text-base text-white/70 hover:text-white" aria-label="Fechar histórico" onClick={() => setOpen(false)}>
          ×
        </button>
      </div>
      <ol ref={listRef} className="max-h-36 space-y-1 overflow-y-auto p-3 pr-2" aria-live="polite">
        {lines.length === 0 && (
          <li className="text-white/50">{tab === 'history' ? 'As jogadas aparecem aqui.' : 'Nenhuma carta tirada ainda.'}</li>
        )}
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
