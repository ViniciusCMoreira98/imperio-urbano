// Conexão WebSocket da partida, com reconexão automática. Envia só intenções; o estado vem do servidor.
import type { Command, CommandEnvelope, ServerMessage } from '@imperio/shared-types';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

interface Handlers {
  onMessage: (message: ServerMessage) => void;
  onStatus: (status: ConnectionStatus) => void;
}

const RETRY_DELAYS_MS = [500, 1000, 2000, 4000];

export class GameConnection {
  private socket: WebSocket | null = null;
  private attempts = 0;
  private closedByUs = false;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly gameId: string,
    private readonly token: string,
    private readonly handlers: Handlers,
  ) {}

  connect() {
    this.closedByUs = false;
    this.handlers.onStatus('connecting');
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${scheme}://${location.host}/ws/games/${this.gameId}?token=${encodeURIComponent(this.token)}`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.attempts = 0;
      this.handlers.onStatus('open');
    };
    socket.onmessage = (event) => {
      this.handlers.onMessage(JSON.parse(event.data as string) as ServerMessage);
    };
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.handlers.onStatus('closed');
      if (!this.closedByUs) this.scheduleRetry();
    };
  }

  /** Devolve falso se a conexão não está aberta (o botão pode avisar o jogador). */
  send(command: Command, expectedVersion: number): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    const envelope: CommandEnvelope = { commandId: crypto.randomUUID(), expectedVersion, command };
    this.socket.send(JSON.stringify(envelope));
    return true;
  }

  close() {
    this.closedByUs = true;
    clearTimeout(this.retryTimer);
    this.socket?.close();
    this.socket = null;
  }

  private scheduleRetry() {
    const delay = RETRY_DELAYS_MS[Math.min(this.attempts, RETRY_DELAYS_MS.length - 1)];
    this.attempts++;
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }
}
