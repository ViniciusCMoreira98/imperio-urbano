import manifest from './surroundings.json';

export interface ScreenRect { x: number; y: number; width: number; height: number }
export interface SurroundingsLayout {
  orientation: 'landscape' | 'portrait';
  viewport: { width: number; height: number };
  boardViewport: ScreenRect;
  hudSafeAreas: { top: ScreenRect; side: ScreenRect; bottom: ScreenRect };
}
export { manifest as surroundingsManifest };

/** Unidades CSS do viewport externo; a câmera e seus pixels nativos permanecem intactos. */
export function surroundingsLayout(width: number, height: number): SurroundingsLayout {
  if (![width, height].every(n => Number.isFinite(n) && n > 0)) throw new Error('O viewport precisa ter dimensões positivas e finitas.');
  const g = manifest.gutter;
  const landscape = width >= manifest.landscape.minimumWidth && width > height;
  if (landscape) {
    const p = manifest.landscape;
    const compact = width < p.compactWidth || height < p.compactHeight;
    const top = compact ? p.compactTop : p.top;
    const bottom = height < p.compactHeight ? p.shortBottom : p.bottom;
    const right = width < p.compactRightBelow ? p.compactRight : p.right;
    const availableWidth = Math.max(0, width - right - 2 * g);
    const availableHeight = Math.max(0, height - top - bottom - 2 * g);
    const boardWidth = Math.min(availableWidth, availableHeight * manifest.nativeBoard.aspect);
    const boardHeight = boardWidth / manifest.nativeBoard.aspect;
    return {
      orientation: 'landscape', viewport: { width, height },
      boardViewport: { x: g + (availableWidth - boardWidth) / 2, y: top + g + (availableHeight - boardHeight) / 2, width: boardWidth, height: boardHeight },
      hudSafeAreas: {
        top: { x: g, y: g / 2, width: Math.max(0, width - 2 * g), height: top - g },
        side: { x: width - right + g, y: top + g, width: right - 2 * g, height: availableHeight },
        bottom: { x: g, y: height - bottom + g / 2, width: Math.max(0, width - 2 * g), height: bottom - g },
      },
    };
  }
  const p = manifest.portrait;
  const top = Math.min(p.top, height * .24);
  const bottom = Math.min(width >= p.tabletMinimumWidth ? p.tabletBottom : p.bottom, height * .28);
  const between = Math.max(0, height - top - bottom - 3 * g);
  const sideReserve = Math.min(p.minimumSideReserve, height * .2, between * .45);
  const boardWidth = Math.min(width, Math.max(0, between - sideReserve) * manifest.nativeBoard.aspect);
  const boardHeight = boardWidth / manifest.nativeBoard.aspect;
  const sideY = top + g + boardHeight + g;
  return {
    orientation: 'portrait', viewport: { width, height },
    boardViewport: { x: (width - boardWidth) / 2, y: top + g, width: boardWidth, height: boardHeight },
    hudSafeAreas: {
      top: { x: g, y: g / 2, width: Math.max(0, width - 2 * g), height: Math.max(0, top - g) },
      side: { x: g, y: sideY, width: Math.max(0, width - 2 * g), height: Math.max(0, Math.min(height * p.maximumSideRatio, height - bottom - g - sideY)) },
      bottom: { x: g, y: height - bottom + g / 2, width: Math.max(0, width - 2 * g), height: Math.max(0, bottom - g) },
    },
  };
}

export function boardPixelToViewport(layout: SurroundingsLayout, [x, y]: readonly number[]): [number, number] {
  const scale = layout.boardViewport.width / manifest.nativeBoard.width;
  return [layout.boardViewport.x + x * scale, layout.boardViewport.y + y * scale];
}
