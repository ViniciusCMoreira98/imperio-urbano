// Tipos dos dados estáticos (packages/game-data). Mesma forma dos JSON.

export type StateId =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

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
  | 'VISIT'
  | 'OLYMPICS'
  | 'NATIONAL_TRAVEL';

export interface TileDefinition {
  index: number;
  type: TileType;
  stateId?: StateId;
  name?: string;
}

export interface BoardDefinition {
  version: number;
  tilesPerSide: number;
  colorGroups: ColorGroup[];
  tiles: TileDefinition[];
}

export type GameMode = 'CLASSIC' | 'QUICK';

export interface RulesConfig {
  version: number;
  players: { min: number; max: number };
  startingCredits: number;
  passStartBonus: number;
  dice: { count: number; faces: number };
  construction: {
    maxHouses: number;
    firstVisitMaxHouses: number;
    requiresFullColorGroup: boolean;
    fullGroupBaseRentMultiplier: number;
  };
  olympics: { hostFee: number; multipliers: number[] };
  modes: Record<GameMode, { roundLimit: number | null }>;
}
