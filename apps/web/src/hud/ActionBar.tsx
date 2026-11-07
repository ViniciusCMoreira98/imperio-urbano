import { useEffect, useState } from 'react';
import { board, rules, states } from '@imperio/game-data';
import type { Command } from '@imperio/shared-types';
import { HOTEL_LEVEL, isMyTurn, saleRefunds } from '../game/rules';
import { playSound } from '../audio/audio';
import { formatCredits } from '../property-card/tileInfo';
import { useCardBusy } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';
import { useViewStore } from '../store/viewStore';
import { Button } from '../ui/ui';
import { DiceFaces } from './DiceFaces';
import { TurnBadge } from './TurnBadge';
import { RoundSeal } from './RoundSeal';
import { ItemTray } from './ItemTray';

const statesById = new Map(states.map((s) => [s.id, s]));

/** Barra inferior enxuta: dados, de quem é a vez, prazo e apenas as ações possíveis agora. */
export function ActionBar({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const rejection = useGameStore((s) => s.rejection);
  const connection = useGameStore((s) => s.connection);
  const deadline = useGameStore((s) => s.turnDeadline);
  // Enquanto os dados 3D rolam, a barra não antecipa o resultado.
  const diceRolling = useDiceStore((s) => s.rolling);
  // Ninguém rola enquanto a jogada anterior ainda aparece na mesa (dados ou personagens andando).
  const tableMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  // Carta de evento na tela também segura o prazo e a passagem da vez até sumir.
  const cardBusy = useCardBusy();
  const [selling, setSelling] = useState(false);
  const inDebt = !!snapshot && isMyTurn(snapshot, myId) && snapshot.phase === 'AWAITING_DEBT_RESOLUTION';
  // A venda só existe para pagar dívida: abre sozinha quando a dívida aparece e fecha quando é quitada.
  useEffect(() => setSelling(inDebt), [inDebt]);
  if (!snapshot) return null;

  const mine = isMyTurn(snapshot, myId);
  const phase = snapshot.phase;
  const current = snapshot.players.find((p) => p.id === snapshot.currentPlayerId);
  // Descanso de quem está jogando nesta tela: quantas jogadas ainda perde (a dupla libera antes).
  const me = snapshot.players.find((p) => p.id === myId);
  const restLeft = snapshot.status === 'IN_PROGRESS' && me && !me.bankrupt ? me.skipTurns : 0;
  const offline = connection !== 'open';
  const act = (command: Command) => send(command);
  const canRoll = mine && (phase === 'AWAITING_ROLL' || phase === 'AWAITING_TRAVEL_DESTINATION');
  const tableBusy = diceRolling || tableMoving || cardBusy;

  return (
    <div className="hud-action-shell relative flex w-full flex-col items-center gap-1.5 sm:w-auto">
      <RoundSeal snapshot={snapshot} />
      {selling && inDebt && <SellDrawer myId={myId} onClose={() => setSelling(false)} />}
      <ItemTray snapshot={snapshot} myId={myId} busy={tableBusy} />

      <div className="hud-action-tray flex w-full flex-wrap items-center justify-center gap-2 hud-panel rounded-2xl px-2 py-1.5 sm:w-auto sm:px-3 sm:py-2">
        <TurnBadge myId={myId}/>
        <DiceFaces values={diceRolling ? null : snapshot.lastDice} />
        {/* Em telas largas a vez aparece no quadro "Turno de" (TurnBadge); aqui só nas menores. */}
        <span className={`text-sm text-white/90 ${snapshot.status === 'FINISHED' ? '' : 'hidden'}`}>
          {snapshot.status === 'FINISHED' ? (
            'Partida encerrada'
          ) : mine ? (
            <strong className="text-amber-300">Sua vez</strong>
          ) : (
            <>
              Vez de <strong>{current?.nickname}</strong>
            </>
          )}
        </span>
        {restLeft > 0 && <RestChip turns={restLeft} />}
        {/* Some enquanto a mesa mostra a jogada: o prazo do servidor só começa a correr quando ela termina. */}
        {snapshot.status === 'IN_PROGRESS' && deadline !== null && !tableBusy && <Countdown deadline={deadline} warn={mine} />}

        {canRoll && (
          <Button variant="roll" className="px-6 py-2.5 text-base font-black tracking-wide sm:text-lg" disabled={offline || tableBusy} title={tableBusy ? 'Aguarde a jogada anterior terminar na mesa' : undefined} onClick={() => act({ type: 'ROLL_DICE' })}>
            ROLAR DADOS
          </Button>
        )}
        {/* Comprar/construir e recusar ("×") ficam no modal de evolução da propriedade. */}
        {inDebt && (
          <>
            {snapshot.properties.some((p) => p.ownerId === myId) && (
              <Button variant="primary" disabled={offline} onClick={() => setSelling((open) => !open)}>
                💲 Vender
              </Button>
            )}
            <Button variant="danger" disabled={offline} onClick={() => act({ type: 'DECLARE_BANKRUPTCY' })}>
              Falência
            </Button>
          </>
        )}
        {mine && phase === 'AWAITING_END_TURN' && (
          <Button variant="confirm" disabled={offline || cardBusy} onClick={() => act({ type: 'END_TURN' })}>
            Passar a vez
          </Button>
        )}
      </div>

      {rejection && (
        <p role="alert" className="rounded-lg bg-rose-900/85 px-3 py-1 text-sm text-rose-100">
          {rejection}
        </p>
      )}
    </div>
  );
}
/** Pagar a dívida vendendo ao banco: quanto falta e os bens do jogador. */
function SellDrawer({ myId, onClose }: { myId: string; onClose: () => void }) {
  const snapshot = useGameStore((s) => s.snapshot)!;
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const selectTile = useViewStore((s) => s.selectTile);
  const list = snapshot.properties.filter((p) => p.ownerId === myId);
  const debt = snapshot.pendingDebt;
  const credits = snapshot.players.find((p) => p.id === myId)?.credits ?? 0;
  const missing = debt ? Math.max(0, debt.amount - credits) : 0;
  const creditor = snapshot.players.find((p) => p.id === debt?.creditorId)?.nickname ?? (debt?.toTaxPool ? 'a Taxa (vai para o Saque)' : 'o banco');
  return (
    <div className="absolute bottom-full mb-2 w-[min(20rem,calc(100vw-1.5rem))] hud-panel rounded-2xl p-3 text-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-bold text-white">Pagar dívida</h3>
        <button type="button" className="px-2 text-lg" aria-label="Fechar" onClick={onClose}>
          ×
        </button>
      </div>
      {debt && (
        <p className="mb-2 text-white/85">
          Você deve <strong>{formatCredits(debt.amount)}</strong> a {creditor}. Faltam{' '}
          <strong className="text-rose-300">{formatCredits(missing)}</strong>.
        </p>
      )}
      <p className="mb-2 text-xs text-amber-200">
        Sem decisão em {rules.turnTimers.debtSeconds} s, o banco vende sozinho até pagar, do bem mais barato ao mais caro
        (as casas de um estado saem antes dele). Se nem assim der, é falência.
      </p>
      <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {list.map((property) => {
          const definition = statesById.get(property.stateId)!;
          const refunds = saleRefunds(definition, property);
          const tile = board.tiles.find((t) => t.stateId === property.stateId)!;
          return (
            <li key={property.stateId} className="rounded-lg bg-slate-800 p-2">
              <button type="button" className="font-bold text-white hover:underline" onClick={() => selectTile(tile.index)}>
                {definition.name}
              </button>
              <span className="text-white/60"> · {property.buildingLevel === HOTEL_LEVEL ? 'hotel' : `${property.buildingLevel} casa(s)`}</span>
              <div className="mt-1 flex gap-2">
                {refunds.building !== null && (
                  <Button className="flex-1 px-2 py-1 text-xs" disabled={offline} onClick={() => send({ type: 'SELL_BUILDING', stateId: property.stateId })}>
                    {property.buildingLevel === HOTEL_LEVEL ? 'Hotel' : 'Casa'} +{formatCredits(refunds.building)}
                  </Button>
                )}
                <Button className="flex-1 px-2 py-1 text-xs" disabled={offline} onClick={() => send({ type: 'SELL_PROPERTY', stateId: property.stateId })}>
                  Estado +{formatCredits(refunds.state)}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Segundos até o servidor jogar pelo jogador da vez (rolar, recusar a compra...). */
/** Aviso do Descanso para o próprio jogador: rodadas que ainda perde e como sair antes. */
export function RestChip({ turns }: { turns: number }) {
  const text = turns === 1 ? 'falta 1 rodada' : `faltam ${turns} rodadas`;
  return (
    <span
      className="hud-rest-chip"
      role="status"
      title={`Você está no Descanso: ${text} para voltar a andar. Tirando dupla nos dados, sai na hora.`}
    >
      <span aria-hidden="true">😴</span> Descanso: <strong>{text}</strong>
      <small> · dupla sai antes</small>
    </span>
  );
}

/** Faltando 3 s na própria vez, o alerta toca (a faixa dura quase 2 s, então uma vez basta). */
const WARN_SECONDS = 3;

export function Countdown({ deadline, warn = false }: { deadline: number; warn?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  useEffect(() => {
    if (warn && seconds === WARN_SECONDS) playSound('tempoAcabando');
  }, [warn, seconds]);
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-sm font-bold tabular-nums ${seconds <= 5 ? 'bg-rose-600 text-white' : 'bg-white/15 text-white'}`}
      title="Ao acabar o tempo, o servidor joga a ação padrão: rola os dados, recusa a compra ou vende para pagar a dívida."
      aria-label={`${seconds} segundos restantes`}
    >
      ⏱ {seconds}s
    </span>
  );
}
