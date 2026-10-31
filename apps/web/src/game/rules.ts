// Apoio à interface: decide quais botões mostrar. O servidor valida tudo de novo.
import { board, rules, states } from '@imperio/game-data';
import type { GameSnapshot, PlayerState, PropertyState, StateDefinition } from '@imperio/shared-types';

const statesById = new Map(states.map((s) => [s.id, s]));

export const HOTEL_LEVEL = 5;

export function playerOf(snapshot: GameSnapshot, playerId: string | undefined): PlayerState | undefined {
  return snapshot.players.find((p) => p.id === playerId);
}

export function isMyTurn(snapshot: GameSnapshot, playerId: string | undefined): boolean {
  return snapshot.status === 'IN_PROGRESS' && snapshot.currentPlayerId === playerId;
}

export function propertyAt(snapshot: GameSnapshot, tileIndex: number): {
  definition?: StateDefinition;
  property?: PropertyState;
} {
  const stateId = board.tiles[tileIndex]?.stateId;
  if (!stateId) return {};
  return { definition: statesById.get(stateId), property: snapshot.properties.find((p) => p.stateId === stateId) };
}

/** Mesma regra de etapas por visita do motor (D4). */
export function buildOptions(property: PropertyState): { houses: number; hotel: boolean } {
  const { maxHouses, firstVisitMaxHouses } = rules.construction;
  const level = property.buildingLevel;
  const earlierVisit = property.levelReachedAtVisit < property.ownerVisits;
  let houses = 0;
  if (level < firstVisitMaxHouses) houses = firstVisitMaxHouses - level;
  else if (level < maxHouses && earlierVisit) houses = 1;
  return { houses, hotel: level === maxHouses && earlierVisit };
}

/** Quantas casas cabem no saldo ao comprar (0 a 3). */
export function affordablePurchaseHouses(definition: StateDefinition, credits: number): number {
  const max = rules.construction.firstVisitMaxHouses;
  let houses = 0;
  while (houses < max && definition.price + (houses + 1) * definition.houseCost <= credits) houses++;
  return houses;
}

/** Aluguel atual como o servidor calcula (sem o bônus de grupo, desligado nas regras atuais). */
export function currentRent(snapshot: GameSnapshot, definition: StateDefinition): number {
  const property = snapshot.properties.find((p) => p.stateId === definition.id);
  if (!property) return 0;
  const r = definition.rent;
  const base = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel][property.buildingLevel];
  return snapshot.olympics.hostStateId === definition.id ? base * snapshot.olympics.multiplier : base;
}
