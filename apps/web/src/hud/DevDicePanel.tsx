// Ferramenta de desenvolvedor: escolher o próximo lance da partida para testar casas específicas.
// Só entra no build de desenvolvimento (import.meta.env.DEV) e só funciona com o servidor rodando com
// app.dev-tools.enabled=true; jogadores nunca veem isto.
import { useState } from 'react';
import { board, states } from '@imperio/game-data';
import { ApiError } from '../net/api';
import { devApi } from '../net/devApi';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';

const FACES = [1, 2, 3, 4, 5, 6];
const TILE_COUNT = board.tiles.length;

/** Faces para andar `steps` casas (dupla só em 2 e 12); null se um lance não alcança. */
export function facesFor(steps: number): [number, number] | null {
  if (steps < 2 || steps > 12) return null;
  const first = Math.min(6, steps - 1);
  return [first, steps - first];
}

const stateNames = new Map(states.map((s) => [s.id, s.name]));
const tileLabel = (index: number) => {
  const tile = board.tiles[index];
  return `${index} · ${(tile.stateId && stateNames.get(tile.stateId)) ?? tile.type}`;
};

export function DevDicePanel() {
  const session = useAppStore((s) => s.session)!;
  const gameId = useAppStore((s) => s.gameId)!;
  const position = useGameStore((s) => s.snapshot?.players.find((p) => p.id === s.snapshot?.currentPlayerId)?.position ?? 0);
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState(1);
  const [second, setSecond] = useState(2);
  const [message, setMessage] = useState<string | null>(null);

  const choose = async (a: number, b: number) => {
    try {
      await devApi.nextDice(session.token, gameId, a, b);
      setMessage(`Próximo lance: ${a} + ${b}`);
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      setMessage(status === 404 ? 'Servidor sem ferramentas de dev (app.dev-tools.enabled=true)' : (e as Error).message);
    }
  };

  const goTo = (target: number) => {
    const faces = facesFor((target - position + TILE_COUNT) % TILE_COUNT);
    if (!faces) return setMessage(`Casa ${target} fora do alcance de um lance (de ${position})`);
    setFirst(faces[0]);
    setSecond(faces[1]);
    void choose(faces[0], faces[1]);
  };

  return (
    <div className="relative" data-dev-tools>
      <button type="button" className="rounded-full border border-dashed border-fuchsia-300/70 bg-fuchsia-950/80 px-3 py-1 text-xs font-bold text-fuchsia-100" onClick={() => setOpen((v) => !v)} title="Ferramenta de desenvolvedor">
        🎲 dev
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-fuchsia-300/50 bg-slate-950/95 p-3 text-xs text-white shadow-2xl">
          <p className="mb-2 font-bold text-fuchsia-200">Próximo lance (modo dev)</p>
          <div className="mb-2 flex items-center gap-2">
            {[first, second].map((value, i) => (
              <select key={i} aria-label={`Dado ${i + 1}`} className="rounded bg-slate-800 px-2 py-1" value={value} onChange={(e) => (i === 0 ? setFirst : setSecond)(Number(e.target.value))}>
                {FACES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            ))}
            <button type="button" className="flex-1 rounded bg-fuchsia-700 px-2 py-1 font-bold" onClick={() => void choose(first, second)}>
              Definir
            </button>
          </div>
          <label className="mb-1 block text-white/70" htmlFor="dev-target">Parar na casa (da vez, na casa {position}):</label>
          <select id="dev-target" className="w-full rounded bg-slate-800 px-2 py-1" value="" onChange={(e) => goTo(Number(e.target.value))}>
            <option value="" disabled>Escolher casa…</option>
            {board.tiles.map((t) => <option key={t.index} value={t.index}>{tileLabel(t.index)}</option>)}
          </select>
          {message && <p className="mt-2 text-amber-200">{message}</p>}
          <p className="mt-2 text-white/50">Vale para o próximo lance, de quem rolar primeiro.</p>
        </div>
      )}
    </div>
  );
}
