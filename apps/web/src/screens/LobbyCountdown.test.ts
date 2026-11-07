import { describe, expect, it } from 'vitest';
import { countdownText } from './LobbyScreen';

describe('countdownText', () => {
  it('explica o início automático enquanto não há contagem', () => {
    expect(countdownText(null)).toBe('Com 2 jogadores, a partida começa sozinha em 10 s.');
  });

  it('mostra os segundos e, no fim, que está começando', () => {
    expect(countdownText(7)).toBe('A partida começa em 7 s');
    expect(countdownText(0)).toBe('Começando a partida…');
  });
});
