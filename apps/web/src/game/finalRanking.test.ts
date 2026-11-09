import { describe, expect, it } from 'vitest';
import type { GameSnapshot, PlayerState } from '@imperio/shared-types';
import { endedByClock, finalRanking, prizeShare } from './finalRanking';

const player = (id: string, credits: number, extra: Partial<PlayerState> = {}): PlayerState =>
  ({ id, nickname: id, credits, seat: 0, bankrupt: false, pawnColor: 'VERDE', avatarId: 'avatar-1', ...extra }) as PlayerState;

const snapshot = (players: PlayerState[], extra: Partial<GameSnapshot> = {}): GameSnapshot =>
  ({ mode: 'TIMED_25', timeUp: true, players, properties: [], winnerIds: [], olympics: { edition: 0, hostStateId: null, hostPlayerId: null, multiplier: 1 }, ...extra }) as GameSnapshot;

describe('classificação final', () => {
  it('põe os vencedores do servidor primeiro, depois patrimônio, falidos no fim', () => {
    const game = snapshot(
      [player('ana', 900), player('bia', 1200, { bankrupt: true }), player('caio', 1500), player('davi', 700)],
      { winnerIds: ['caio'], properties: [{ stateId: 'MA', ownerId: 'davi', buildingLevel: 0 } as GameSnapshot['properties'][number]] },
    );
    const ranking = finalRanking(game);
    expect(ranking.map((r) => r.player.id)).toEqual(['caio', 'davi', 'ana', 'bia']);
    expect(ranking.map((r) => r.place)).toEqual([1, 2, 3, 4]);
    expect(ranking[1].properties).toBe(1);
    expect(ranking[3].netWorth).toBe(0);
  });

  it('empate divide a posição', () => {
    const ranking = finalRanking(snapshot([player('ana', 1000), player('bia', 1000)], { winnerIds: ['ana', 'bia'] }));
    expect(ranking.map((r) => r.place)).toEqual([1, 1]);
  });

  it('reconhece o fim pelo relógio só nos modos por tempo', () => {
    expect(endedByClock(snapshot([]))).toBe(true);
    expect(endedByClock(snapshot([], { timeUp: false }))).toBe(false);
    expect(endedByClock(snapshot([], { mode: 'CLASSIC' }))).toBe(false);
  });

  it('prêmio é aposta × jogadores, dividido entre os vencedores', () => {
    expect(prizeShare(200, 4, 1)).toBe(800);
    expect(prizeShare(200, 3, 2)).toBe(300);
    expect(prizeShare(0, 4, 1)).toBe(0);
  });
});
