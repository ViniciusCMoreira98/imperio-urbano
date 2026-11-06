import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import type { DomainEvent } from '@imperio/shared-types';
import { eventSounds } from './eventSounds';
import { analyzeTrack } from './sounds';

const moved = (startBonus = 0): DomainEvent => ({ type: 'PLAYER_MOVED', playerId: 'ana', from: 1, to: 5, startBonus, sentToRest: false });

describe('sons dos eventos da partida', () => {
  it('lance e saltos não entram na fila (tocam com a animação); o resultado sim', () => {
    const events: DomainEvent[] = [
      { type: 'DICE_ROLLED', playerId: 'ana', dice: { first: 2, second: 2 } } as DomainEvent,
      moved(),
      { type: 'PROPERTY_PURCHASED', playerId: 'ana', stateId: 'PA', price: 170 } as DomainEvent,
    ];
    expect(eventSounds(events, 'ana')).toEqual(['comprar']);
  });

  it('aluguel soa como perda para quem paga e como ganho para quem recebe', () => {
    const rent = { type: 'RENT_PAID', fromId: 'ana', toId: 'bia', stateId: 'PA', amount: 50 } as DomainEvent;
    expect(eventSounds([rent], 'ana')).toEqual(['pagarAluguel']);
    expect(eventSounds([rent], 'bia')).toEqual(['receberDinheiro']);
    expect(eventSounds([moved(200)], 'ana')).toEqual(['receberDinheiro']);
  });

  it('avisa a vez só de quem vai jogar, por último, sem passar de três sons', () => {
    const events: DomainEvent[] = [
      { type: 'EVENT_CARD_DRAWN', playerId: 'bia', cardId: 'x' } as DomainEvent,
      { type: 'CREDITS_TO_BANK', playerId: 'bia', amount: 10 } as DomainEvent,
      { type: 'HOUSE_BUILT', playerId: 'bia', stateId: 'PA', count: 1, cost: 50 } as DomainEvent,
      { type: 'TURN_ENDED', playerId: 'bia', nextPlayerId: 'ana', round: 2 } as DomainEvent,
    ];
    expect(eventSounds(events, 'ana')).toEqual(['cartaEvento', 'pagarAluguel', 'suaVez']);
    expect(eventSounds(events, 'caio')).toEqual(['cartaEvento', 'pagarAluguel', 'construir']);
  });

  it('parar na casa das Olimpíadas toca o anúncio', () => {
    const olympics = board.tiles.find((t) => t.type === 'OLYMPICS')!.index;
    const landed: DomainEvent = { type: 'PLAYER_MOVED', playerId: 'ana', from: olympics - 3, to: olympics, startBonus: 0, sentToRest: false };
    expect(eventSounds([landed], 'bia')).toEqual(['olimpiadas']);
    expect(eventSounds([{ ...landed, to: olympics + 1 } as DomainEvent], 'bia')).toEqual([]);
  });

  it('fim de partida toca a vitória e não avisa vez', () => {
    const events: DomainEvent[] = [
      { type: 'TURN_ENDED', playerId: 'bia', nextPlayerId: 'ana', round: 15 } as DomainEvent,
      { type: 'GAME_FINISHED', winnerIds: ['ana'] } as DomainEvent,
    ];
    expect(eventSounds(events, 'ana')).toEqual(['vitoria']);
  });
});

describe('preparo das faixas', () => {
  it('recorta o silêncio do começo e iguala o volume de faixas baixas', () => {
    const rate = 1000;
    const samples = new Float32Array(3000);
    for (let i = 1800; i < 2300; i++) samples[i] = (i % 2 ? 1 : -1) * 0.04; // som baixo depois de 1,8 s de silêncio
    const { start, end, gain } = analyzeTrack(samples, rate);
    expect(start).toBeCloseTo(1.78, 3);
    expect(end).toBeCloseTo(2.339, 3);
    expect(gain).toBeCloseTo(10 ** (-20 / 20) / 0.04, 3);
  });

  it('faixa muda não quebra', () => {
    expect(analyzeTrack(new Float32Array(100), 1000)).toEqual({ start: 0, end: 0.1, gain: 1 });
  });
});
