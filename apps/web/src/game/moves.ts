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
  /** walk: um salto por casa; jump: salto único (Descanso, viagem, recuo, avanço longo). */
  kind: 'walk' | 'jump';
}

/**
 * Movimentos de um lote de EVENTS. `firstVersion` é a versão do primeiro evento do lote (cada evento
 * soma 1 à versão da partida). Uma viagem (TRAVEL_CHOSEN) faz o movimento seguinte do jogador ser salto.
 */
export function movesFromEvents(events: DomainEvent[], firstVersion: number, tileCount: number): PawnMove[] {
  const traveling = new Set<string>();
  const moves: PawnMove[] = [];
  events.forEach((event, i) => {
    if (event.type === 'TRAVEL_CHOSEN') traveling.add(event.playerId);
    if (event.type !== 'PLAYER_MOVED') return;
    const steps = (event.to - event.from + tileCount) % tileCount;
    const flew = traveling.delete(event.playerId);
    const walk = !event.sentToRest && !flew && steps > 0 && steps <= MAX_WALK_STEPS;
    moves.push({ id: firstVersion + i, playerId: event.playerId, from: event.from, to: event.to, kind: walk ? 'walk' : 'jump' });
  });
  return moves;
}

/** Casas onde o personagem pousa, em ordem (sem a de origem). */
export function hopTiles(move: PawnMove, tileCount: number): number[] {
  if (move.kind === 'jump') return [move.to];
  return movePath(move.from, (move.to - move.from + tileCount) % tileCount, tileCount);
}
