import { describe, expect, it } from 'vitest';
import type { DomainEvent } from '@imperio/shared-types';
import { TAX_POOL, heldMoveCredits, moneyFromEvents } from './heldMoney';

const events: DomainEvent[] = [
  { type: 'DICE_ROLLED', playerId: 'ana', dice: { first: 4, second: 5 } },
  { type: 'PLAYER_MOVED', playerId: 'ana', from: 30, to: 5, startBonus: 300, sentToRest: false },
  { type: 'RENT_PAID', fromId: 'ana', toId: 'bia', stateId: 'AP', amount: 33 },
  { type: 'TURN_ENDED', playerId: 'ana', nextPlayerId: 'bia', round: 2 },
  { type: 'TAX_PAID', playerId: 'ana', amount: 100 },
];

describe('saldo que espera o personagem chegar', () => {
  const holds = moneyFromEvents(events, 20);

  it('liga o bônus do Início e o aluguel ao movimento; o que vem depois da vez não espera', () => {
    expect(holds).toEqual([
      { moveId: 21, mover: 'ana', atStart: true, credits: { ana: 300 } },
      { moveId: 21, mover: 'ana', atStart: false, credits: { ana: -33, bia: 33 } },
    ]);
  });

  it('segura tudo até passar pelo Início, o bônus até o pouso não', () => {
    expect(heldMoveCredits(holds, {}, {})).toEqual({ ana: 267, bia: 33 });
    expect(heldMoveCredits(holds, {}, { ana: 21 })).toEqual({ ana: -33, bia: 33 });
    expect(heldMoveCredits(holds, { ana: 21 }, {})).toEqual({});
  });

  it('movimento antigo já pousado não segura nada', () => {
    expect(heldMoveCredits(holds, { ana: 40 }, {})).toEqual({});
  });

  it('antes do snapshot novo chegar não desconta nada do saldo antigo (o bônus do Início não some)', () => {
    expect(heldMoveCredits(holds, {}, {}, 19)).toEqual({});
    expect(heldMoveCredits(holds, {}, {}, 24)).toEqual({ ana: 267, bia: 33 });
  });
});

describe('fundo da Taxa que espera o personagem chegar', () => {
  const moves: DomainEvent[] = [
    { type: 'PLAYER_MOVED', playerId: 'ana', from: 2, to: 4, startBonus: 0, sentToRest: false },
    { type: 'TAX_PAID', playerId: 'ana', amount: 100 },
    { type: 'TURN_ENDED', playerId: 'ana', nextPlayerId: 'bia', round: 2 },
    { type: 'PLAYER_MOVED', playerId: 'bia', from: 10, to: 17, startBonus: 0, sentToRest: false },
    { type: 'SAQUE_COLLECTED', playerId: 'bia', amount: 400 },
  ];
  const holds = moneyFromEvents(moves, 1);

  it('a taxa só entra no fundo e o Saque só sai dele quando cada personagem pousa', () => {
    expect(heldMoveCredits(holds, {}, {})[TAX_POOL]).toBe(100 - 400);
    expect(heldMoveCredits(holds, { ana: 1 }, {})[TAX_POOL]).toBe(-400);
    expect(heldMoveCredits(holds, { ana: 1, bia: 4 }, {})[TAX_POOL]).toBeUndefined();
  });
});

describe('compra e construção em lote próprio (11/11/2026)', () => {
  const purchase: DomainEvent[] = [
    { type: 'PROPERTY_PURCHASED', playerId: 'bot-1', stateId: 'SP', price: 260 },
    { type: 'HOUSE_BUILT', playerId: 'bot-1', stateId: 'SP', count: 2, cost: 300 },
  ];

  it('esperam o personagem que ainda anda na tela pousar', () => {
    const holds = moneyFromEvents(purchase, 40, new Map([['bot-1', 35]]));
    expect(heldMoveCredits(holds, { 'bot-1': 30 }, {})['bot-1']).toBe(-560);
    expect(heldMoveCredits(holds, { 'bot-1': 35 }, {})['bot-1']).toBeUndefined();
  });

  it('sem movimento conhecido, aparecem na hora', () => {
    expect(moneyFromEvents(purchase, 40)).toEqual([]);
  });
});
