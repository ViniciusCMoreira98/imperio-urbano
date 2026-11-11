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

/** Baralho brasileiro (06/11/2026). Incêndio, Apagão e Escolha da sede pedem um estado no tabuleiro. */
export type CardEffect =
  | { type: 'GAIN'; amount: number }
  | { type: 'PAY'; amount: number }
  /** Incêndio: estado de oponente volta ao banco, sem construções e sem reembolso. */
  | { type: 'BURN_PROPERTY' }
  /** Vai até a sede atual das Olimpíadas (bônus ao passar pelo Início); sem sede, sem efeito. */
  | { type: 'VISIT_OLYMPICS_HOST' }
  /** Escolhe, sem taxa, qualquer estado com dono para sediar a próxima edição. */
  | { type: 'CHOOSE_OLYMPICS_HOST' }
  /** Apagão: estado de oponente sem aluguel até o dono passar (ou parar) nele `visits` vezes (11/11/2026). */
  | { type: 'BLACKOUT'; visits: number }
  /** Descanso merecido: vai direto ao Descanso (sem bônus do Início). */
  | { type: 'GO_TO_REST' }
  /** Passe Livre: item guardado para sair do Descanso sem perder a vez. */
  | { type: 'GRANT_REST_PASS' }
  /** Aluguel Zero: item gasto sozinho na próxima propriedade adversária com aluguel. */
  | { type: 'GRANT_RENT_WAIVER' };

export interface EventCard {
  id: string;
  title: string;
  text: string;
  effect: CardEffect;
  /** Cópias no baralho (padrão 1); menos cópias = carta mais rara. */
  copies?: number;
}

/** Por tempo: TIMED_25 e TIMED_60 (25 min e 1 h); ao fim do relógio vence o maior patrimônio. */
export type GameMode = 'CLASSIC' | 'QUICK' | 'TIMED_25' | 'TIMED_60';

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
  /** Taxa: este percentual do patrimônio de quem para na casa, arredondado para baixo (10/11/2026). */
  tax: { equityPercent: number };
  /** Venda ao banco para pagar dívida: estado inteiro (terreno + construções) por este percentual. */
  debtSale: { refundPercent: number };
  /**
   * Tempo para rolar (ou escolher a viagem) e para decidir compra/construção/Olimpíadas; ao acabar, o servidor joga.
   * debtSeconds: prazo para vender e pagar uma dívida; ao acabar, o servidor vende o necessário.
   * automaticSeconds: pausa entre as jogadas feitas pelo servidor para quem está desconectado.
   */
  turnTimers: { rollSeconds: number; decisionSeconds: number; debtSeconds: number; automaticSeconds: number };
  /** Partida em andamento sem ninguém conectado por esse tempo é encerrada sem vencedor. */
  abandonment: { seconds: number; botGameSeconds: number };
  /**
   * Moedas fora da partida: apostas permitidas ao criar a sala (o vencedor leva aposta × jogadores),
   * saldo inicial do convidado e recarga diária grátis de quem ficou abaixo de dailyRefill.below.
   */
  economy: { stakes: number[]; guestStartingCoins: number; dailyRefill: { below: number; amount: number } };
  modes: Record<GameMode, { roundLimit: number | null; timeLimitMinutes: number | null }>;
}
