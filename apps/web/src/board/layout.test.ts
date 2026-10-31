import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import { CORNER_SIZE, TILE_WIDTH, boardLength, tilePlacement } from './layout';

const n = board.tilesPerSide;
const tiles = board.tiles.map((t) => tilePlacement(t.index, n));
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

describe('layout do tabuleiro', () => {
  it('coloca o Início no canto inferior direito', () => {
    const half = boardLength(n) / 2 - CORNER_SIZE / 2;
    expect(tiles[0].x).toBeCloseTo(half);
    expect(tiles[0].z).toBeCloseTo(half);
  });

  it('tem 4 cantos e casas sem sobreposição dentro do tabuleiro', () => {
    expect(tiles.filter((t) => t.isCorner)).toHaveLength(4);
    const half = boardLength(n) / 2;
    for (const t of tiles) {
      expect(Math.abs(t.x)).toBeLessThan(half);
      expect(Math.abs(t.z)).toBeLessThan(half);
    }
    const keys = new Set(tiles.map((t) => `${t.x.toFixed(3)},${t.z.toFixed(3)}`));
    expect(keys.size).toBe(tiles.length);
  });

  it('casas consecutivas são vizinhas, inclusive fechando a volta', () => {
    tiles.forEach((t, i) => {
      const next = tiles[(i + 1) % tiles.length];
      const expected = t.isCorner || next.isCorner ? (CORNER_SIZE + TILE_WIDTH) / 2 : TILE_WIDTH;
      expect(dist(t, next)).toBeCloseTo(expected);
    });
  });
});
