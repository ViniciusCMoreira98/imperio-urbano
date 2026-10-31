import { describe, expect, it } from 'vitest';
import type { StateDefinition } from '@imperio/shared-types';
import { board, rules, states, validateCatalog } from './index';

describe('catálogo de jogo', () => {
  it('é consistente', () => {
    expect(validateCatalog(states, board, rules)).toEqual([]);
  });

  it('tem exatamente 27 unidades federativas', () => {
    expect(states).toHaveLength(27);
  });

  it('detecta estado duplicado e ausente', () => {
    const broken: StateDefinition[] = [...states.slice(1), { ...states[1] }];
    const errors = validateCatalog(broken, board, rules);
    expect(errors).toContain(`Estado ausente: ${states[0].id}`);
    expect(errors).toContain(`Estado duplicado: ${states[1].id}`);
  });

  it('detecta tabuleiro com estado repetido', () => {
    const tiles = board.tiles.map((t) => (t.index === 2 ? { ...t, stateId: states[0].id } : t));
    const errors = validateCatalog(states, { ...board, tiles }, rules);
    expect(errors.some((e) => e.includes('aparece 2 vez'))).toBe(true);
  });
});
