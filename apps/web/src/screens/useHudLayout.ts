import { useLayoutEffect, useState, type RefObject } from 'react';
import type { BoardInsets } from '../board/camera/tabletopViewport';

/** Folga entre o HUD e o tabuleiro, além da altura dos bonecos que sobem acima da fileira de cima. */
const GAP = 6;
const PAWN_HEADROOM = 0.035;
/** Recorte do selo da rodada, que fica acima da barra de ações. */
const SEAL_OVERHANG = 16;

/**
 * Mede o HUD da partida para nada se sobrepor:
 * - `--hud-header-w` (largura dos botões do canto) limita a fileira de cards dos jogadores;
 * - as reservas do tabuleiro ficam abaixo dos cards (com espaço para os bonecos) e acima da barra de ações.
 */
export function useHudLayout(
  viewport: RefObject<HTMLElement | null>,
  header: RefObject<HTMLElement | null>,
  players: RefObject<HTMLElement | null>,
  actions: RefObject<HTMLElement | null>,
  ready: boolean,
): BoardInsets | undefined {
  const [insets, setInsets] = useState<BoardInsets>();

  useLayoutEffect(() => {
    const root = viewport.current;
    if (!root) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = root.getBoundingClientRect();
        const headerBox = header.current?.getBoundingClientRect();
        if (headerBox) root.style.setProperty('--hud-header-w', `${Math.ceil(headerBox.width)}px`);
        const list = players.current?.querySelector<HTMLElement>('ol');
        // Celular deitado: cards em coluna à esquerda e botões em coluna à direita (CSS).
        const sideLayout = !!list && getComputedStyle(list).flexDirection === 'column';
        if (sideLayout) root.style.setProperty('--hud-players-pad', '2px');
        else centerPlayers(root, box, headerBox, players.current);
        const playersBox = players.current?.getBoundingClientRect();
        const tray = actions.current?.querySelector<HTMLElement>('.hud-action-tray') ?? actions.current;
        const actionsBox = tray?.getBoundingClientRect();
        if (!playersBox || !actionsBox || box.height === 0) return;
        const bottom = Math.ceil(box.bottom - actionsBox.top + SEAL_OVERHANG + GAP);
        let next: BoardInsets;
        if (sideLayout) {
          // Reserva igual dos dois lados (tabuleiro centralizado): a maior coluna, incluindo o Histórico.
          const history = root.querySelector<HTMLElement>('.game-hud-history')?.getBoundingClientRect();
          const rightEdge = Math.min(headerBox?.left ?? box.right, history && history.width > 0 ? history.left : box.right);
          const side = Math.ceil(Math.max(playersBox.right - box.left, box.right - rightEdge) + GAP);
          next = { top: Math.ceil(GAP + box.height * PAWN_HEADROOM), bottom, left: side, right: side };
        } else {
          next = { top: Math.ceil(playersBox.bottom - box.top + GAP + box.height * PAWN_HEADROOM), bottom };
        }
        setInsets((prev) =>
          prev && prev.top === next.top && prev.bottom === next.bottom && prev.left === next.left && prev.right === next.right ? prev : next,
        );
      });
    };
    const observer = new ResizeObserver(measure);
    for (const el of [root, header.current, players.current, actions.current]) if (el) observer.observe(el);
    // Cada card muda de largura com o saldo e o nome: observa um por um (e os que entrarem depois).
    const rows = new MutationObserver(() => players.current?.querySelectorAll('li').forEach((li) => observer.observe(li)));
    if (players.current) {
      rows.observe(players.current, { childList: true, subtree: true });
      players.current.querySelectorAll('li').forEach((li) => observer.observe(li));
    }
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rows.disconnect();
    };
  }, [viewport, header, players, actions, ready]);

  return ready ? insets : undefined;
}

/** Centraliza a fileira na tela quando cabe entre as duas faixas dos botões; senão, no espaço à esquerda deles. */
function centerPlayers(root: HTMLElement, box: DOMRect, headerBox: DOMRect | undefined, players: HTMLElement | null) {
  const list = players?.querySelector<HTMLElement>('ol');
  if (!players || !list || !headerBox) return;
  const items = [...list.children] as HTMLElement[];
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
  const content = items.reduce((sum, li) => sum + li.offsetWidth, 0) + gap * Math.max(0, items.length - 1);
  const area = players.getBoundingClientRect();
  const free = area.width - content;
  // Deslocamento que põe o centro da fileira no centro da tela, limitado ao espaço livre da área.
  const centered = box.left + box.width / 2 - content / 2 - area.left;
  const pad = Math.max(2, Math.min(free - 2, centered));
  root.style.setProperty('--hud-players-pad', `${Math.floor(pad)}px`);
}
