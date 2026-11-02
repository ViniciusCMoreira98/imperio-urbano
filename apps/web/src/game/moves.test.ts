import { describe, expect, it } from 'vitest';
import type { DomainEvent, GameSnapshot } from '@imperio/shared-types';
import { type ServerState, reduceServerMessage } from '../store/gameStore';
import { type PawnMove, enqueueMoves, hopTiles, movesFromEvents } from './moves';

const N = 36;
const moved = (playerId: string, from: number, to: number, extra: Partial<{ sentToRest: boolean; startBonus: number }> = {}): DomainEvent => ({
  type: 'PLAYER_MOVED',
  playerId,
  from,
  to,
  startBonus: extra.startBonus ?? 0,
  sentToRest: extra.sentToRest ?? false,
});
const rolled = (playerId: string): DomainEvent => ({ type: 'DICE_ROLLED', playerId, dice: { first: 2, second: 3 } });

describe('movimentos a partir dos eventos', () => {
  it('lance de dados vira um salto por casa, com id igual à versão do evento', () => {
    const [move] = movesFromEvents([rolled('ana'), moved('ana', 3, 8)], 41, N);
    expect(move).toEqual({ id: 42, playerId: 'ana', from: 3, to: 8, kind: 'walk' });
    expect(hopTiles(move, N)).toEqual([4, 5, 6, 7, 8]);
  });

  it('atravessa o Início e os cantos casa a casa', () => {
    const [move] = movesFromEvents([moved('ana', 33, 2, { startBonus: 200 })], 1, N);
    expect(hopTiles(move, N)).toEqual([34, 35, 0, 1, 2]);
    const [corner] = movesFromEvents([moved('bia', 7, 11)], 1, N);
    expect(hopTiles(corner, N)).toEqual([8, 9, 10, 11]);
  });

  it('Descanso, viagem, recuo e avanço longo viram salto único', () => {
    const moves = movesFromEvents(
      [
        moved('ana', 6, 18, { sentToRest: true }),
        { type: 'TRAVEL_CHOSEN', playerId: 'bia', tileIndex: 25, fee: 50 },
        moved('bia', 20, 25),
        moved('caio', 5, 2),
        moved('dani', 5, 26),
      ],
      10,
      N,
    );
    expect(moves.map((m) => m.kind)).toEqual(['jump', 'jump', 'jump', 'jump']);
    expect(hopTiles(moves[1], N)).toEqual([25]);
  });

  it('carta em sequência ao lance gera dois movimentos em ordem', () => {
    const moves = movesFromEvents([rolled('ana'), moved('ana', 0, 5), { type: 'EVENT_CARD_DRAWN', playerId: 'ana', cardId: 'carona' }, moved('ana', 5, 8)], 1, N);
    expect(moves.map((m) => [m.id, m.from, m.to, m.kind])).toEqual([
      [2, 0, 5, 'walk'],
      [4, 5, 8, 'walk'],
    ]);
  });
});

describe('fila de movimentos no store', () => {
  const empty: ServerState = { snapshot: null, log: [], rejection: null, turnDeadline: null, moves: [], eventsVersion: null, resync: 0, unavailable: null };
  const snapshot = (version: number) => ({ version, turnTimeLeftMs: null }) as GameSnapshot;
  const start = reduceServerMessage(empty, { kind: 'SNAPSHOT', snapshot: snapshot(10) });

  it('o primeiro snapshot define a base e posiciona sem animar', () => {
    expect(start.eventsVersion).toBe(10);
    expect(start.resync).toBe(1);
    expect(start.moves).toEqual([]);
  });

  it('eventos em sequência entram na fila; o snapshot da mesma versão não ressincroniza', () => {
    const afterEvents = reduceServerMessage(start, { kind: 'EVENTS', version: 12, events: [rolled('ana'), moved('ana', 0, 5)] });
    expect(afterEvents.moves).toEqual([{ id: 12, playerId: 'ana', from: 0, to: 5, kind: 'walk' }]);
    const afterSnapshot = reduceServerMessage(afterEvents, { kind: 'SNAPSHOT', snapshot: snapshot(12) });
    expect(afterSnapshot.resync).toBe(start.resync);
    expect(afterSnapshot.moves).toHaveLength(1);
  });

  it('lote repetido ou antigo é ignorado (sem movimento duplicado)', () => {
    const once = reduceServerMessage(start, { kind: 'EVENTS', version: 12, events: [rolled('ana'), moved('ana', 0, 5)] });
    const twice = reduceServerMessage(once, { kind: 'EVENTS', version: 12, events: [rolled('ana'), moved('ana', 0, 5)] });
    expect(twice).toBe(once);
    expect(reduceServerMessage(once, { kind: 'EVENTS', version: 11, events: [rolled('ana')] })).toBe(once);
  });

  it('lote que não emenda na versão anterior pede ressincronia em vez de animar', () => {
    const gap = reduceServerMessage(start, { kind: 'EVENTS', version: 20, events: [moved('ana', 0, 5)] });
    expect(gap.moves).toEqual([]);
    expect(gap.resync).toBe(start.resync + 1);
    expect(gap.eventsVersion).toBe(20);
  });

  it('snapshot à frente dos eventos (reconexão) descarta a fila e ressincroniza', () => {
    const pending = reduceServerMessage(start, { kind: 'EVENTS', version: 12, events: [rolled('ana'), moved('ana', 0, 5)] });
    const reconnected = reduceServerMessage(pending, { kind: 'SNAPSHOT', snapshot: snapshot(30) });
    expect(reconnected.moves).toEqual([]);
    expect(reconnected.resync).toBe(pending.resync + 1);
    expect(reconnected.eventsVersion).toBe(30);
  });
});

describe('fila de um personagem', () => {
  const move = (id: number, playerId: string, from: number, to: number): PawnMove => ({ id, playerId, from, to, kind: 'walk' });

  it('pega só os movimentos novos do próprio jogador, em ordem', () => {
    const all = [move(5, 'ana', 0, 4), move(6, 'bia', 0, 3), move(9, 'ana', 4, 9)];
    const { queue, handled } = enqueueMoves([], all, 'ana', 4, 0);
    expect(queue.map((m) => m.id)).toEqual([5, 9]);
    expect(handled).toBe(9);
  });

  it('não repete movimentos já tratados (mesma lista recebida de novo)', () => {
    const all = [move(5, 'ana', 0, 4)];
    const first = enqueueMoves([], all, 'ana', -1, 0);
    const again = enqueueMoves(first.queue, all, 'ana', first.handled, 0);
    expect(again.queue).toHaveLength(1);
  });

  it('atrasado demais: um salto direto da casa mostrada ao último destino', () => {
    const all = [move(1, 'ana', 0, 4), move(3, 'ana', 4, 9), move(5, 'ana', 9, 15)];
    const { queue, handled } = enqueueMoves([], all, 'ana', -1, 0);
    expect(queue).toEqual([{ id: 5, playerId: 'ana', from: 0, to: 15, kind: 'jump' }]);
    expect(handled).toBe(5);
  });
});
