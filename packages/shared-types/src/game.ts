// Estado da partida como o servidor o publica (snapshot). O cliente apenas lê.
import type { GameMode, StateId } from './catalog';

export type AvatarId = 'avatar-1' | 'avatar-2' | 'avatar-3' | 'avatar-4' | 'avatar-5';
export type PawnColor = 'VERDE' | 'AMARELO' | 'AZUL' | 'VERMELHO' | 'ROXO' | 'LARANJA';

export type GameStatus = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';

/** Fase do turno atual (ver docs/03-dominio-e-fluxo.md). */
export type TurnPhase =
  | 'AWAITING_ROLL'
  | 'AWAITING_PURCHASE'
  | 'AWAITING_BUILD'
  | 'AWAITING_OLYMPICS_HOST'
  | 'AWAITING_TRAVEL_DESTINATION'
  | 'AWAITING_DEBT_RESOLUTION'
  /** Carta de evento revelada: o jogador escolhe um estado no tabuleiro. */
  | 'AWAITING_EVENT_TARGET'
  | 'AWAITING_END_TURN';

/** 0–3: primeira etapa; 4: quarta casa; 5: hotel. */
export type BuildingLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface PlayerState {
  id: string;
  nickname: string;
  avatarId: AvatarId;
  pawnColor: PawnColor;
  seat: number;
  credits: number;
  position: number;
  ready: boolean;
  connected: boolean;
  bankrupt: boolean;
  skipTurns: number;
  /** Parou na Viagem Nacional: na próxima jogada pode escolher o destino. */
  travelPending: boolean;
  /** Passe Livre guardados (sair do Descanso sem perder a vez). */
  restPasses: number;
  /** Aluguel Zero guardados (gasto sozinho no próximo aluguel adversário). */
  rentWaivers: number;
  /** Foto de perfil do Google (07/11/2026); ausente ou nula para convidado, que mostra o personagem. */
  photoUrl?: string | null;
}

export interface PropertyState {
  stateId: StateId;
  ownerId: string | null;
  buildingLevel: BuildingLevel;
  /** Visitas do proprietário desde a compra (a compra conta como a 1ª). */
  ownerVisits: number;
  /** Número da visita em que o nível atual foi alcançado; limita uma etapa por visita. */
  levelReachedAtVisit: number;
  /** > 0: apagão (carta de evento), sem aluguel até o dono parar aqui essa quantidade de vezes. */
  blackoutVisitsLeft: number;
}

/** edition 0 e multiplier 1 = nenhuma edição realizada. */
export interface OlympicsState {
  edition: number;
  hostStateId: StateId | null;
  hostPlayerId: string | null;
  multiplier: number;
}

export interface Debt {
  debtorId: string;
  /** null = banco. */
  creditorId: string | null;
  amount: number;
  /** Dívida da casa Taxa: o pagamento vai para o fundo do Saque. */
  toTaxPool: boolean;
}

export interface GameSnapshot {
  gameId: string;
  inviteCode: string;
  mode: GameMode;
  status: GameStatus;
  /** Incrementa a cada evento aplicado; o cliente descarta snapshots antigos. */
  version: number;
  round: number;
  currentPlayerId: string | null;
  phase: TurnPhase | null;
  lastDice: [number, number] | null;
  players: PlayerState[];
  properties: PropertyState[];
  olympics: OlympicsState;
  pendingDebt: Debt | null;
  winnerIds: string[];
  /** Fundo da Taxa: quem parar no Saque leva tudo. */
  taxPool: number;
  /** Carta de evento que espera o jogador da vez escolher um estado; null sem escolha pendente. */
  pendingEventCardId: string | null;
  /** Tempo até o servidor jogar pelo jogador da vez (rolar, recusar compra...); null sem prazo. */
  turnTimeLeftMs: number | null;
  /** Modos por tempo: quanto falta no relógio da partida quando o snapshot saiu; null nos outros modos. */
  gameTimeLeftMs: number | null;
  /** O relógio acabou: a partida encerra ao fim da vez atual. */
  timeUp: boolean;
}
