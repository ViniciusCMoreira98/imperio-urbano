// Selo acima da barra de ações: rodada e modo; nos modos por tempo, o relógio da partida correndo.
import { useEffect, useMemo, useState } from 'react';
import type { GameSnapshot } from '@imperio/shared-types';
import { clockText, modeName } from '../game/modes';

export function RoundSeal({ snapshot }: { snapshot: GameSnapshot }) {
  const left = snapshot.gameTimeLeftMs;
  // O servidor manda quanto faltava ao enviar; o fim é contado a partir da chegada do snapshot.
  const endsAt = useMemo(() => (left === null ? null : Date.now() + left), [snapshot, left]); // eslint-disable-line react-hooks/exhaustive-deps
  const [now, setNow] = useState(() => Date.now());
  const running = endsAt !== null && !snapshot.timeUp && snapshot.status === 'IN_PROGRESS';
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  let clock: string | null = null;
  if (endsAt !== null && snapshot.status === 'IN_PROGRESS') {
    clock = snapshot.timeUp ? 'Tempo esgotado · última vez' : clockText(endsAt - now);
  }
  const urgent = endsAt !== null && !snapshot.timeUp && endsAt - now <= 60_000;
  return (
    <p className="hud-round-seal rounded-full border border-amber-200/40 bg-slate-950/85 px-3 py-0.5 text-[11px] font-bold text-amber-100">
      Rodada {snapshot.round} · {modeName(snapshot.mode)}
      {clock && (
        <>
          {' · '}
          <span className={urgent || snapshot.timeUp ? 'text-red-300' : undefined} style={{ fontVariantNumeric: 'tabular-nums' }}>
            ⏱ {clock}
          </span>
        </>
      )}
    </p>
  );
}
