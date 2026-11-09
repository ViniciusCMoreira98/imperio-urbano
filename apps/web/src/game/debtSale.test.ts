import { describe, expect, it } from 'vitest';
import { board, states } from '@imperio/game-data';
import type { GameSnapshot } from '@imperio/shared-types';
import { boardChoice, choiceAction } from './boardChoice';
import { saleSummary } from './debtSale';

const tileOf = (id: string) => board.tiles.find((t) => t.stateId === id)!.index;
const price = (id: string) => states.find((s) => s.id === id)!.price;
const houseCost = (id: string) => states.find((s) => s.id === id)!.houseCost;

const inDebt = (credits: number, amount: number) =>
  ({
    status: 'IN_PROGRESS',
    phase: 'AWAITING_DEBT_RESOLUTION',
    currentPlayerId: 'ana',
    players: [
      { id: 'ana', nickname: 'Ana', credits, bankrupt: false },
      { id: 'bia', nickname: 'Bia', credits: 2500, bankrupt: false },
    ],
    properties: [
      { stateId: 'AC', ownerId: 'ana', buildingLevel: 2 },
      { stateId: 'RN', ownerId: 'ana', buildingLevel: 0 },
      { stateId: 'MA', ownerId: 'bia', buildingLevel: 0 },
    ],
    pendingDebt: { debtorId: 'ana', creditorId: 'bia', amount, toTaxPool: false },
  }) as unknown as GameSnapshot;

describe('venda de estados para pagar dívida', () => {
  const acValue = Math.floor(((price('AC') + 2 * houseCost('AC')) * 80) / 100);
  const rnValue = Math.floor((price('RN') * 80) / 100);

  it('o tabuleiro destaca só os estados do devedor e não tem confirmação de casa única', () => {
    const choice = boardChoice(inDebt(10, 300), 'ana')!;
    expect(choice.kind).toBe('sale');
    expect(choice.tiles.sort((a, b) => a - b)).toEqual([tileOf('RN'), tileOf('AC')].sort((a, b) => a - b));
    expect(choiceAction(choice, tileOf('AC'))).toBeNull();
  });

  it('soma 80% do estado inteiro e só cobre quando paga a dívida', () => {
    const snapshot = inDebt(10, 10 + rnValue + 1);
    const onlyRn = saleSummary(snapshot, 'ana', [tileOf('RN')])!;
    expect(onlyRn.total).toBe(rnValue);
    expect(onlyRn.missing).toBe(1);
    expect(onlyRn.covers).toBe(false);

    const both = saleSummary(snapshot, 'ana', [tileOf('RN'), tileOf('AC'), tileOf('MA')])!;
    expect(both.items.map((i) => i.stateId)).toEqual(['RN', 'AC']);
    expect(both.total).toBe(rnValue + acValue);
    expect(both.covers).toBe(true);
    expect(both.hopeless).toBe(false);
  });

  it('sem nada marcado não cobre; dívida impagável pede falência', () => {
    expect(saleSummary(inDebt(10, 20), 'ana', [])!.covers).toBe(false);
    expect(saleSummary(inDebt(10, 10_000), 'ana', [])!.hopeless).toBe(true);
  });
});
