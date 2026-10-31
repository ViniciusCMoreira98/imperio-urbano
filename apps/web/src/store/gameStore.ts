// Estado da partida recebido do servidor (somente leitura no cliente) e canal para enviar comandos.
import { create } from 'zustand';
import type { Command, DomainEvent, GameSnapshot, ServerMessage } from '@imperio/shared-types';
import type { ConnectionStatus } from '../net/gameSocket';

export const LOG_LIMIT = 40;

export interface ServerState {
  snapshot: GameSnapshot | null;
  log: DomainEvent[];
  rejection: string | null;
  /** Instante local (ms) em que o servidor jogará pelo jogador da vez; null sem prazo. */
  turnDeadline: number | null;
}

/**
 * Aplica uma mensagem do servidor. Snapshots mais antigos que o atual são ignorados.
 * O prazo chega como "tempo restante" e vira um instante local, imune à diferença de relógios.
 */
export function reduceServerMessage(state: ServerState, message: ServerMessage, now = Date.now()): ServerState {
  switch (message.kind) {
    case 'SNAPSHOT': {
      if (state.snapshot && message.snapshot.version < state.snapshot.version) return state;
      const left = message.snapshot.turnTimeLeftMs;
      return { ...state, snapshot: message.snapshot, turnDeadline: left === null ? null : now + left };
    }
    case 'EVENTS':
      return { ...state, log: [...state.log, ...message.events].slice(-LOG_LIMIT), rejection: null };
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

const empty: ServerState = { snapshot: null, log: [], rejection: null, turnDeadline: null };

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
