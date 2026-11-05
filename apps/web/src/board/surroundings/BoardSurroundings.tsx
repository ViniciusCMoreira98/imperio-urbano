import {useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties} from 'react';
import {surroundingsLayout, type ScreenRect, type SurroundingsLayout} from './surroundingsLayout';
import './surroundings.css';

const rectStyle = (rect: ScreenRect): CSSProperties => ({left: rect.x, top: rect.y, width: rect.width, height: rect.height});

/** Mesa e encaixes visuais. O host mantém estado, ações e conteúdo dos painéis. */
export function BoardSurroundings({children, top, side, bottom}: {children: ReactNode; top?: ReactNode; side?: ReactNode; bottom?: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SurroundingsLayout | null>(null);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      if (width > 0 && height > 0) setLayout(surroundingsLayout(width, height));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="board-surroundings" data-orientation={layout?.orientation}>
    {layout && <>
      <div className="board-surroundings__board" data-board-viewport style={rectStyle(layout.boardViewport)}>{children}</div>
      <div className="board-surroundings__slot board-surroundings__top" data-hud-safe="top" style={rectStyle(layout.hudSafeAreas.top)}>{top}</div>
      <div className="board-surroundings__slot board-surroundings__side" data-hud-safe="side" style={rectStyle(layout.hudSafeAreas.side)}>{side}</div>
      <div className="board-surroundings__slot board-surroundings__bottom" data-hud-safe="bottom" style={rectStyle(layout.hudSafeAreas.bottom)}>{bottom}</div>
    </>}
  </div>;
}
