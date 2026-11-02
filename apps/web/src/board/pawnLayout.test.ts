import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import { tileAnchor } from './layout';
import { PAWN_RADIUS, pawnCenter, pawnSpots } from './pawnLayout';

const TILE_COUNT = board.tiles.length;
const pawn = (id: string, position: number, seat: number) => ({ id, position, seat });

/** Coordenadas do ponto no sistema da casa (desfaz a rotação). */
function local(index: number, x: number, z: number): [number, number] {
  const a = tileAnchor(index);
  const dx = x - a.x;
  const dz = z - a.z;
  const cos = Math.cos(a.rotationY);
  const sin = Math.sin(a.rotationY);
  return [dx * cos - dz * sin, dx * sin + dz * cos];
}

describe('personagens nas casas', () => {
  it('sozinho fica no centro da área de personagens, em cima da casa', () => {
    for (const index of [0, 3, 9, 14, 18, 21, 27, 35]) {
      const spot = pawnSpots([pawn('ana', index, 0)]).get('ana')!;
      const anchor = tileAnchor(index);
      const [lx, lz] = local(index, spot.x, spot.z);
      expect(spot.y).toBe(anchor.surfaceY);
      expect(lx).toBeCloseTo(anchor.pawnArea.x);
      expect(lz).toBeCloseTo(anchor.pawnArea.z);
      expect(spot).toEqual(pawnCenter(index));
    }
  });

  it('até quatro na mesma casa ficam separados e dentro da área de personagens, em todos os lados e cantos', () => {
    for (let index = 0; index < TILE_COUNT; index++) {
      for (let count = 2; count <= 4; count++) {
        const pawns = Array.from({ length: count }, (_, seat) => pawn(`p${seat}`, index, seat));
        const spots = [...pawnSpots(pawns).values()];
        const area = tileAnchor(index).pawnArea;
        for (const spot of spots) {
          const [lx, lz] = local(index, spot.x, spot.z);
          expect(Math.abs(lx - area.x) + PAWN_RADIUS).toBeLessThanOrEqual(area.width / 2 + 1e-9);
          expect(Math.abs(lz - area.z) + PAWN_RADIUS).toBeLessThanOrEqual(area.depth / 2 + 1e-9);
        }
        for (let i = 0; i < spots.length; i++) {
          for (let j = i + 1; j < spots.length; j++) {
            const distance = Math.hypot(spots[i].x - spots[j].x, spots[i].z - spots[j].z);
            expect(distance, `casa ${index}, ${count} personagens`).toBeGreaterThanOrEqual(2 * PAWN_RADIUS - 1e-9);
          }
        }
      }
    }
  });

  it('a posição depende do assento, não da ordem de chegada', () => {
    const first = pawnSpots([pawn('ana', 5, 0), pawn('bia', 5, 1)]);
    const reversed = pawnSpots([pawn('bia', 5, 1), pawn('ana', 5, 0)]);
    expect(reversed.get('ana')).toEqual(first.get('ana'));
    expect(reversed.get('bia')).toEqual(first.get('bia'));
  });

  it('casas diferentes não interferem entre si', () => {
    const spots = pawnSpots([pawn('ana', 1, 0), pawn('bia', 2, 1)]);
    expect(spots.get('ana')).toEqual(pawnCenter(1));
    expect(spots.get('bia')).toEqual(pawnCenter(2));
  });
});
