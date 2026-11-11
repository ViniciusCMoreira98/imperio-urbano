// Estado da partida recebido do servidor (somente leitura no cliente) e canal para enviar comandos.
import { create } from 'zustand';
import { board } from '@imperio/game-data';
import type { Command, DomainEvent, GameSnapshot, ServerMessage } from '@imperio/shared-types';
import { type CardShow, cardsFromEvents } from '../game/eventCards';
import { type MoneyHold, moneyFromEvents } from '../game/heldMoney';
import { type PawnMove, movesFromEvents } from '../game/moves';
import type { ConnectionStatus } from '../net/gameSocket';

export const LOG_LIMIT = 40;
/** Movimentos guardados para os personagens consumirem (os antigos já foram animados). */
export const MOVES_LIMIT = 30;
/** Cartas guardadas para a tela mostrar (as antigas já apareceram). */
export const CARDS_LIMIT = 10;

/** Lance recebido ao vivo (não vem de snapshot): os dados 3D animam até esse resultado oficial. */
export interface LiveRoll {
  /** Versão do evento DICE_ROLLED: identifica o lance. */
  id: number;
  playerId: string;
  dice: [number, number];
}

export interface ServerState {
  snapshot: GameSnapshot | null;
  log: DomainEvent[];
  rejection: string | null;
  /** Instante local (ms) em que o servidor jogará pelo jogador da vez; null sem prazo. */
  turnDeadline: number | null;
  /** Movimentos a animar, em ordem de versão (ids crescentes). */
  moves: PawnMove[];
  /** Cartas de evento reveladas ao vivo, em ordem de versão (a tela mostra uma de cada vez). */
  cards: CardShow[];
  /** Saldos que só aparecem quando o personagem chega (aluguel, taxa, saque, bônus do Início). */
  money: MoneyHold[];
  /** Versão da partida até onde os eventos foram recebidos em sequência; null antes do 1º snapshot. */
  eventsVersion: number | null;
  /**
   * Muda quando a sequência de eventos se perde (reconexão, lote faltando): os personagens
   * abandonam as animações e vão direto para a posição do snapshot.
   */
  resync: number;
  /** Último lance recebido em sequência; null no 1º snapshot e na ressincronia (dados já parados). */
  roll: LiveRoll | null;
  /** Motivo de a partida não poder continuar (ex.: tabuleiro antigo); null enquanto pode. */
  unavailable: string | null;
}

/**
 * Aplica uma mensagem do servidor. Snapshots mais antigos que o atual são ignorados.
 * O prazo chega como "tempo restante" e vira um instante local, imune à diferença de relógios.
 *
 * Eventos: o servidor manda EVENTS com a versão final do lote (cada evento soma 1) e logo depois o
 * SNAPSHOT da mesma versão. Lote já visto é ignorado; lote que não emenda na versão anterior, ou
 * snapshot à frente dos eventos, quebra a sequência e pede ressincronia em vez de animar.
 */
export function reduceServerMessage(state: ServerState, message: ServerMessage, now = Date.now()): ServerState {
  switch (message.kind) {
    case 'SNAPSHOT': {
      if (state.snapshot && message.snapshot.version < state.snapshot.version) return state;
      const left = message.snapshot.turnTimeLeftMs;
      const next = { ...state, snapshot: message.snapshot, turnDeadline: left === null ? null : now + left };
      if (state.eventsVersion !== null && message.snapshot.version <= state.eventsVersion) return next;
      // Primeiro snapshot ou eventos perdidos (ex.: reconexão): sem animar, direto para o estado oficial.
      return { ...next, moves: [], cards: [], money: [], roll: null, eventsVersion: message.snapshot.version, resync: state.resync + 1 };
    }
    case 'EVENTS': {
      if (state.eventsVersion !== null && message.version <= state.eventsVersion) return state;
      const firstVersion = message.version - message.events.length + 1;
      const base = { ...state, log: [...state.log, ...message.events].slice(-LOG_LIMIT), rejection: null, eventsVersion: message.version };
      if (state.eventsVersion !== null && firstVersion !== state.eventsVersion + 1) {
        return { ...base, moves: [], cards: [], money: [], roll: null, resync: state.resync + 1 };
      }
      const moves = movesFromEvents(message.events, firstVersion, board.tiles.length);
      const cards = cardsFromEvents(message.events, firstVersion);
      // Último movimento de cada jogador já recebido: compra e construção esperam o personagem pousar.
      const earlierMoves = new Map<string, number>();
      for (const m of state.moves) earlierMoves.set(m.playerId, Math.max(earlierMoves.get(m.playerId) ?? -1, m.id));
      const money = moneyFromEvents(message.events, firstVersion, earlierMoves);
      return {
        ...base,
        moves: [...state.moves, ...moves].slice(-MOVES_LIMIT),
        cards: cards.length ? [...state.cards, ...cards].slice(-CARDS_LIMIT) : state.cards,
        money: money.length ? [...state.money, ...money].slice(-MOVES_LIMIT) : state.money,
        roll: lastRoll(message.events, firstVersion) ?? state.roll };
    }
    case 'COMMAND_REJECTED':
      return { ...state, rejection: message.reason };
    case 'GAME_UNAVAILABLE':
      return { ...state, unavailable: message.reason };
  }
}

function lastRoll(events: DomainEvent[], firstVersion: number): LiveRoll | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.type === 'DICE_ROLLED') return { id: firstVersion + i, playerId: event.playerId, dice: [event.dice.first, event.dice.second] };
  }
  return null;
}

interface GameStoreState extends ServerState {
  connection: ConnectionStatus;
  /** Definido pela tela da partida enquanto a conexão existe. */
  send: (command: Command) => boolean;
  receive: (message: ServerMessage) => void;
  setConnection: (status: ConnectionStatus) => void;
  setSender: (send: (command: Command) => boolean) => void;
  clearRejection: () => void;
  reset: () => void;
}

const empty: ServerState = { snapshot: null, log: [], rejection: null, turnDeadline: null, moves: [], cards: [], money: [], eventsVersion: null, resync: 0, roll: null, unavailable: null };

export const useGameStore = create<GameStoreState>()((set) => ({
  ...empty,
  connection: 'closed',
  send: () => false,
  receive: (message) => set((s) => reduceServerMessage(s, message)),
  setConnection: (connection) => set({ connection }),
  setSender: (send) => set({ send }),
  clearRejection: () => set({ rejection: null }),
  reset: () => set({ ...empty, connection: 'closed', send: () => false }),
}));

// Gancho de teste, só em desenvolvimento: o E2E lê o estado oficial que este navegador recebeu.
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __imperioGame?: typeof useGameStore }).__imperioGame = useGameStore;
