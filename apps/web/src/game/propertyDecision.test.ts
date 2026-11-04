import { describe, expect, it } from 'vitest';
import { board, states } from '@imperio/game-data';
import type { GameSnapshot, PlayerState, PropertyState } from '@imperio/shared-types';
import { actionLabel, commandFor, costFor, defaultSelection, pendingDecision, refuseCommand, viewDecision } from './propertyDecision';

const ap = states.find((s) => s.id === 'AP')!;
const apTile = board.tiles.find((t) => t.stateId === 'AP')!.index;
const specialTile = board.tiles.find((t) => t.type !== 'PROPERTY')!.index;

const player = (id: string, credits: number, position = apTile) =>
  ({ id, nickname: id, credits, position, bankrupt: false }) as PlayerState;
const owned = (level: number, visits = 1, reachedAt = 1, ownerId = 'ana'): PropertyState =>
  ({ stateId: 'AP', ownerId, buildingLevel: level, ownerVisits: visits, levelReachedAtVisit: reachedAt }) as PropertyState;

const game = (extra: Partial<GameSnapshot>): GameSnapshot => ({
  gameId: 'g1',
  inviteCode: 'ABC234',
  mode: 'CLASSIC',
  status: 'IN_PROGRESS',
  version: 1,
  round: 1,
  currentPlayerId: 'ana',
  phase: 'AWAITING_ROLL',
  lastDice: null,
  players: [player('ana', 9999), player('bia', 9999, 0)],
  properties: [],
  olympics: { edition: 0, hostStateId: null, hostPlayerId: null, multiplier: 1 },
  pendingDebt: null,
  winnerIds: [],
  turnTimeLeftMs: null,
  ...extra,
});

const statuses = (d: { stages: { status: string }[] } | null) => d?.stages.map((s) => s.status);

describe('modal de compra', () => {
  it('libera terreno e até 3 casas; Casa 4 e hotel ficam para outras visitas', () => {
    const d = pendingDecision(game({ phase: 'AWAITING_PURCHASE' }), 'ana')!;
    expect(d.mode).toBe('purchase');
    expect(statuses(d)).toEqual(['available', 'available', 'available', 'available', 'locked', 'locked']);
    expect(d.stages[4].note).toBe('Em uma próxima visita');
    expect(defaultSelection(d)).toBe(0);
  });

  it('bloqueia o que o saldo não paga', () => {
    const d = pendingDecision(game({ phase: 'AWAITING_PURCHASE', players: [player('ana', ap.price + ap.houseCost)] }), 'ana')!;
    expect(statuses(d)?.slice(0, 4)).toEqual(['available', 'available', 'locked', 'locked']);
    expect(d.stages[2].note).toBe('Saldo insuficiente');

    const broke = pendingDecision(game({ phase: 'AWAITING_PURCHASE', players: [player('ana', ap.price - 1)] }), 'ana')!;
    expect(broke.stages[0].status).toBe('locked');
    expect(defaultSelection(broke)).toBeNull();
    expect(actionLabel(broke, null)).toBe('SEM SALDO PARA COMPRAR');
  });

  it('o nível escolhido vira o número de casas da compra', () => {
    const d = pendingDecision(game({ phase: 'AWAITING_PURCHASE' }), 'ana')!;
    expect(commandFor(d, 0)).toEqual({ type: 'BUY_PROPERTY', houses: 0 });
    expect(commandFor(d, 3)).toEqual({ type: 'BUY_PROPERTY', houses: 3 });
    expect(commandFor(d, 4)).toBeNull();
    expect(costFor(d, 2)).toBe(ap.price + 2 * ap.houseCost);
    expect(actionLabel(d, 2)).toBe('COMPRAR COM 2 CASAS');
    expect(refuseCommand(d)).toEqual({ type: 'DECLINE_PURCHASE' });
  });

  it('não abre fora da vez nem fora da fase de compra', () => {
    expect(pendingDecision(game({ phase: 'AWAITING_PURCHASE', currentPlayerId: 'bia' }), 'ana')).toBeNull();
    expect(pendingDecision(game({ phase: 'AWAITING_END_TURN' }), 'ana')).toBeNull();
    expect(pendingDecision(game({ phase: 'AWAITING_PURCHASE' }), 'observador')).toBeNull();
  });
});

describe('modal de construção', () => {
  it('a partir de 1 casa na primeira visita, constrói até a Casa 3', () => {
    const d = pendingDecision(game({ phase: 'AWAITING_BUILD', properties: [owned(1)] }), 'ana')!;
    expect(d.mode).toBe('build');
    expect(statuses(d)).toEqual(['complete', 'current', 'available', 'available', 'locked', 'locked']);
    expect(defaultSelection(d)).toBe(2);
    // Nível final 3 a partir de 1 casa = construir 2, não 3.
    expect(commandFor(d, 3)).toEqual({ type: 'BUILD', houses: 2 });
    expect(costFor(d, 3)).toBe(2 * ap.houseCost);
    expect(actionLabel(d, 3)).toBe('CONSTRUIR 2 CASAS');
    expect(refuseCommand(d)).toEqual({ type: 'SKIP_BUILD' });
  });

  it('Casa 4 em nova visita e hotel só numa visita depois da Casa 4', () => {
    const casa4 = pendingDecision(game({ phase: 'AWAITING_BUILD', properties: [owned(3, 2, 1)] }), 'ana')!;
    expect(statuses(casa4)).toEqual(['complete', 'complete', 'complete', 'current', 'available', 'locked']);
    expect(commandFor(casa4, 4)).toEqual({ type: 'BUILD', houses: 1 });

    const hotel = pendingDecision(game({ phase: 'AWAITING_BUILD', properties: [owned(4, 3, 2)] }), 'ana')!;
    expect(hotel.stages[5].status).toBe('available');
    expect(commandFor(hotel, 5)).toEqual({ type: 'BUILD_HOTEL' });
    expect(costFor(hotel, 5)).toBe(ap.hotelCost);

    const sameVisit = pendingDecision(game({ phase: 'AWAITING_BUILD', properties: [owned(4, 2, 2)] }), 'ana')!;
    expect(sameVisit.stages[5]).toMatchObject({ status: 'locked', note: 'Depois da Casa 4, em outra visita' });
    expect(defaultSelection(sameVisit)).toBeNull();
  });

  it('bloqueia o hotel sem saldo e mostra aluguel olímpico', () => {
    const d = pendingDecision(
      game({
        phase: 'AWAITING_BUILD',
        players: [player('ana', ap.hotelCost - 1)],
        properties: [owned(4, 3, 2)],
        olympics: { edition: 1, hostStateId: 'AP', hostPlayerId: 'ana', multiplier: 2 },
      }),
      'ana',
    )!;
    expect(d.stages[5]).toMatchObject({ status: 'locked', note: 'Saldo insuficiente' });
    expect(d.stages[5].rentLabel).toBe(`R$ ${(2 * ap.rent.hotel).toLocaleString('pt-BR')}`);
  });

  it('não constrói em estado de outro jogador', () => {
    expect(pendingDecision(game({ phase: 'AWAITING_BUILD', properties: [owned(1, 1, 1, 'bia')] }), 'ana')).toBeNull();
  });
});

describe('modal de consulta', () => {
  it('abre fora da vez, marca o nível atual e não gera comando', () => {
    const d = viewDecision(game({ currentPlayerId: 'bia', properties: [owned(2, 1, 1, 'bia')] }), 'ana', apTile)!;
    expect(d.mode).toBe('view');
    expect(statuses(d)).toEqual(['complete', 'complete', 'current', 'locked', 'locked', 'locked']);
    expect(defaultSelection(d)).toBeNull();
    expect(commandFor(d, 3)).toBeNull();
    expect(refuseCommand(d)).toBeNull();
  });

  it('estado sem dono não tem etapa atual; casa especial não abre o modal', () => {
    const d = viewDecision(game({}), 'ana', apTile)!;
    expect(d.currentLevel).toBe(-1);
    expect(d.stages.every((s) => s.status === 'locked')).toBe(true);
    expect(viewDecision(game({}), 'ana', specialTile)).toBeNull();
  });

  it('na vez de sediar, viajar ou vender, o clique fica com o painel lateral', () => {
    for (const phase of ['AWAITING_OLYMPICS_HOST', 'AWAITING_TRAVEL_DESTINATION', 'AWAITING_DEBT_RESOLUTION'] as const) {
      expect(viewDecision(game({ phase }), 'ana', apTile)).toBeNull();
      expect(viewDecision(game({ phase, currentPlayerId: 'bia' }), 'ana', apTile)).not.toBeNull();
    }
  });
});
