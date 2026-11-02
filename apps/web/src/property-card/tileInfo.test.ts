import { describe, expect, it } from 'vitest';
import { board, states } from '@imperio/game-data';
import { formatCredits, tileInfo } from './tileInfo';

describe('informações da casa', () => {
  it('descreve todas as casas do tabuleiro', () => {
    for (const tile of board.tiles) {
      const info = tileInfo(tile.index);
      expect(info.kind).toBe(tile.type === 'PROPERTY' ? 'property' : 'special');
      if (info.kind === 'special') expect(info.description.length).toBeGreaterThan(0);
    }
  });

  it('usa os valores do catálogo para o estado', () => {
    const sp = states.find((s) => s.id === 'SP')!;
    const index = board.tiles.find((t) => t.stateId === 'SP')!.index;
    const info = tileInfo(index);
    expect(info.kind).toBe('property');
    if (info.kind !== 'property') return;
    expect(info.state).toBe(sp);
    expect(info.rents.map((r) => r.value)).toEqual([
      sp.rent.base, sp.rent.house1, sp.rent.house2, sp.rent.house3, sp.rent.house4, sp.rent.hotel,
    ]);
    expect(info.group.id).toBe(sp.colorGroup);
  });

  it('formata créditos no padrão brasileiro', () => {
    expect(formatCredits(1100)).toBe('R$ 1.100');
  });
});
