import { describe, expect, it } from 'vitest';
import { fitDistance, nearestAngle, overviewPose, tilePose } from './cameraPose';
import { tilePlacement } from './layout';

describe('poses da câmera', () => {
  it('vista geral gira 90° por quarto de volta', () => {
    expect(overviewPose(1).azimuth - overviewPose(0).azimuth).toBeCloseTo(Math.PI / 2);
    expect(overviewPose(0).target).toEqual([0, 0, 0]);
  });

  it('foco olha para a casa a partir do lado de fora', () => {
    const p = tilePlacement(14, 9);
    const pose = tilePose(p);
    expect(pose.target).toEqual([p.x, 0, p.z]);
    // Lado esquerdo: o lado de fora é -x, logo a câmera tem componente x negativa.
    expect(Math.sin(pose.azimuth)).toBeLessThan(0);
  });

  it('escolhe o caminho angular mais curto', () => {
    expect(nearestAngle(0, (3 * Math.PI) / 2)).toBeCloseTo(-Math.PI / 2);
    expect(nearestAngle(10 * Math.PI, 0.1)).toBeCloseTo(10 * Math.PI + 0.1);
    expect(nearestAngle(-0.1, -2 * Math.PI + 0.1)).toBeCloseTo(0.1);
  });
});

describe('enquadramento', () => {
  it('afasta mais a câmera em tela em pé (celular)', () => {
    const landscape = fitDistance(7, 35, 16 / 9);
    const portrait = fitDistance(7, 35, 375 / 812);
    expect(portrait).toBeGreaterThan(landscape * 1.8);
    expect(fitDistance(7, 35, 1)).toBeCloseTo(7 / Math.sin((17.5 * Math.PI) / 180));
  });
});
