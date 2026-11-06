import { describe, expect, it } from 'vitest';
import layout from '../board/board34/layout.json';
import { LAND_SECONDS, LIFT_SECONDS, ROLL_SECONDS, SPIN_SECONDS, rollPlan } from './rollPlan';

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

describe('plano do lance dos dados 3D', () => {
  it('fases somam a duração do lance', () => {
    expect(LIFT_SECONDS + SPIN_SECONDS + LAND_SECONDS).toBeCloseTo(ROLL_SECONDS);
    expect(SPIN_SECONDS).toBeGreaterThan(0);
  });

  it('gira só dentro do envelope publicado e pousa no repouso oficial', () => {
    for (let seed = 1; seed < 200; seed++) {
      layout.dice.forEach((pose, i) => {
        const plan = rollPlan(i, pose, layout.diceRoll, seeded(seed));
        const { min, max } = layout.diceRoll.centerBounds[i];
        expect(plan.rest).toEqual(pose.position);
        for (const p of plan.air) {
          p.forEach((v, axis) => {
            expect(v).toBeGreaterThanOrEqual(min[axis] - 1e-9);
            expect(v).toBeLessThanOrEqual(max[axis] + 1e-9);
          });
          expect(Math.abs(p[0] - pose.position[0])).toBeLessThanOrEqual(layout.diceRoll.horizontalTravel + 1e-9);
          expect(Math.abs(p[2] - pose.position[2])).toBeLessThanOrEqual(layout.diceRoll.horizontalTravel + 1e-9);
        }
        // Último ponto no ar: acima do repouso, centralizado, para descer na vertical.
        const last = plan.air[plan.air.length - 1];
        expect(last[1]).toBeCloseTo(min[1]);
        expect(plan.turns.every(Number.isInteger)).toBe(true);
      });
    }
  });

  it('sem envelope para o dado não inventa uma trajetória', () => {
    expect(() => rollPlan(5, layout.dice[0], layout.diceRoll)).toThrow();
  });
});
