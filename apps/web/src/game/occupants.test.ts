import { describe, expect, it } from 'vitest';
import type { GameSnapshot } from '@imperio/shared-types';
import { tileOccupants } from './occupants';

const player = (id: string, seat: number, position: number, bankrupt = false) => ({ id, nickname: id, seat, position, bankrupt });
const snap = (...players: ReturnType<typeof player>[]) => ({ players }) as unknown as GameSnapshot;
const ids = (s: GameSnapshot, tile: number) => tileOccupants(s, tile).map((p) => p.id);

describe('ocupantes da casa', () => {
  it('lista quem está na casa pela ordem dos assentos, de 1 a 4', () => {
    expect(ids(snap(player('caio', 2, 7)), 7)).toEqual(['caio']);
    expect(ids(snap(player('duda', 3, 7), player('ana', 0, 7), player('caio', 2, 7), player('bia', 1, 7)), 7)).toEqual(['ana', 'bia', 'caio', 'duda']);
  });

  it('casa vazia e quem está em outra casa não entram', () => {
    expect(ids(snap(player('ana', 0, 3), player('bia', 1, 9)), 7)).toEqual([]);
    expect(ids(snap(player('ana', 0, 3), player('bia', 1, 7)), 7)).toEqual(['bia']);
  });

  it('acompanha quem entra e sai da casa', () => {
    const before = snap(player('ana', 0, 7), player('bia', 1, 4));
    const after = snap(player('ana', 0, 11), player('bia', 1, 7));
    expect(ids(before, 7)).toEqual(['ana']);
    expect(ids(after, 7)).toEqual(['bia']);
  });

  it('falido sai do tabuleiro e não aparece como ocupante', () => {
    expect(ids(snap(player('ana', 0, 7, true), player('bia', 1, 7)), 7)).toEqual(['bia']);
  });
});
