import { useDemoStore } from './demoStore';

export function DemoDiceBar() {
  const { dice, moving, passedStart, roll } = useDemoStore();

  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/50 px-4 py-2 text-sm backdrop-blur">
      <button
        type="button"
        onClick={roll}
        disabled={moving}
        className="rounded-lg bg-emerald-600 px-4 py-1.5 font-semibold hover:bg-emerald-500 disabled:opacity-40"
      >
        Rolar dados
      </button>
      {dice && (
        <span className="tabular-nums" aria-live="polite">
          🎲 {dice[0]} + {dice[1]} = <strong>{dice[0] + dice[1]}</strong>
          {passedStart && !moving && <span className="ml-2 text-emerald-300">Passou pelo Início!</span>}
        </span>
      )}
      <span className="text-xs text-white/50">demonstração local</span>
    </div>
  );
}
