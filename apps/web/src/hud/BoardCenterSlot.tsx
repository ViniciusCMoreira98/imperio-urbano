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

/** Espaço entre o conteúdo que encolhe e o rodapé (botão de rolar). */
const FOOTER_GAP = 8;

/**
 * `children` encolhem por inteiro quando não cabem; `footer` (o botão de rolar) fica sempre no tamanho
 * normal, embaixo, e o resto encolhe no espaço que sobra (11/11/2026: um aviso deixava o botão pequeno).
 */
export function BoardCenterSlot({ insets, children, footer }: { insets?: BoardInsets; children: ReactNode; footer?: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [fit, setFit] = useState({ scale: 1, width: 0, height: 0 });

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
    const measure = () => {
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      const footerHeight = footerRef.current?.offsetHeight ?? 0;
      const room = rect.height - (footerHeight ? footerHeight + FOOTER_GAP : 0);
      const scale = width && height ? Math.max(0, Math.min(1, rect.width / width, room / height)) : 1;
      setFit((prev) => (prev.scale === scale && prev.width === width && prev.height === height ? prev : { scale, width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [rect]);

  const hasContent = fit.width > 0 && fit.height > 0;
  return (
    <div
      ref={frameRef}
      className="board-center-slot pointer-events-none absolute z-30 flex flex-col items-center justify-center"
      style={rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : { inset: 0 }}
    >
      {/* Caixa no tamanho já encolhido, para o rodapé ficar logo abaixo. */}
      <div
        className="relative shrink-0"
        style={{ width: fit.width * fit.scale, height: fit.height * fit.scale, marginBottom: hasContent ? FOOTER_GAP : 0 }}
      >
        <div
          ref={contentRef}
          className="absolute left-0 top-0 flex w-max max-w-[26rem] origin-top-left flex-col items-center gap-2 [&>*]:pointer-events-auto"
          style={{ transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined }}
        >
          {children}
        </div>
      </div>
      <div ref={footerRef} className="shrink-0 [&>*]:pointer-events-auto">
        {footer}
      </div>
    </div>
  );
}
