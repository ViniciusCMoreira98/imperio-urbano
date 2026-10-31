import { useEffect, useRef } from 'react';
import { describeEvent } from '../game/presentation';
import { useGameStore } from '../store/gameStore';

/** Histórico das últimas jogadas, em português. */
export function EventLog() {
  const log = useGameStore((s) => s.log);
  const players = useGameStore((s) => s.snapshot?.players);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [log]);

  const name = (id: string) => players?.find((p) => p.id === id)?.nickname ?? 'Alguém';
  const lines = log.map((event) => describeEvent(event, name)).filter((line): line is string => line !== null);

  return (
    <section className="w-80 rounded-xl bg-slate-900/85 p-3 text-xs text-white/85 backdrop-blur" aria-label="Histórico">
      <h3 className="mb-1 text-sm font-bold text-white">Histórico</h3>
      <ol ref={listRef} className="max-h-36 space-y-1 overflow-y-auto pr-1" aria-live="polite">
        {lines.length === 0 && <li className="text-white/50">As jogadas aparecem aqui.</li>}
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
