// Miolo do tabuleiro na tela (08/11/2026): o botão de rolar e os avisos que pedem toque nos estados
// (vender para pagar a dívida, viajar, sediar) ficam dentro do quadrado livre entre as casas, para
// nunca cobrir os estados. O retângulo vem do contorno das casas (layout.json, pixels da referência)
// levado para a tela pelo mesmo encaixe da câmera (tabletopViewport). Conteúdo maior que o miolo
// encolhe por inteiro (transform), sem quebrar o layout.
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import layout from '../board/board34/layout.json';
import { type BoardInsets, tabletopViewport } from '../board/camera/tabletopViewport';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Folga entre o conteúdo e as casas (px da referência). */
const PAD = 10;

/** Quadrado livre entre as casas, em pixels da referência: a borda interna mais apertada de cada lado. */
const INNER = (() => {
  const side = (name: string) => layout.tiles.filter((t) => t.side === name).flatMap((t) => t.pixels);
  return {
    left: Math.max(...side('west').map((p) => p[0])) + PAD,
    right: Math.min(...side('east').map((p) => p[0])) - PAD,
    top: Math.max(...side('north').map((p) => p[1])) + PAD,
    bottom: Math.min(...side('south').map((p) => p[1])) - PAD,
  };
})();

export function boardCenterRect(width: number, height: number, insets?: BoardInsets): Rect {
  const fit = tabletopViewport(width, height, 'standard', insets);
  return {
    left: fit.x + INNER.left * fit.scale,
    top: fit.y + INNER.top * fit.scale,
    width: (INNER.right - INNER.left) * fit.scale,
    height: (INNER.bottom - INNER.top) * fit.scale,
  };
}

export function BoardCenterSlot({ insets, children }: { insets?: BoardInsets; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [scale, setScale] = useState(1);

  // Tamanho da área da partida: o miolo acompanha giro de tela, tela cheia e as reservas do HUD.
  useLayoutEffect(() => {
    const host = frameRef.current?.parentElement;
    if (!host) return;
    const measure = () => setRect(boardCenterRect(host.clientWidth, host.clientHeight, insets));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [insets]);

  // Encolhe o conteúdo que não cabe (tamanho natural: offset ignora o transform).
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || !rect) return;
    const fit = () => {
      const w = content.offsetWidth;
      const h = content.offsetHeight;
      setScale(w && h ? Math.min(1, rect.width / w, rect.height / h) : 1);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(content);
    return () => observer.disconnect();
  }, [rect]);

  return (
    <div
      ref={frameRef}
      className="board-center-slot pointer-events-none absolute z-30 flex items-center justify-center"
      style={rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : { inset: 0 }}
    >
      <div
        ref={contentRef}
        className="flex w-max max-w-[26rem] flex-col items-center gap-2 [&>*]:pointer-events-auto"
        style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
