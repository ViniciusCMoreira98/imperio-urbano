import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import type { GameSnapshot, PlayerState, PropertyState } from '@imperio/shared-types';
import { boardChoice, choiceAction } from './boardChoice';

const tileOf = (stateId: string) => board.tiles.find((t) => t.stateId === stateId)!.index;
const player = (id: string, position: number) => ({ id, nickname: id, credits: 1500, position, bankrupt: false }) as PlayerState;
const owned = (stateId: string, ownerId: string) => ({ stateId, ownerId, buildingLevel: 0 }) as PropertyState;

const game = (extra: Partial<GameSnapshot>): GameSnapshot =>
  ({
    status: 'IN_PROGRESS',
    currentPlayerId: 'ana',
    phase: 'AWAITING_ROLL',
    players: [player('ana', 8), player('bia', 0)],
    properties: [owned('MA', 'ana'), owned('BA', 'ana'), owned('SP', 'bia')],
    olympics: { edition: 0, hostStateId: null, hostPlayerId: null, multiplier: 1 },
    ...extra,
  }) as GameSnapshot;

describe('escolha no tabuleiro', () => {
  it('Olimpíadas destacam só os estados do jogador e confirmam com o estado tocado', () => {
    const choice = boardChoice(game({ phase: 'AWAITING_OLYMPICS_HOST' }), 'ana')!;
    expect(choice.kind).toBe('olympics');
    expect(choice.tiles.sort((a, b) => a - b)).toEqual([tileOf('BA'), tileOf('MA')].sort((a, b) => a - b));
    expect(choiceAction(choice, tileOf('MA'))?.command).toEqual({ type: 'HOST_OLYMPICS', stateId: 'MA' });
    expect(choiceAction(choice, tileOf('MA'))?.label).toMatch(/^Sediar em Maranhão — R\$/);
    expect(choiceAction(choice, tileOf('SP'))).toBeNull();
    expect(choiceAction(choice, null)).toBeNull();
  });

  it('a viagem destaca só os estados', () => {
    const choice = boardChoice(game({ phase: 'AWAITING_TRAVEL_DESTINATION', players: [player('ana', 26), player('bia', 0)] }), 'ana')!;
    expect(choice.kind).toBe('travel');
    expect(choice.tiles).toHaveLength(board.tiles.filter((t) => t.type === 'PROPERTY').length);
    for (const special of [0, 8, 17, 21, 26]) expect(choice.tiles).not.toContain(special);
    expect(choiceAction(choice, tileOf('SP'))?.command).toEqual({ type: 'CHOOSE_TRAVEL', tileIndex: tileOf('SP') });
    expect(choiceAction(choice, 26)).toBeNull();
  });

  it('não aparece fora da vez nem em outras fases', () => {
    expect(boardChoice(game({ phase: 'AWAITING_OLYMPICS_HOST', currentPlayerId: 'bia' }), 'ana')).toBeNull();
    expect(boardChoice(game({ phase: 'AWAITING_ROLL' }), 'ana')).toBeNull();
  });
});
