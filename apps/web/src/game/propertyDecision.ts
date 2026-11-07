// Monta o modal de evolução da propriedade (C6) a partir das regras de apoio. A arte só desenha;
// permissão, saldo, preço, aluguel e comando saem daqui. O servidor valida tudo de novo.
import { rules } from '@imperio/game-data';
import type { Command, GameSnapshot, PropertyState, StateDefinition } from '@imperio/shared-types';
import type { PropertyEvolutionStage } from '../property-evolution/PropertyEvolutionPanel';
import { formatCredits } from '../property-card/tileInfo';
import { HOTEL_LEVEL, affordablePurchaseHouses, buildOptions, isMyTurn, playerOf, propertyAt } from './rules';

/** Compra e construção são decisões da vez; consulta é só olhar (fora da vez, ou sem decisão pendente). */
export type DecisionMode = 'purchase' | 'build' | 'view';

export interface PropertyDecision {
  mode: DecisionMode;
  tileIndex: number;
  definition: StateDefinition;
  property?: PropertyState;
  /** Nível real (0–5); -1 quando ninguém comprou o estado. */
  currentLevel: number;
  stages: PropertyEvolutionStage[];
}

const STAGE_LABELS = ['Terreno', 'Casa 1', 'Casa 2', 'Casa 3', 'Casa 4', 'Hotel'] as const;
const LEVELS = [0, 1, 2, 3, 4, 5] as const;
const NO_FUNDS = 'Saldo insuficiente';

/** Fases em que o clique numa casa serve a outra ação (sediar, viajar, vender): fica no painel lateral. */
const BOARD_CHOICE_PHASES = new Set(['AWAITING_OLYMPICS_HOST', 'AWAITING_TRAVEL_DESTINATION', 'AWAITING_DEBT_RESOLUTION']);

/** Decisão pendente do jogador: comprar ou construir onde ele parou. */
export function pendingDecision(snapshot: GameSnapshot, myId: string): PropertyDecision | null {
  if (!isMyTurn(snapshot, myId)) return null;
  const me = playerOf(snapshot, myId);
  if (!me) return null;
  const { definition, property } = propertyAt(snapshot, me.position);
  if (!definition) return null;
  if (snapshot.phase === 'AWAITING_PURCHASE' && !property) {
    return decision('purchase', me.position, definition, undefined, purchaseStages(snapshot, definition, me.credits));
  }
  if (snapshot.phase === 'AWAITING_BUILD' && property?.ownerId === myId) {
    return decision('build', me.position, definition, property, buildStages(snapshot, definition, property, me.credits));
  }
  return null;
}

/** Consulta de um estado clicado; null para casas especiais ou quando o clique serve a outra ação da vez. */
export function viewDecision(snapshot: GameSnapshot, myId: string, tileIndex: number): PropertyDecision | null {
  if (isMyTurn(snapshot, myId) && BOARD_CHOICE_PHASES.has(snapshot.phase ?? '')) return null;
  const { definition, property } = propertyAt(snapshot, tileIndex);
  if (!definition) return null;
  return decision('view', tileIndex, definition, property, viewStages(snapshot, definition, property));
}

function decision(
  mode: DecisionMode,
  tileIndex: number,
  definition: StateDefinition,
  property: PropertyState | undefined,
  stages: PropertyEvolutionStage[],
): PropertyDecision {
  return { mode, tileIndex, definition, property, currentLevel: property ? property.buildingLevel : -1, stages };
}

/** Aluguel de cada nível, com o multiplicador quando o estado é a sede olímpica. */
export function rentAt(snapshot: GameSnapshot, definition: StateDefinition, level: number): number {
  const r = definition.rent;
  const base = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel][level];
  return snapshot.olympics.hostStateId === definition.id ? base * snapshot.olympics.multiplier : base;
}

/** Sede das Olimpíadas: o multiplicador e o aluguel com e sem ele, para o modal explicar o valor. */
export interface OlympicRent {
  multiplier: number;
  edition: number;
  /** Aluguel do nível atual sem as Olimpíadas. */
  baseLabel: string;
  /** Aluguel do nível atual já multiplicado (o que se paga). */
  rentLabel: string;
  /** Frase pronta para o jogador. */
  summary: string;
}

export function olympicRent(snapshot: GameSnapshot, definition: StateDefinition, level: number): OlympicRent | null {
  const { hostStateId, multiplier, edition } = snapshot.olympics;
  if (hostStateId !== definition.id) return null;
  const at = Math.max(0, level);
  const r = definition.rent;
  const baseLabel = formatCredits([r.base, r.house1, r.house2, r.house3, r.house4, r.hotel][at]);
  const rentLabel = formatCredits(rentAt(snapshot, definition, at));
  const stageName = STAGE_LABELS[at].toLowerCase();
  return {
    multiplier,
    edition,
    baseLabel,
    rentLabel,
    summary: `🔥 Sede das Olimpíadas: aluguel ×${multiplier}. Com ${stageName}, ${baseLabel} vira ${rentLabel}.`,
  };
}

function stage(snapshot: GameSnapshot, definition: StateDefinition, level: (typeof LEVELS)[number], status: PropertyEvolutionStage['status'], note?: string): PropertyEvolutionStage {
  return { level, label: STAGE_LABELS[level], rentLabel: formatCredits(rentAt(snapshot, definition, level)), ...(snapshot.olympics.hostStateId === definition.id ? { baseRentLabel: formatCredits([definition.rent.base, definition.rent.house1, definition.rent.house2, definition.rent.house3, definition.rent.house4, definition.rent.hotel][level]) } : {}), status, ...(note ? { note } : {}) };
}

/** Na compra: terreno ou terreno com 1 a 3 casas, até onde o saldo paga. Casa 4 e hotel ficam para outras visitas. */
function purchaseStages(snapshot: GameSnapshot, definition: StateDefinition, credits: number): PropertyEvolutionStage[] {
  const firstVisit = rules.construction.firstVisitMaxHouses;
  const affordable = definition.price <= credits ? affordablePurchaseHouses(definition, credits) : -1;
  return LEVELS.map((level) => {
    if (level <= affordable) return stage(snapshot, definition, level, 'available');
    if (level <= firstVisit) return stage(snapshot, definition, level, 'locked', NO_FUNDS);
    return stage(snapshot, definition, level, 'locked', level === HOTEL_LEVEL ? 'Depois da Casa 4, em outra visita' : 'Em uma próxima visita');
  });
}

/** Na construção: o que o motor libera nesta visita (D4), limitado pelo saldo. */
function buildStages(snapshot: GameSnapshot, definition: StateDefinition, property: PropertyState, credits: number): PropertyEvolutionStage[] {
  const current = property.buildingLevel;
  const options = buildOptions(property);
  return LEVELS.map((level) => {
    if (level < current) return stage(snapshot, definition, level, 'complete');
    if (level === current) return stage(snapshot, definition, level, 'current');
    if (level === HOTEL_LEVEL) {
      if (!options.hotel) return stage(snapshot, definition, level, 'locked', 'Depois da Casa 4, em outra visita');
      return definition.hotelCost <= credits ? stage(snapshot, definition, level, 'available') : stage(snapshot, definition, level, 'locked', NO_FUNDS);
    }
    if (level - current > options.houses) return stage(snapshot, definition, level, 'locked', 'Em uma próxima visita');
    return (level - current) * definition.houseCost <= credits
      ? stage(snapshot, definition, level, 'available')
      : stage(snapshot, definition, level, 'locked', NO_FUNDS);
  });
}

/** Consulta: concluídas e atual marcadas; as demais aparecem sem escolha (o host esconde o cadeado). */
function viewStages(snapshot: GameSnapshot, definition: StateDefinition, property: PropertyState | undefined): PropertyEvolutionStage[] {
  const current = property ? property.buildingLevel : -1;
  return LEVELS.map((level) => {
    if (level < current) return stage(snapshot, definition, level, 'complete');
    if (level === current) return stage(snapshot, definition, level, 'current');
    return stage(snapshot, definition, level, 'locked');
  });
}

/** Seleção inicial: a etapa disponível mais próxima do nível atual (terreno, na compra). */
export function defaultSelection(decision: PropertyDecision): number | null {
  if (decision.mode === 'view') return null;
  return decision.stages.find((s) => s.status === 'available')?.level ?? null;
}

/**
 * Converte o nível final escolhido no comando: na compra o nível é o número de casas; na construção,
 * a diferença para o nível atual; o hotel tem comando próprio. Null se a etapa não está disponível.
 */
export function commandFor(decision: PropertyDecision, targetLevel: number): Command | null {
  if (decision.mode === 'view') return null;
  if (decision.stages.find((s) => s.level === targetLevel)?.status !== 'available') return null;
  if (decision.mode === 'purchase') return { type: 'BUY_PROPERTY', houses: targetLevel };
  if (targetLevel === HOTEL_LEVEL) return { type: 'BUILD_HOTEL' };
  return { type: 'BUILD', houses: targetLevel - decision.currentLevel };
}

/** O "×" do modal da vez recusa: não comprar / não construir. */
export function refuseCommand(decision: PropertyDecision): Command | null {
  if (decision.mode === 'purchase') return { type: 'DECLINE_PURCHASE' };
  if (decision.mode === 'build') return { type: 'SKIP_BUILD' };
  return null;
}

/** Quanto custa chegar ao nível escolhido nesta decisão. */
export function costFor(decision: PropertyDecision, targetLevel: number): number {
  const { definition } = decision;
  if (decision.mode === 'purchase') return definition.price + targetLevel * definition.houseCost;
  if (targetLevel === HOTEL_LEVEL) return definition.hotelCost;
  return (targetLevel - decision.currentLevel) * definition.houseCost;
}

export function actionLabel(decision: PropertyDecision, targetLevel: number | null): string {
  if (decision.mode === 'view') return 'SOMENTE CONSULTA';
  if (targetLevel === null) return decision.mode === 'purchase' ? 'SEM SALDO PARA COMPRAR' : 'NADA A CONSTRUIR AGORA';
  if (decision.mode === 'purchase') return targetLevel === 0 ? 'COMPRAR TERRENO' : `COMPRAR COM ${housesText(targetLevel)}`;
  if (targetLevel === HOTEL_LEVEL) return 'CONSTRUIR HOTEL';
  return `CONSTRUIR ${housesText(targetLevel - decision.currentLevel)}`;
}

const housesText = (n: number) => (n === 1 ? '1 CASA' : `${n} CASAS`);
