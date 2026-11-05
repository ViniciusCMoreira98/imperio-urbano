import { describe, expect, it } from 'vitest';
import { states } from '@imperio/game-data';
import type { GameSnapshot, PropertyState } from '@imperio/shared-types';
import { reduceServerMessage } from '../store/gameStore';
import { describeEvent } from './presentation';
import { affordablePurchaseHouses, buildOptions, currentRent, investedIn, leaders, netWorth } from './rules';

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
  taxPool: 0,
  turnTimeLeftMs: null,
  ...extra,
});

describe('mensagens do servidor', () => {
  const empty = { snapshot: null, log: [], rejection: null, turnDeadline: null, moves: [], eventsVersion: null, resync: 0, unavailable: null };

  it('ignora snapshot mais antigo que o atual', () => {
    const current = reduceServerMessage(empty, { kind: 'SNAPSHOT', snapshot: snapshot(5) });
    const stale = reduceServerMessage(current, { kind: 'SNAPSHOT', snapshot: snapshot(3) });
    expect(stale.snapshot?.version).toBe(5);
  });

  it('guarda o motivo de a partida não poder continuar (tabuleiro antigo)', () => {
    const next = reduceServerMessage(empty, { kind: 'GAME_UNAVAILABLE', reason: 'Esta partida usa o tabuleiro antigo e não pode continuar.' });
    expect(next.unavailable).toBe('Esta partida usa o tabuleiro antigo e não pode continuar.');
    expect(next.snapshot).toBeNull();
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

  it('valor do estado sobe a cada construção', () => {
    const am = states.find((s) => s.id === 'AM')!;
    const values = [0, 1, 2, 3, 4, 5].map((level) => am.price + investedIn(am, property(level, 3, 1)));
    expect(values[0]).toBe(am.price);
    expect(values[1]).toBe(am.price + am.houseCost);
    expect(values[5]).toBe(am.price + 4 * am.houseCost + am.hotelCost);
    values.slice(1).forEach((value, i) => expect(value).toBeGreaterThan(values[i]));
  });

  it('calcula patrimônio e líder', () => {
    const ap = states.find((s) => s.id === 'AP')!;
    const player = (id: string, credits: number) =>
      ({ id, nickname: id, credits, bankrupt: false }) as GameSnapshot['players'][number];
    const game = snapshot(1, {
      players: [player('ana', 1000), player('bia', 1000)],
      properties: [property(2, 1, 1)],
    });
    expect(netWorth(game, 'ana')).toBe(1000 + ap.price + 2 * ap.houseCost);
    expect(leaders(game)).toEqual(['ana']);
    expect(leaders(snapshot(1, { players: [player('ana', 500), player('bia', 500)] }))).toEqual([]);
  });

  it('descreve eventos em português', () => {
    const name = (id: string) => ({ ana: 'Ana', bia: 'Bia' })[id] ?? id;
    expect(describeEvent({ type: 'RENT_PAID', fromId: 'bia', toId: 'ana', stateId: 'AP', amount: 10 }, name))
      .toBe('Bia pagou R$ 10 de aluguel a Ana.');
    expect(describeEvent({ type: 'PLAYER_MOVED', playerId: 'ana', from: 33, to: 2, startBonus: 200, sentToRest: false }, name))
      .toBe('Ana foi para Amazonas e recebeu R$ 200 no Início.');
  });
});
