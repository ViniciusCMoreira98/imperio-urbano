// Movimentos dos personagens derivados dos eventos oficiais (PLAYER_MOVED), sem contrato novo.
// A animação só representa o que o servidor decidiu: a posição final é sempre a do snapshot.
import type { DomainEvent } from '@imperio/shared-types';
import { movePath } from '../board/movement';

/** Acima disso não é lance de dados (2d6 anda no máximo 12): vira um salto direto. */
export const MAX_WALK_STEPS = 12;

export interface PawnMove {
  /** Versão do evento PLAYER_MOVED na partida (única e crescente): identifica o movimento. */
  id: number;
  playerId: string;
  from: number;
  to: number;
  /** walk: um salto por casa; travel: viagem do Aeroporto, casa a casa e acelerada; jump: salto único (Descanso, recuo, avanço longo). */
  kind: 'walk' | 'travel' | 'jump';
  /** Versão do lance (DICE_ROLLED) que gerou o movimento; o peão espera esses dados pararem. Null: sem lance. */
  rollId: number | null;
  /** Versão da carta de evento (EVENT_CARD_DRAWN) que gerou o movimento; o peão espera a carta sumir. Null: sem carta. */
  cardId: number | null;
}

/**
 * Movimentos de um lote de EVENTS. `firstVersion` é a versão do primeiro evento do lote (cada evento
 * soma 1 à versão da partida). Uma viagem (TRAVEL_CHOSEN) faz o movimento seguinte do jogador ser salto.
 */
export function movesFromEvents(events: DomainEvent[], firstVersion: number, tileCount: number): PawnMove[] {
  const traveling = new Set<string>();
  const rolled = new Map<string, number>();
  const carded = new Map<string, number>();
  const moves: PawnMove[] = [];
  events.forEach((event, i) => {
    if (event.type === 'TRAVEL_CHOSEN') traveling.add(event.playerId);
    if (event.type === 'DICE_ROLLED') rolled.set(event.playerId, firstVersion + i);
    if (event.type === 'EVENT_CARD_DRAWN') carded.set(event.playerId, firstVersion + i);
    if (event.type !== 'PLAYER_MOVED') return;
    const steps = (event.to - event.from + tileCount) % tileCount;
    const flew = traveling.delete(event.playerId);
    const walk = !event.sentToRest && !flew && steps > 0 && steps <= MAX_WALK_STEPS;
    // Viagem do Aeroporto: anda casa a casa (passa pelo Início e recebe o bônus), só que mais rápido.
    const travel = flew && !event.sentToRest && steps > 0;
    const rollId = rolled.get(event.playerId) ?? null;
    rolled.delete(event.playerId);
    const cardId = carded.get(event.playerId) ?? null;
    carded.delete(event.playerId);
    moves.push({ id: firstVersion + i, playerId: event.playerId, from: event.from, to: event.to, kind: travel ? 'travel' : walk ? 'walk' : 'jump', rollId, cardId });
  });
  return moves;
}

/** Casas onde o personagem pousa, em ordem (sem a de origem). */
export function hopTiles(move: PawnMove, tileCount: number): number[] {
  if (move.kind === 'jump') return [move.to];
  return movePath(move.from, (move.to - move.from + tileCount) % tileCount, tileCount);
}

/** Fila maior que isso (aba em segundo plano, rede atrasada): vira um salto direto ao último destino. */
export const MAX_QUEUED = 2;

/**
 * Acrescenta à fila de um personagem os movimentos novos dele (id maior que o último tratado), em ordem.
 * Atrasado demais para animar tudo, troca a fila por um salto único da casa mostrada ao último destino.
 */
export function enqueueMoves(
  queue: PawnMove[],
  moves: PawnMove[],
  playerId: string,
  handled: number,
  shownTile: number,
): { queue: PawnMove[]; handled: number } {
  const next = [...queue];
  let last = handled;
  for (const move of moves) {
    if (move.playerId !== playerId || move.id <= last) continue;
    last = move.id;
    next.push(move);
  }
  if (next.length > MAX_QUEUED) {
    const final = next[next.length - 1];
    return { queue: [{ ...final, from: shownTile, kind: 'jump', rollId: null, cardId: null }], handled: last };
  }
  return { queue: next, handled: last };
}
