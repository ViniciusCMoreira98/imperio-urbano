import { useEffect } from 'react';
import { BoardScene } from '../board/BoardScene';
import { isMyTurn, playerOf } from '../game/rules';
import { ActionBar } from '../hud/ActionBar';
import { EventLog } from '../hud/EventLog';
import { PlayersPanel } from '../hud/PlayersPanel';
import { PropertyPanel } from '../hud/PropertyPanel';
import { ViewControls } from '../hud/ViewControls';
import { GameConnection } from '../net/gameSocket';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { Button } from '../ui/ui';

/** Partida conectada ao servidor: o tabuleiro e os painéis só refletem o snapshot recebido. */
export function GameScreen() {
  const session = useAppStore((s) => s.session)!;
  const gameId = useAppStore((s) => s.gameId)!;
  const leave = useAppStore((s) => s.leave);
  const snapshot = useGameStore((s) => s.snapshot);
  const connection = useGameStore((s) => s.connection);

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

  // Ao parar num estado para comprar ou construir, abre o painel dele (sem mover a câmera).
  const me = snapshot ? playerOf(snapshot, session.playerId) : undefined;
  const phase = snapshot?.phase;
  const myTurn = snapshot ? isMyTurn(snapshot, session.playerId) : false;
  useEffect(() => {
    if (myTurn && me && (phase === 'AWAITING_PURCHASE' || phase === 'AWAITING_BUILD')) {
      useViewStore.getState().selectTile(me.position);
    }
  }, [myTurn, phase, me?.position]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full overflow-hidden">
      <BoardScene />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
        <Button className="px-3 py-1 text-sm" onClick={leave}>
          ← Menu
        </Button>
        <p className="rounded-lg bg-slate-900/80 px-3 py-1 text-sm text-white/80">
          Sala <span className="font-mono font-bold tracking-widest text-white">{snapshot?.inviteCode ?? '……'}</span>
          {snapshot && <> · Rodada {snapshot.round}</>}
          {snapshot?.mode === 'QUICK' && ' de 15'}
          {connection !== 'open' && <span className="text-amber-300"> · reconectando…</span>}
        </p>
        <span className="w-20" />
      </header>

      {!snapshot ? (
        <p className="absolute inset-0 flex items-center justify-center text-white/80">Conectando à partida…</p>
      ) : (
        <>
          <aside className="absolute left-3 top-16">
            <PlayersPanel myId={session.playerId} />
          </aside>
          <aside className="absolute right-3 top-16">
            <PropertyPanel myId={session.playerId} />
          </aside>
          <div className="absolute bottom-3 left-3">
            <EventLog />
          </div>
          <footer className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div className="pointer-events-auto">
              <ActionBar myId={session.playerId} />
            </div>
          </footer>
          <div className="absolute bottom-3 right-3">
            <ViewControls />
          </div>
          {snapshot.status === 'FINISHED' && <FinishedOverlay onLeave={leave} />}
        </>
      )}
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
