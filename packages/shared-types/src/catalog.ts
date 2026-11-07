// Tipos dos dados estáticos (packages/game-data). Mesma forma dos JSON.

export type StateId =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE';

export type Region = 'NORTE' | 'NORDESTE' | 'CENTRO_OESTE' | 'SUDESTE' | 'SUL';

export interface RentTable {
  base: number;
  house1: number;
  house2: number;
  house3: number;
  house4: number;
  hotel: number;
}

export interface StateDefinition {
  id: StateId;
  abbreviation: StateId;
  name: string;
  region: Region;
  colorGroup: string;
  price: number;
  rent: RentTable;
  houseCost: number;
  hotelCost: number;
}

export interface ColorGroup {
  id: string;
  name: string;
  color: string;
}

export type TileType =
  | 'START'
  | 'PROPERTY'
  | 'EVENT'
  | 'REST'
  | 'TAX'
  | 'SAQUE'
  | 'OLYMPICS'
  | 'NATIONAL_TRAVEL';

export interface TileDefinition {
  index: number;
  /** Identificador estável da casa: a sigla nos estados; nas especiais, o ID visual (START, TAX, AIRPORT…). */
  id: string;
  type: TileType;
  stateId?: StateId;
  name?: string;
}

export interface BoardDefinition {
  version: number;
  colorGroups: ColorGroup[];
  tiles: TileDefinition[];
}

export type CardEffect =
  | { type: 'GAIN'; amount: number }
  | { type: 'PAY'; amount: number }
  | { type: 'PAY_PER_BUILDING'; perHouse: number; perHotel: number }
  | { type: 'COLLECT_FROM_EACH'; amount: number }
  | { type: 'MOVE_TO'; tile: string }
  | { type: 'MOVE_BY'; steps: number }
  | { type: 'GO_TO_REST' };

export interface EventCard {
  id: string;
  title: string;
  text: string;
  effect: CardEffect;
}

export type GameMode = 'CLASSIC' | 'QUICK';

export interface RulesConfig {
  version: number;
  players: { min: number; max: number };
  startingCredits: number;
  passStartBonus: number;
  dice: { count: number; faces: number; maxDoublesInRow: number };
  construction: {
    maxHouses: number;
    firstVisitMaxHouses: number;
    requiresFullColorGroup: boolean;
    fullGroupBaseRentMultiplier: number;
  };
  olympics: { hostFee: number; multipliers: number[] };
  /** Descanso (D2): jogadas perdidas; uma dupla libera antes. */
  rest: { turnsLost: number };
  /** Viagem Nacional (D3): taxa para viajar a qualquer estado na jogada seguinte. */
  nationalTravel: { fee: number };
  /** Taxa: valor pago ao banco ao parar na casa; sem saldo, vira dívida. */
  tax: { amount: number };
  /**
   * Tempo para rolar (ou escolher a viagem) e para decidir compra/construção/Olimpíadas; ao acabar, o servidor joga.
   * debtSeconds: prazo para vender e pagar uma dívida; ao acabar, o servidor vende o necessário.
   * automaticSeconds: pausa entre as jogadas feitas pelo servidor para quem está desconectado.
   */
  turnTimers: { rollSeconds: number; decisionSeconds: number; debtSeconds: number; automaticSeconds: number };
  /** Partida em andamento sem ninguém conectado por esse tempo é encerrada sem vencedor. */
  abandonment: { seconds: number };
  modes: Record<GameMode, { roundLimit: number | null }>;
}
