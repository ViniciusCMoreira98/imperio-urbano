import { describe, expect, it } from 'vitest';
import { states } from '@imperio/game-data';
import type { GameSnapshot, PropertyState } from '@imperio/shared-types';
import { reduceServerMessage } from '../store/gameStore';
import { describeEvent } from './presentation';
import { affordablePurchaseHouses, buildOptions, currentRent } from './rules';

const snapshot = (version: number, extra: Partial<GameSnapshot> = {}): GameSnapshot => ({
  gameId: 'g1',
  inviteCode: 'ABC234',
  mode: 'CLASSIC',
  status: 'IN_PROGRESS',
  version,
  round: 1,
  currentPlayerId: 'ana',
  phase: 'AWAITING_ROLL',
  lastDice: null,
  players: [],
  properties: [],
  olympics: { edition: 0, hostStateId: null, hostPlayerId: null, multiplier: 1 },
  pendingDebt: null,
  winnerIds: [],
  turnTimeLeftMs: null,
  ...extra,
});

describe('mensagens do servidor', () => {
  const empty = { snapshot: null, log: [], rejection: null, turnDeadline: null };

  it('ignora snapshot mais antigo que o atual', () => {
    const current = reduceServerMessage(empty, { kind: 'SNAPSHOT', snapshot: snapshot(5) });
    const stale = reduceServerMessage(current, { kind: 'SNAPSHOT', snapshot: snapshot(3) });
    expect(stale.snapshot?.version).toBe(5);
  });

  it('converte o tempo restante do turno em prazo local', () => {
    const next = reduceServerMessage(empty, { kind: 'SNAPSHOT', snapshot: snapshot(2, { turnTimeLeftMs: 15000 }) }, 1000);
    expect(next.turnDeadline).toBe(16000);
    const noTimer = reduceServerMessage(next, { kind: 'SNAPSHOT', snapshot: snapshot(3) }, 2000);
    expect(noTimer.turnDeadline).toBeNull();
  });

  it('acumula eventos e limpa a recusa anterior', () => {
    const rejected = reduceServerMessage(empty, { kind: 'COMMAND_REJECTED', commandId: 'c', reason: 'Não é a sua vez.' });
    expect(rejected.rejection).toBe('Não é a sua vez.');
    const next = reduceServerMessage(rejected, {
      kind: 'EVENTS',
      version: 2,
      events: [{ type: 'DICE_ROLLED', playerId: 'ana', dice: { first: 1, second: 2 } }],
    });
    expect(next.log).toHaveLength(1);
    expect(next.rejection).toBeNull();
  });
});

describe('regras de apoio à interface', () => {
  const property = (level: number, visits: number, reachedAt: number): PropertyState =>
    ({ stateId: 'AP', ownerId: 'ana', buildingLevel: level, ownerVisits: visits, levelReachedAtVisit: reachedAt }) as PropertyState;

  it('segue as etapas por visita do servidor', () => {
    expect(buildOptions(property(1, 2, 1))).toEqual({ houses: 2, hotel: false });
    expect(buildOptions(property(3, 1, 1))).toEqual({ houses: 0, hotel: false });
    expect(buildOptions(property(3, 2, 1))).toEqual({ houses: 1, hotel: false });
    expect(buildOptions(property(4, 3, 2))).toEqual({ houses: 0, hotel: true });
  });

  it('calcula casas pagáveis na compra e aluguel com Olimpíadas', () => {
    const ap = states.find((s) => s.id === 'AP')!;
    expect(affordablePurchaseHouses(ap, ap.price + ap.houseCost)).toBe(1);
    expect(affordablePurchaseHouses(ap, 9999)).toBe(3);

    const hosted = snapshot(1, {
      properties: [property(2, 1, 1)],
      olympics: { edition: 2, hostStateId: 'AP', hostPlayerId: 'ana', multiplier: 3 },
    });
    expect(currentRent(hosted, ap)).toBe(3 * ap.rent.house2);
  });

  it('descreve eventos em português', () => {
    const name = (id: string) => ({ ana: 'Ana', bia: 'Bia' })[id] ?? id;
    expect(describeEvent({ type: 'RENT_PAID', fromId: 'bia', toId: 'ana', stateId: 'AP', amount: 10 }, name))
      .toBe('Bia pagou $ 10 de aluguel a Ana.');
    expect(describeEvent({ type: 'PLAYER_MOVED', playerId: 'ana', from: 33, to: 2, startBonus: 200, sentToRest: false }, name))
      .toBe('Ana foi para Roraima e recebeu $ 200 no Início.');
  });
});
