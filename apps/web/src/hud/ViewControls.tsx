import { useEffect } from 'react';
import { useViewStore } from '../store/viewStore';

const buttonClass =
  'rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-amber-300';

/** Girar a vista (Q/E) e voltar à visão geral (Esc). Duplo clique numa casa aproxima a câmera. */
export function ViewControls() {
  const rotate = useViewStore((s) => s.rotate);
  const clearFocus = useViewStore((s) => s.clearFocus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'q') rotate(-1);
      else if (key === 'e') rotate(1);
      else if (key === 'escape') clearFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotate, clearFocus]);

  return (
    <div className="flex gap-1 rounded-xl bg-black/40 p-1 backdrop-blur">
      <button type="button" className={buttonClass} onClick={() => rotate(-1)} title="Girar à esquerda (Q)">
        ⟲
      </button>
      <button type="button" className={buttonClass} onClick={clearFocus} title="Visão geral (Esc)">
        Visão geral
      </button>
      <button type="button" className={buttonClass} onClick={() => rotate(1)} title="Girar à direita (E)">
        ⟳
      </button>
    </div>
  );
}
