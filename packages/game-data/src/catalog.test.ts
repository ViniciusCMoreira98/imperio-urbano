import { describe, expect, it } from 'vitest';
import type { StateDefinition } from '@imperio/shared-types';
import { board, eventCards, rules, states, validateCatalog, validateEventCards } from './index';

describe('catálogo de jogo', () => {
  it('é consistente', () => {
    expect(validateCatalog(states, board, rules)).toEqual([]);
  });

  it('tem 26 unidades federativas, sem Tocantins, em 34 casas com dois Eventos e o Saque', () => {
    expect(states).toHaveLength(26);
    expect(states.some((s) => s.id === ('TO' as string))).toBe(false);
    expect(board.tiles).toHaveLength(34);
    expect(board.tiles.filter((t) => t.type === 'EVENT')).toHaveLength(2);
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

  it('tem um baralho de eventos consistente', () => {
    expect(eventCards.map((c) => c.id)).toEqual(['assalto', 'caramelo-viral', 'incendio', 'visita-olimpica', 'escolha-sede', 'apagao']);
    expect(validateEventCards(eventCards, board)).toEqual([]);
  });

  it('detecta carta duplicada e parâmetros inválidos', () => {
    const broken = [...eventCards, { ...eventCards[0] }, { id: 'x', title: 'X', text: 'X', effect: { type: 'BLACKOUT' as const, visits: 0 } }];
    const errors = validateEventCards(broken, board);
    expect(errors).toContain(`Carta duplicada: ${eventCards[0].id}`);
    expect(errors).toContain('x: visitas devem ser positivas');
  });
});
