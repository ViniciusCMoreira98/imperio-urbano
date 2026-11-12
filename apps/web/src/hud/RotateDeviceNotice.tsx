import { useEffect, useState } from 'react';

/** Lado menor abaixo disso = celular (tablets em pé seguem jogando). */
const PHONE_SHORT_SIDE = 600;

export interface ViewportInfo {
  width: number;
  height: number;
  /** Tela de toque como entrada principal (pointer: coarse). */
  coarsePointer: boolean;
}

/**
 * O jogo no celular é só em paisagem (decisão de 04/11/2026; desde 11/11/2026 também no menu e na sala,
 * para pedir já ao abrir): em pé, pede para girar.
 * Janela estreita no computador (mouse) não conta como celular.
 */
export function shouldAskToRotate({ width, height, coarsePointer }: ViewportInfo): boolean {
  return coarsePointer && height > width && Math.min(width, height) < PHONE_SHORT_SIDE;
}

function readViewport(): ViewportInfo {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
  };
}

/** Atualiza ao girar o aparelho ou redimensionar; não depende de bloqueio de orientação do navegador. */
export function useAskToRotate(): boolean {
  const [ask, setAsk] = useState(() => shouldAskToRotate(readViewport()));
  useEffect(() => {
    const update = () => setAsk(shouldAskToRotate(readViewport()));
    // Vários sinais: nem todo navegador dispara resize ou orientationchange ao girar.
    const queries = ['(pointer: coarse)', '(orientation: portrait)'].map((q) => window.matchMedia(q));
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    queries.forEach((q) => q.addEventListener('change', update));
    update();
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      queries.forEach((q) => q.removeEventListener('change', update));
    };
  }, []);
  return ask;
}

/**
 * Cobre a tela enquanto o celular está em pé. Só apresentação: na partida, a conexão, o relógio do servidor e
 * o snapshot continuam; ao girar, o jogo aparece no estado atual.
 */
export function RotateDeviceNotice({ inGame = true }: { inGame?: boolean }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rotate-title"
      aria-describedby="rotate-text"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950/95 p-6 text-center"
    >
      <svg viewBox="0 0 64 64" className="rotate-device-icon h-20 w-20 text-amber-300" aria-hidden="true">
        <rect x="20" y="6" width="24" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="44" r="2" fill="currentColor" />
        <path d="M50 30a18 18 0 0 1-8 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 50l4 3 3-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 id="rotate-title" className="text-xl font-black text-amber-300">Gire o celular</h2>
      <p id="rotate-text" className="max-w-xs text-white/85">
        {inGame
          ? 'A partida é jogada na horizontal. O tempo do turno continua correndo enquanto o aparelho estiver em pé.'
          : 'O Império Urbano é jogado na horizontal. Gire o celular para continuar.'}
      </p>
    </div>
  );
}
