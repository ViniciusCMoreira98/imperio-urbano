import { describe, expect, it } from 'vitest';
import { shouldAskToRotate } from './RotateDeviceNotice';

describe('aviso para girar o celular', () => {
  it('pede para girar o celular em pé', () => {
    expect(shouldAskToRotate({ width: 390, height: 844, coarsePointer: true })).toBe(true);
    expect(shouldAskToRotate({ width: 375, height: 667, coarsePointer: true })).toBe(true);
  });

  it('libera o celular na horizontal', () => {
    for (const [width, height] of [[844, 390], [932, 430], [667, 375]]) {
      expect(shouldAskToRotate({ width, height, coarsePointer: true })).toBe(false);
    }
  });

  it('não bloqueia tablet em pé nem janela estreita no computador', () => {
    expect(shouldAskToRotate({ width: 768, height: 1024, coarsePointer: true })).toBe(false);
    expect(shouldAskToRotate({ width: 390, height: 844, coarsePointer: false })).toBe(false);
  });
});
