import { useEffect, useState } from 'react';
import type { Command, TurnPhase } from '@imperio/shared-types';
import { rules } from '@imperio/game-data';
import { isMyTurn } from '../game/rules';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { Button } from '../ui/ui';

/** Dica da fase para quem está jogando; as escolhas de casa ficam no painel do estado. */
const PHASE_HINTS: Partial<Record<TurnPhase, string>> = {
  AWAITING_PURCHASE: 'Compre o estado (com até 3 casas) no painel à direita, ou recuse. Sem decisão, a compra é perdida.',
  AWAITING_BUILD: 'Você voltou ao seu estado: construa no painel à direita, ou dispense.',
  AWAITING_OLYMPICS_HOST: `Clique num estado seu no tabuleiro para sediar as Olimpíadas (${formatCredits(rules.olympics.hostFee)}).`,
  AWAITING_TRAVEL_DESTINATION: `Clique numa casa do tabuleiro para viajar (${formatCredits(rules.nationalTravel.fee)}), ou role os dados.`,
  AWAITING_DEBT_RESOLUTION: 'Venda construções ou estados no painel do estado, ou declare falência.',
};

/** Barra inferior: dados, de quem é a vez e as ações que não dependem de escolher uma casa. */
export function ActionBar({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const rejection = useGameStore((s) => s.rejection);
  const connection = useGameStore((s) => s.connection);
  const deadline = useGameStore((s) => s.turnDeadline);
  if (!snapshot) return null;

  const mine = isMyTurn(snapshot, myId);
  const phase = snapshot.phase;
  const current = snapshot.players.find((p) => p.id === snapshot.currentPlayerId);
  const act = (command: Command) => send(command);
  const offline = connection !== 'open';

  return (
    <div className="flex max-w-3xl flex-col items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Dice values={snapshot.lastDice} />
        <p className="text-sm text-white/90">
          {snapshot.status === 'FINISHED' ? 'Partida encerrada.' : mine ? <strong className="text-amber-300">Sua vez!</strong> : <>Vez de <strong>{current?.nickname}</strong></>}
          {mine && snapshot.pendingDebt && <> · Dívida: {formatCredits(snapshot.pendingDebt.amount)}</>}
        </p>
        {snapshot.status === 'IN_PROGRESS' && deadline !== null && <Countdown deadline={deadline} />}
        {mine && (phase === 'AWAITING_ROLL' || phase === 'AWAITING_TRAVEL_DESTINATION') && (
          <Button variant="danger" className="text-lg" disabled={offline} onClick={() => act({ type: 'ROLL_DICE' })}>
            ROLAR DADOS
          </Button>
        )}
        {mine && phase === 'AWAITING_PURCHASE' && (
          <Button disabled={offline} onClick={() => act({ type: 'DECLINE_PURCHASE' })}>Não comprar</Button>
        )}
        {mine && phase === 'AWAITING_BUILD' && (
          <Button disabled={offline} onClick={() => act({ type: 'SKIP_BUILD' })}>Não construir</Button>
        )}
        {mine && phase === 'AWAITING_OLYMPICS_HOST' && (
          <Button disabled={offline} onClick={() => act({ type: 'SKIP_OLYMPICS' })}>Não sediar</Button>
        )}
        {mine && phase === 'AWAITING_DEBT_RESOLUTION' && (
          <Button variant="danger" disabled={offline} onClick={() => act({ type: 'DECLARE_BANKRUPTCY' })}>
            Declarar falência
          </Button>
        )}
        {mine && phase === 'AWAITING_END_TURN' && (
          <Button variant="confirm" disabled={offline} onClick={() => act({ type: 'END_TURN' })}>
            Passar a vez
          </Button>
        )}
      </div>
      {mine && phase && PHASE_HINTS[phase] && <p className="text-xs text-white/70">{PHASE_HINTS[phase]}</p>}
      {rejection && (
        <p role="alert" className="text-sm text-rose-300">
          {rejection}
        </p>
      )}
    </div>
  );
}

/** Segundos até o servidor jogar pelo jogador da vez (rolar, recusar a compra...). */
function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-sm font-bold tabular-nums ${seconds <= 5 ? 'bg-rose-600 text-white' : 'bg-white/15 text-white'}`}
      title="Ao acabar o tempo, o servidor joga a ação padrão: rola os dados ou recusa a compra."
      aria-label={`${seconds} segundos restantes`}
    >
      ⏱ {seconds}s
    </span>
  );
}

const PIPS: Record<number, string> = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };

function Dice({ values }: { values: [number, number] | null }) {
  if (!values) return null;
  return (
    <span className="text-4xl leading-none text-white" aria-label={`Dados: ${values[0]} e ${values[1]}`}>
      {PIPS[values[0]]}
      {PIPS[values[1]]}
    </span>
  );
}
