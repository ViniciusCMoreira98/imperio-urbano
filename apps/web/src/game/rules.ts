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

/** Valor investido em construções no estado (casas e hotel). */
export function investedIn(definition: StateDefinition, property: PropertyState): number {
  const houses = Math.min(property.buildingLevel, rules.construction.maxHouses) * definition.houseCost;
  return houses + (property.buildingLevel === HOTEL_LEVEL ? definition.hotelCost : 0);
}

/** Quanto o banco paga (50%, D10): uma construção (casa ou hotel) e o estado com tudo o que tem. */
/** Quanto o banco paga pelo estado inteiro (terreno + construções) para pagar uma dívida: mesmo cálculo do servidor. */
export function stateSaleValue(definition: StateDefinition, property: PropertyState): number {
  return Math.floor(((definition.price + investedIn(definition, property)) * rules.debtSale.refundPercent) / 100);
}

/** Patrimônio (fim do Rápido e dos modos por tempo): saldo + preço + construções + aluguel atual de cada estado. */
export function netWorth(snapshot: GameSnapshot, playerId: string): number {
  const player = playerOf(snapshot, playerId);
  if (!player) return 0;
  return snapshot.properties
    .filter((p) => p.ownerId === playerId)
    .reduce((total, p) => {
      const definition = statesById.get(p.stateId);
      return definition ? total + definition.price + investedIn(definition, p) + currentRent(snapshot, definition) : total;
    }, player.credits);
}

/** Jogadores ativos com o maior patrimônio (coroa no painel); vazio se todos empatam. */
export function leaders(snapshot: GameSnapshot): string[] {
  const active = snapshot.players.filter((p) => !p.bankrupt);
  if (active.length < 2) return active.map((p) => p.id);
  const worth = new Map(active.map((p) => [p.id, netWorth(snapshot, p.id)]));
  const best = Math.max(...worth.values());
  const top = active.filter((p) => worth.get(p.id) === best).map((p) => p.id);
  return top.length === active.length ? [] : top;
}

/** Aluguel atual como o servidor calcula (sem o bônus de grupo, desligado nas regras atuais). */
export function currentRent(snapshot: GameSnapshot, definition: StateDefinition): number {
  const property = snapshot.properties.find((p) => p.stateId === definition.id);
  if (!property || property.blackoutVisitsLeft > 0) return 0; // apagão: sem aluguel
  const r = definition.rent;
  const base = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel][property.buildingLevel];
  return snapshot.olympics.hostStateId === definition.id ? base * snapshot.olympics.multiplier : base;
}
