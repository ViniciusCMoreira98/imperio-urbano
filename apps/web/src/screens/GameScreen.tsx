import { useEffect, useRef } from 'react';
import { GameSounds } from '../audio/GameSounds';
import { GameBoard } from '../board/GameBoard';
import { ActionBar } from '../hud/ActionBar';
import { BoardChoicePrompt } from '../hud/BoardChoicePrompt';
import { CardReveal } from '../hud/CardReveal';
import { DevDicePanel } from '../hud/DevDicePanel';
import { EventLog } from '../hud/EventLog';
import { TableNotices } from '../hud/TableNotices';
import { ItemDrawer } from '../hud/ItemTray';
import { GameOverScreen } from '../hud/GameOverScreen';
import { PlayersPanel } from '../hud/PlayersPanel';
import { PropertyDecisionDialog } from '../hud/PropertyDecisionDialog';
import { PropertyPanel } from '../hud/PropertyPanel';
import { SettingsButton } from '../hud/SettingsButton';
import { RotateDeviceNotice, useAskToRotate } from '../hud/RotateDeviceNotice';
import { GameConnection } from '../net/gameSocket';
import { formatCredits } from '../property-card/tileInfo';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { useShownTaxPool } from '../store/shownTaxPool';
import { Button } from '../ui/ui';
import { useHudLayout } from './useHudLayout';

/** Partida conectada ao servidor: o tabuleiro e os painéis só refletem o snapshot recebido. */
export function GameScreen() {
  const session = useAppStore((s) => s.session)!;
  const gameId = useAppStore((s) => s.gameId)!;
  const leave = useAppStore((s) => s.leave);
  const snapshot = useGameStore((s) => s.snapshot);
  const taxPool = useShownTaxPool();
  const connection = useGameStore((s) => s.connection);
  const unavailable = useGameStore((s) => s.unavailable);
  // Celular em pé: a partida fica coberta e inerte (sem toque nem foco), mas segue conectada.
  const askToRotate = useAskToRotate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const playersRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLElement>(null);
  const insets = useHudLayout(viewportRef, headerRef, playersRef, actionsRef, !!snapshot && !askToRotate);

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
      <div ref={viewportRef} className="game-viewport relative h-full w-full overflow-hidden" inert={askToRotate} aria-hidden={askToRotate || undefined}>
        {/* Canvas de mesa em toda a janela; HUD flutua sobre o cenário. */}
        <div className="game-hud-board absolute inset-0">
          <GameBoard framing={insets?.left!==undefined&&insets?.right!==undefined?'mobile-landscape':'standard'} insets={insets} taxPoolLabel={taxPool === null ? null : formatCredits(taxPool)} />
        </div>

        <header ref={headerRef} className="game-hud-header absolute right-0 top-0 flex items-center justify-end gap-2 p-2 sm:p-3">
          <Button variant="neon" className="rounded-full px-3 py-1 text-sm" onClick={leave} aria-label="Voltar ao menu">
            ←<span className="hidden sm:inline"> Menu</span>
          </Button>
          <SettingsButton inGame />
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
            <aside ref={playersRef} className="game-hud-players absolute inset-x-2 top-12 flex flex-col gap-2">
              <PlayersPanel myId={session.playerId} />
            </aside>
            {/* Carta do estado: folha acima da barra no celular; coluna à direita na tela larga. */}
            <aside className="game-hud-property absolute inset-x-2 bottom-20 max-h-[45%] overflow-y-auto">
              <PropertyPanel myId={session.playerId} />
            </aside>
            <aside className="game-hud-history">
              <ItemDrawer myId={session.playerId} />
              <EventLog />
            </aside>
            <footer ref={actionsRef} className="game-hud-actions pointer-events-none absolute inset-x-2 bottom-2 flex justify-center sm:bottom-3">
              <div className="pointer-events-auto w-full sm:w-auto">
                <ActionBar myId={session.playerId} />
              </div>
            </footer>
            {/* Carta de evento no meio da tela, sem bloquear o tabuleiro; some sozinha. */}
            <CardReveal />
            {/* Sediar ou viajar: aviso no meio da tela e casas destacadas no tabuleiro. */}
            <BoardChoicePrompt myId={session.playerId} />
            {/* Avisos rápidos: Aluguel Zero, falta de saldo, dados iguais. */}
            <TableNotices myId={session.playerId} />
            {/* Compra/construção da vez e consulta de estados: modal sobre o tabuleiro. */}
            <PropertyDecisionDialog myId={session.playerId} />
            {snapshot.status === 'FINISHED' && <GameOverScreen myId={session.playerId} token={session.token} gameId={gameId} onLeave={leave} />}
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
