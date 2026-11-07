import { describe, expect, it } from 'vitest';
import { headerTextColor, ownerHeaderRect } from './ownerHeader';

describe('faixa do nome na cor do dono', () => {
  it('usa texto escuro no amarelo e claro nas outras cores', () => {
    expect(headerTextColor('#f2c230')).toBe('#13254a');
    expect(headerTextColor('#9b5de5')).toBe('#ffffff');
    expect(headerTextColor('#2e9e5b')).toBe('#ffffff');
  });

  it('fica no topo das casas em pé e à esquerda das deitadas', () => {
    const standing = ownerHeaderRect({ quad: [], width: 110, height: 144, horizontal: false });
    expect(standing.y).toBeLessThan(10);
    expect(standing.width).toBeGreaterThan(100);
    const lying = ownerHeaderRect({ quad: [], width: 182, height: 65, horizontal: true });
    expect(lying.x).toBeLessThan(10);
    expect(lying.width).toBeLessThan(91);
    expect(ownerHeaderRect({ quad: [], width: 97, height: 127, horizontal: false }, 'RN').height).toBeGreaterThan(standing.height);
  });
});
