import { useEffect } from 'react';
import { GameSounds } from '../audio/GameSounds';
import { GameBoard } from '../board/GameBoard';
import { ActionBar } from '../hud/ActionBar';
import { BoardChoicePrompt } from '../hud/BoardChoicePrompt';
import { CardReveal } from '../hud/CardReveal';
import { DevDicePanel } from '../hud/DevDicePanel';
import { EventLog } from '../hud/EventLog';
import { PlayersPanel } from '../hud/PlayersPanel';
import { PropertyDecisionDialog } from '../hud/PropertyDecisionDialog';
import { PropertyPanel } from '../hud/PropertyPanel';
import { SoundControl } from '../hud/SoundControl';
import { RotateDeviceNotice, useAskToRotate } from '../hud/RotateDeviceNotice';
import { GameConnection } from '../net/gameSocket';
import { formatCredits } from '../property-card/tileInfo';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { Button } from '../ui/ui';

/** Partida conectada ao servidor: o tabuleiro e os painéis só refletem o snapshot recebido. */
export function GameScreen() {
  const session = useAppStore((s) => s.session)!;
  const gameId = useAppStore((s) => s.gameId)!;
  const leave = useAppStore((s) => s.leave);
  const snapshot = useGameStore((s) => s.snapshot);
  const connection = useGameStore((s) => s.connection);
  const unavailable = useGameStore((s) => s.unavailable);
  // Celular em pé: a partida fica coberta e inerte (sem toque nem foco), mas segue conectada.
  const askToRotate = useAskToRotate();

  useEffect(() => {
    const store = useGameStore.getState();
    const connectionToGame = new GameConnection(gameId, session.token, {
      onMessage: store.receive,
      onStatus: store.setConnection,
    });
    store.setSender((command) => {
      const version = useGameStore.getState().snapshot?.version ?? 0;
      return connectionToGame.send(command, version);
    });
    connectionToGame.connect();
    return () => {
      connectionToGame.close();
      useGameStore.getState().reset();
    };
  }, [gameId, session.token]);

  return (
    <>
      <GameSounds myId={session.playerId} />
      <div className="game-viewport relative h-full w-full overflow-hidden" inert={askToRotate} aria-hidden={askToRotate || undefined}>
        {/* Canvas de mesa em toda a janela; HUD flutua sobre o cenário. */}
        <div className="game-hud-board absolute inset-0">
          <GameBoard taxPoolLabel={typeof snapshot?.taxPool === 'number' ? formatCredits(snapshot.taxPool) : null} />
        </div>

        <header className="game-hud-header absolute right-0 top-0 flex items-center justify-end gap-2 p-2 sm:p-3">
          <Button variant="neon" className="rounded-full px-3 py-1 text-sm" onClick={leave} aria-label="Voltar ao menu">
            ←<span className="hidden sm:inline"> Menu</span>
          </Button>
          <SoundControl />
          {/* Só no build de desenvolvimento; some do build de produção. */}
          {import.meta.env.DEV && snapshot && <DevDicePanel />}
          {connection !== 'open' && !unavailable && (
            <p className="rounded-lg bg-slate-900/80 px-3 py-1 text-sm text-amber-300">reconectando…</p>
          )}
        </header>

        {unavailable ? (
          <UnavailableOverlay reason={unavailable} onLeave={leave} />
        ) : !snapshot ? (
          <p className="absolute inset-0 flex items-center justify-center text-white/80">Conectando à partida…</p>
        ) : (
          <>
            {/* Jogadores centralizados; histórico independente sobre a mesa. */}
            <aside className="game-hud-players absolute inset-x-2 top-12 flex flex-col gap-2">
              <PlayersPanel myId={session.playerId} />
            </aside>
            {/* Carta do estado: folha acima da barra no celular; coluna à direita na tela larga. */}
            <aside className="game-hud-property absolute inset-x-2 bottom-20 max-h-[45%] overflow-y-auto">
              <PropertyPanel myId={session.playerId} />
            </aside>
            <aside className="game-hud-history"><EventLog /></aside>
            <footer className="game-hud-actions pointer-events-none absolute inset-x-2 bottom-2 flex justify-center sm:bottom-3">
              <div className="pointer-events-auto w-full sm:w-auto">
                <ActionBar myId={session.playerId} />
              </div>
            </footer>
            <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center">
              <CardReveal />
            </div>
            {/* Sediar ou viajar: aviso no meio da tela e casas destacadas no tabuleiro. */}
            <BoardChoicePrompt myId={session.playerId} />
            {/* Compra/construção da vez e consulta de estados: modal sobre o tabuleiro. */}
            <PropertyDecisionDialog myId={session.playerId} />
            {snapshot.status === 'FINISHED' && <FinishedOverlay onLeave={leave} />}
          </>
        )}
      </div>
      {askToRotate && <RotateDeviceNotice />}
    </>
  );
}

function UnavailableOverlay({ reason, onLeave }: { reason: string; onLeave: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
      <div role="alert" className="max-w-sm rounded-2xl bg-slate-900 p-6 text-center shadow-2xl">
        <h2 className="text-xl font-extrabold text-amber-300">Partida indisponível</h2>
        <p className="mt-2 text-white">{reason}</p>
        <Button variant="primary" className="mt-4" onClick={onLeave}>
          Voltar ao menu
        </Button>
      </div>
    </div>
  );
}

function FinishedOverlay({ onLeave }: { onLeave: () => void }) {
  const snapshot = useGameStore((s) => s.snapshot)!;
  const names = snapshot.winnerIds.map((id) => snapshot.players.find((p) => p.id === id)?.nickname ?? id);
  // Sem vencedores = partida encerrada por abandono.
  const abandoned = names.length === 0;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-slate-900 p-6 text-center shadow-2xl">
        <p className="text-5xl">{abandoned ? '🚪' : '🏆'}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-amber-300">{abandoned ? 'Partida encerrada' : 'Fim de jogo!'}</h2>
        <p className="mt-1 text-white">
          {abandoned ? 'Todos saíram e ninguém voltou a tempo. Não houve vencedor.' : `${names.join(' e ')} venceu.`}
        </p>
        <Button variant="primary" className="mt-4" onClick={onLeave}>
          Voltar ao menu
        </Button>
      </div>
    </div>
  );
}
