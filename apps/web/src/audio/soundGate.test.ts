import { describe, expect, it } from 'vitest';
import type { DomainEvent } from '@imperio/shared-types';
import { GRACE_MS, groupReady, soundGroup } from './soundGate';

const dice = (playerId: string): DomainEvent => ({ type: 'DICE_ROLLED', playerId, dice: { first: 6, second: 4 } }) as DomainEvent;
const moved = (playerId: string, to: number): DomainEvent =>
  ({ type: 'PLAYER_MOVED', playerId, from: 11, to, startBonus: 0, sentToRest: false }) as DomainEvent;
const quiet = { landed: {}, moving: {}, rolling: false, cardDoneId: -1 };

describe('quando os sons de um lote tocam', () => {
  it('a Taxa toca no pouso de quem pagou, mesmo com o adversário já rolando os dados', () => {
    // Versões 10..13: Ana rola, anda até a Taxa, paga e passa a vez.
    const tax = soundGroup([dice('ana'), moved('ana', 21), { type: 'TAX_PAID', playerId: 'ana', amount: 100 } as DomainEvent, { type: 'TURN_ENDED', playerId: 'ana', nextPlayerId: 'bia' } as DomainEvent], 10, ['pagarAluguel']);
    expect(tax.moves).toEqual({ ana: 11 });
    // Ana ainda saltando: espera.
    expect(groupReady(tax, { ...quiet, moving: { ana: true } }, 0)).toBe(false);
    // Ana pousou; Bia já rola e anda (antes isso segurava o som até a próxima vez de Ana).
    expect(groupReady(tax, { landed: { ana: 11 }, moving: { bia: true }, rolling: true, cardDoneId: -1 }, 100)).toBe(true);
  });

  it('espera a carta do lote sumir', () => {
    const card = soundGroup([dice('ana'), moved('ana', 4), { type: 'EVENT_CARD_DRAWN', playerId: 'ana', cardId: 'x' } as DomainEvent], 20, ['receberDinheiro']);
    expect(groupReady(card, { ...quiet, landed: { ana: 21 } }, 0)).toBe(false);
    expect(groupReady(card, { ...quiet, landed: { ana: 21 }, cardDoneId: 22 }, 0)).toBe(true);
  });

  it('lance sem movimento (Descanso) espera os dados pararem', () => {
    const rest = soundGroup([dice('ana'), { type: 'REST_TURN_LOST', playerId: 'ana' } as DomainEvent], 30, ['suaVez']);
    expect(groupReady(rest, { ...quiet, rolling: true }, 0)).toBe(false);
    expect(groupReady(rest, quiet, 0)).toBe(true);
  });

  it('personagem que não anima não segura o som para sempre', () => {
    const group = soundGroup([moved('ana', 21)], 40, ['pagarAluguel']);
    expect(groupReady(group, quiet, 1000)).toBe(false);
    expect(groupReady(group, { ...quiet, moving: { ana: true } }, 1000 + GRACE_MS)).toBe(false);
    expect(groupReady(group, quiet, 1000 + GRACE_MS)).toBe(true);
  });
});
