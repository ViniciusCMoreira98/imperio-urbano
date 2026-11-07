import { describe, expect, it } from 'vitest';
import { tabletopViewport } from './tabletopViewport';

/** Reservas medidas pelo HUD (celular deitado: painéis nas laterais). O quadro 18–1500 × 34–940 fica dentro delas. */
describe('enquadramento com reservas do HUD', () => {
  it('sem reservas laterais, nada muda', () => {
    expect(tabletopViewport(844, 390, 'standard', { top: 20, bottom: 70 })).toEqual(
      tabletopViewport(844, 390, 'standard', { top: 20, bottom: 70, left: undefined, right: undefined }),
    );
  });

  it('com painéis nas laterais o quadro fica entre eles, centralizado', () => {
    for (const [w, h, side] of [[844, 390, 120], [667, 375, 118], [740, 360, 160]]) {
      const fit = tabletopViewport(w, h, 'standard', { top: 20, bottom: 70, left: side, right: side });
      expect(fit.x + 18 * fit.scale).toBeGreaterThanOrEqual(side - 1e-6);
      expect(fit.x + 1500 * fit.scale).toBeLessThanOrEqual(w - side + 1e-6);
      expect(fit.y + 34 * fit.scale).toBeGreaterThanOrEqual(20 - 1e-6);
      expect(fit.y + 940 * fit.scale).toBeLessThanOrEqual(h - 70 + 1e-6);
      const left = fit.x + 18 * fit.scale, right = w - (fit.x + 1500 * fit.scale);
      expect(left).toBeCloseTo(right, 5);
    }
  });

  it('tirar os cards do topo aumenta o tabuleiro no celular', () => {
    const topBar = tabletopViewport(844, 390, 'standard', { top: 70, bottom: 70 });
    const sides = tabletopViewport(844, 390, 'standard', { top: 20, bottom: 70, left: 120, right: 120 });
    expect(sides.scale).toBeGreaterThan(topBar.scale * 1.15);
  });
});
