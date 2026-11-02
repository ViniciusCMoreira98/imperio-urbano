import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import { CORNER_SIZE, TILE_WIDTH, type TileArea, boardLength, tileAnchor, tilePlacement } from './layout';

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

  it('áreas de personagens e construções ficam dentro da casa, sem se sobrepor (contrato tileAnchor)', () => {
    const inside = (area: TileArea, width: number, depth: number) =>
      Math.abs(area.x) + area.width / 2 <= width / 2 + 1e-9 && Math.abs(area.z) + area.depth / 2 <= depth / 2 + 1e-9;
    for (const tile of board.tiles) {
      const a = tileAnchor(tile.index);
      expect(inside(a.pawnArea, a.width, a.depth), `personagens na casa ${tile.index}`).toBe(true);
      expect(a.selectedLift).toBeGreaterThanOrEqual(0);
      if (tile.type !== 'PROPERTY') {
        expect(a.buildingArea, `casa ${tile.index} sem construção`).toBeNull();
        continue;
      }
      const b = a.buildingArea!;
      expect(inside(b, a.width, a.depth), `construções na casa ${tile.index}`).toBe(true);
      // Faixas separadas na profundidade: construções do lado do centro, personagens do lado de fora.
      expect(b.z + b.depth / 2).toBeLessThanOrEqual(a.pawnArea.z - a.pawnArea.depth / 2 + 1e-9);
    }
  });

  it('a âncora repete a posição e a orientação da casa', () => {
    for (const tile of board.tiles) {
      const p = tilePlacement(tile.index, n);
      expect(tileAnchor(tile.index)).toMatchObject({ x: p.x, z: p.z, rotationY: p.rotationY, width: p.width, depth: p.depth });
    }
  });

  it('casas consecutivas são vizinhas, inclusive fechando a volta', () => {
    tiles.forEach((t, i) => {
      const next = tiles[(i + 1) % tiles.length];
      const expected = t.isCorner || next.isCorner ? (CORNER_SIZE + TILE_WIDTH) / 2 : TILE_WIDTH;
      expect(dist(t, next)).toBeCloseTo(expected);
    });
  });
});
