import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import { boardVisualManifest } from './boardVisualManifest';
import { buildingPlacement } from './buildingLayout';
import { type TileAnchor, type TileArea, anchorToWorld, tileAnchor, tileIndexOf } from './layout';
import { PAWN_RADIUS, pawnSpots } from './pawnLayout';

/** Distância (com sinal) do ponto à borda do polígono: positiva dentro, negativa fora. */
function insideDistance(polygon: [number, number][], x: number, z: number): number {
  let inside = false;
  let nearest = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i];
    const [xj, zj] = polygon[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    const dx = xj - xi;
    const dz = zj - zi;
    const t = Math.max(0, Math.min(1, ((x - xi) * dx + (z - zi) * dz) / (dx * dx + dz * dz)));
    nearest = Math.min(nearest, Math.hypot(x - (xi + t * dx), z - (zi + t * dz)));
  }
  return inside ? nearest : -nearest;
}

/** Os quatro cantos de um retângulo do sistema da casa, no mundo. */
function corners(anchor: TileAnchor, area: TileArea): { x: number; z: number }[] {
  return [-1, 1].flatMap((sx) => [-1, 1].map((sz) => anchorToWorld(anchor, area.x + (sx * area.width) / 2, area.z + (sz * area.depth) / 2)));
}

const manifest = boardVisualManifest(board.tiles);

describe('âncoras das casas do manifesto ativo', () => {
  it('cada casa do percurso usa a arte de mesmo id, índice e tipo do manifesto', () => {
    expect(board.tiles).toHaveLength(manifest.tiles.length);
    board.tiles.forEach((tile, i) => {
      const art = manifest.tiles[i];
      expect(art.id, `casa ${i}`).toBe(tile.id);
      expect(art.index).toBe(tile.index);
      expect(art.type === 'AIRPORT' ? 'NATIONAL_TRAVEL' : art.type).toBe(tile.type);
      if (tile.type === 'PROPERTY') expect(art.stateId).toBe(tile.stateId);
      expect(tileAnchor(i)).toMatchObject({ id: tile.id, x: art.anchor.x, z: art.anchor.z, surfaceY: art.anchor.surfaceY });
      expect(tileIndexOf(tile.id)).toBe(i);
    });
    expect(tileIndexOf('TO')).toBeNull();
  });

  it('o índice dá a volta no tabuleiro', () => {
    expect(tileAnchor(board.tiles.length)).toBe(tileAnchor(0));
    expect(tileAnchor(-1)).toBe(tileAnchor(board.tiles.length - 1));
  });

  // As áreas do manifesto são retângulos de referência e, nas casas inclinadas, passam um pouco do
  // contorno; por isso os testes abaixo conferem o que de fato é desenhado (personagens, construções,
  // faixa do dono) contra o polígono real da casa.
  it('construções e personagens em faixas separadas da casa', () => {
    for (const tile of board.tiles) {
      const a = tileAnchor(tile.index);
      expect(a.selectedLift).toBeGreaterThanOrEqual(0);
      if (tile.type !== 'PROPERTY') {
        expect(a.buildingArea, `casa ${tile.id} sem construção`).toBeNull();
        continue;
      }
      const b = a.buildingArea!;
      // Faixas separadas na profundidade (a construção fica junto da placa de aluguel, que muda de lado).
      const p = a.pawnArea;
      const apart = b.z + b.depth / 2 <= p.z - p.depth / 2 + 1e-9 || p.z + p.depth / 2 <= b.z - b.depth / 2 + 1e-9;
      expect(apart, tile.id).toBe(true);
    }
  });

  it('de um a quatro personagens cabem inteiros no contorno de cada casa', () => {
    for (const tile of board.tiles) {
      const a = tileAnchor(tile.index);
      for (let count = 1; count <= 4; count++) {
        const pawns = Array.from({ length: count }, (_, seat) => ({ id: `p${seat}`, position: tile.index, seat }));
        for (const spot of pawnSpots(pawns).values()) {
          expect(insideDistance(a.polygon, spot.x, spot.z), `casa ${tile.id}, ${count} personagens`).toBeGreaterThanOrEqual(PAWN_RADIUS);
        }
      }
    }
  });

  it('casas e hotel cabem inteiros na casa de cada estado, sem casinhas sobrepostas', () => {
    const fits = (a: TileAnchor, box: TileArea, what: string) => {
      for (const c of corners(a, box)) expect(insideDistance(a.polygon, c.x, c.z), what).toBeGreaterThanOrEqual(0);
    };
    for (const tile of board.tiles.filter((t) => t.type === 'PROPERTY')) {
      const a = tileAnchor(tile.index);
      for (let level = 1; level <= 5; level++) {
        const { houses, houseSize, hotel } = buildingPlacement(a, level);
        expect(level === 5 ? hotel !== null : houses.length === level).toBe(true);
        for (const [x, z] of houses) fits(a, { x, z, width: houseSize, depth: houseSize }, `${tile.id}, nível ${level}`);
        houses.slice(1).forEach(([x], i) => expect(x - houses[i][0]).toBeGreaterThanOrEqual(houseSize));
        if (hotel) fits(a, hotel, `hotel em ${tile.id}`);
      }
    }
  });
});
