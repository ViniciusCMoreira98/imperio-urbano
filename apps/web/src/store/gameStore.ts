// Estado da partida recebido do servidor (somente leitura no cliente) e canal para enviar comandos.
import { create } from 'zustand';
import { board } from '@imperio/game-data';
import type { Command, DomainEvent, GameSnapshot, ServerMessage } from '@imperio/shared-types';
import { type PawnMove, movesFromEvents } from '../game/moves';
import type { ConnectionStatus } from '../net/gameSocket';

export const LOG_LIMIT = 40;
/** Movimentos guardados para os personagens consumirem (os antigos já foram animados). */
export const MOVES_LIMIT = 30;

export interface ServerState {
  snapshot: GameSnapshot | null;
  log: DomainEvent[];
  rejection: string | null;
  /** Instante local (ms) em que o servidor jogará pelo jogador da vez; null sem prazo. */
  turnDeadline: number | null;
  /** Movimentos a animar, em ordem de versão (ids crescentes). */
  moves: PawnMove[];
  /** Versão da partida até onde os eventos foram recebidos em sequência; null antes do 1º snapshot. */
  eventsVersion: number | null;
  /**
   * Muda quando a sequência de eventos se perde (reconexão, lote faltando): os personagens
   * abandonam as animações e vão direto para a posição do snapshot.
   */
  resync: number;
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
      return { ...next, moves: [], eventsVersion: message.snapshot.version, resync: state.resync + 1 };
    }
    case 'EVENTS': {
      if (state.eventsVersion !== null && message.version <= state.eventsVersion) return state;
      const firstVersion = message.version - message.events.length + 1;
      const base = { ...state, log: [...state.log, ...message.events].slice(-LOG_LIMIT), rejection: null, eventsVersion: message.version };
      if (state.eventsVersion !== null && firstVersion !== state.eventsVersion + 1) {
        return { ...base, moves: [], resync: state.resync + 1 };
      }
      const moves = movesFromEvents(message.events, firstVersion, board.tiles.length);
      return { ...base, moves: [...state.moves, ...moves].slice(-MOVES_LIMIT) };
    }
    case 'COMMAND_REJECTED':
      return { ...state, rejection: message.reason };
  }
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

const empty: ServerState = { snapshot: null, log: [], rejection: null, turnDeadline: null, moves: [], eventsVersion: null, resync: 0 };

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
