import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import layout from './layout.json';
import { tileAnchor } from '../layout';
import { PAWN_RADIUS, pawnSpots } from '../pawnLayout';
import { propertyBuildingPlacement } from '../buildings/buildingPresentation';
import { LYING_NAME_END, UPRIGHT_NAME_END, type ZoneTile, buildingPanelBox, buildingZone, panelBoxCorners, rentPlaqueWorld } from './buildingZone';

const properties = layout.tiles.filter((t) => t.type === 'PROPERTY') as unknown as (ZoneTile & { id: string })[];

/** Ponto (x, z locais) dentro do quadrilátero, com folga. */
const inside = (quad: [number, number][], x: number, z: number) =>
  quad.every(([ax, az], i) => {
    const [bx, bz] = quad[(i + 1) % quad.length];
    return (bx - ax) * (z - az) - (bz - az) * (x - ax) >= -1e-9;
  }) ||
  quad.every(([ax, az], i) => {
    const [bx, bz] = quad[(i + 1) % quad.length];
    return (bx - ax) * (z - az) - (bz - az) * (x - ax) <= 1e-9;
  });

describe('construções no tabuleiro de 34 casas', () => {
  it('a faixa no painel não alcança o nome do estado nem a placa de aluguel', () => {
    for (const tile of properties) {
      const box = buildingPanelBox(tile.panel);
      const rent = tile.panel.rent!;
      expect(box.v1, tile.id).toBeLessThan(rent.y / tile.panel.height);
      if (tile.panel.horizontal) expect(box.u0, tile.id).toBeGreaterThanOrEqual(LYING_NAME_END);
      else expect(box.v0, tile.id).toBeGreaterThanOrEqual(UPRIGHT_NAME_END);
      expect(box.u1 > box.u0 && box.v1 > box.v0, tile.id).toBe(true);
    }
  });

  it('a construção de qualquer nível fica dentro da faixa medida na arte', () => {
    for (const tile of properties) {
      const quad = panelBoxCorners(tile, buildingPanelBox(tile.panel));
      const zone = buildingZone(tile);
      const index = board.tiles.find((t) => t.id === tile.id)!.index;
      const area = tileAnchor(index).buildingArea!;
      expect(area).toMatchObject(zone);
      for (let level = 0; level <= 5; level++) {
        const b = propertyBuildingPlacement(area, level)!;
        expect(b, `${tile.id} nível ${level}`).not.toBeNull();
        for (const sx of [-1, 1])
          for (const sz of [-1, 1]) expect(inside(quad, b.x + (sx * b.width) / 2, b.z + (sz * b.depth) / 2), `${tile.id} nível ${level}`).toBe(true);
        // Tamanho que ainda se enxerga na mesa.
        expect(Math.min(b.width, b.depth), tile.id).toBeGreaterThan(0.2);
      }
    }
  });

  it('as construções têm a mesma proporção em todos os estados', () => {
    for (let level = 0; level <= 5; level++) {
      const scales = properties.map((tile) => {
        const index = board.tiles.find((t) => t.id === tile.id)!.index;
        return propertyBuildingPlacement(tileAnchor(index).buildingArea!, level)!.scale;
      });
      for (const scale of scales) expect(scale).toBeCloseTo(scales[0], 9);
    }
  });

  it('a placa de aluguel no mundo, onde a etiqueta por cima é desenhada, fica dentro da própria casa', () => {
    for (const tile of properties) {
      const quad = rentPlaqueWorld(tile);
      expect(quad, tile.id).toHaveLength(4);
      const polygon = tile.polygon.map(([x, , z]) => [x, z] as [number, number]);
      for (const [x, z] of quad) expect(inside(polygon, x, z), tile.id).toBe(true);
    }
  });

  it('de um a quatro personagens não pisam na construção', () => {
    for (const tile of properties) {
      const index = board.tiles.find((t) => t.id === tile.id)!.index;
      const a = tileAnchor(index);
      const b = a.buildingArea!;
      const c = Math.cos(a.rotationY), s = Math.sin(a.rotationY);
      for (let count = 1; count <= 4; count++) {
        const pawns = Array.from({ length: count }, (_, seat) => ({ id: `p${seat}`, position: index, seat }));
        for (const spot of pawnSpots(pawns).values()) {
          const dx = spot.x - a.x, dz = spot.z - a.z;
          const [lx, lz] = [dx * c - dz * s, dx * s + dz * c];
          const gx = Math.max(0, Math.abs(lx - b.x) - b.width / 2), gz = Math.max(0, Math.abs(lz - b.z) - b.depth / 2);
          expect(Math.hypot(gx, gz), `${tile.id}, ${count} personagens`).toBeGreaterThanOrEqual(PAWN_RADIUS - 1e-9);
        }
      }
    }
  });
});
