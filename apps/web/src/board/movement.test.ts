import { describe, expect, it } from 'vitest';
import { movePath, passesStart } from './movement';

describe('movimento do peão', () => {
  it('percorre as casas em ordem', () => {
    expect(movePath(3, 4, 36)).toEqual([4, 5, 6, 7]);
  });

  it('dá a volta no tabuleiro', () => {
    expect(movePath(33, 5, 36)).toEqual([34, 35, 0, 1, 2]);
    expect(passesStart(33, 5, 36)).toBe(true);
  });

  it('parar no Início conta como passar', () => {
    expect(movePath(30, 6, 36).at(-1)).toBe(0);
    expect(passesStart(30, 6, 36)).toBe(true);
    expect(passesStart(30, 5, 36)).toBe(false);
  });
});
