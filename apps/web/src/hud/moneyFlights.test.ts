import { describe, expect, it } from 'vitest';
import { BANK, pairPayments } from './moneyFlights';

describe('pairPayments', () => {
  it('aluguel: quem paga manda para quem recebe', () => {
    expect(pairPayments({ ana: -120, bia: 120, caio: 0 })).toEqual([{ from: 'ana', to: 'bia', amount: 120 }]);
  });

  it('compra e taxa vão para o banco; bônus do Início sai dele', () => {
    expect(pairPayments({ ana: -260 })).toEqual([{ from: 'ana', to: BANK, amount: 260 }]);
    expect(pairPayments({ ana: 200 })).toEqual([{ from: BANK, to: 'ana', amount: 200 }]);
  });

  it('vários pagam um só (aniversário) e a sobra fica com o banco', () => {
    expect(pairPayments({ bia: -50, caio: -50, ana: 100 })).toEqual([
      { from: 'bia', to: 'ana', amount: 50 },
      { from: 'caio', to: 'ana', amount: 50 },
    ]);
    expect(pairPayments({ ana: -300, bia: 100 })).toEqual([
      { from: 'ana', to: 'bia', amount: 100 },
      { from: 'ana', to: BANK, amount: 200 },
    ]);
  });
});
