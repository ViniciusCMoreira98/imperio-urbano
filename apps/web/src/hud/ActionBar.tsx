import { useEffect, useState } from 'react';
import type { Command } from '@imperio/shared-types';
import { isMyTurn } from '../game/rules';
import { shouldOfferRestChoice } from '../game/restChoice';
import { playSound } from '../audio/audio';
import { formatCredits } from '../property-card/tileInfo';
import { useCardBusy } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { useShownTurnPlayerId } from '../store/shownTurn';
import { usePawnStore } from '../store/pawnStore';
import { useViewStore } from '../store/viewStore';
import { Button } from '../ui/ui';
import { DiceFaces } from './DiceFaces';
import { TurnBadge } from './TurnBadge';
import { RoundSeal } from './RoundSeal';


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
  // A vez mostrada só passa ao próximo jogador quando a mesa termina a jogada anterior.
  const turnId = useShownTurnPlayerId();
  if (!snapshot) return null;

  const mine = isMyTurn(snapshot, myId);
  const phase = snapshot.phase;
  const current = snapshot.players.find((p) => p.id === turnId);
  // Descanso de quem está jogando nesta tela: quantas jogadas ainda perde (a dupla libera antes).
  const me = snapshot.players.find((p) => p.id === myId);
  const restLeft = snapshot.status === 'IN_PROGRESS' && me && !me.bankrupt ? me.skipTurns : 0;
  const offline = connection !== 'open';
  const act = (command: Command) => send(command);
  const tableBusy = diceRolling || tableMoving || cardBusy;
  const choosingRest = turnId === myId && shouldOfferRestChoice(snapshot, myId);

  return (
    <div className="hud-action-shell relative flex w-full flex-col items-center gap-1.5 sm:w-auto">
      <RoundSeal snapshot={snapshot} />

      <div className="hud-action-tray flex w-full flex-wrap items-center justify-center gap-2 hud-panel rounded-2xl px-2 py-1.5 sm:w-auto sm:px-3 sm:py-2">
        <TurnBadge myId={myId}/>
        <DiceFaces values={diceRolling ? null : snapshot.lastDice} />
        {/* Em telas largas a vez aparece no quadro "Turno de" (TurnBadge); aqui só nas menores. */}
        <span className={`text-sm text-white/90 ${snapshot.status === 'FINISHED' ? '' : 'hidden'}`}>
          {snapshot.status === 'FINISHED' ? (
            'Partida encerrada'
          ) : turnId === myId ? (
            <strong className="text-amber-300">Sua vez</strong>
          ) : (
            <>
              Vez de <strong>{current?.nickname}</strong>
            </>
          )}
        </span>
        {restLeft > 0 && !choosingRest && <RestChip turns={restLeft} />}
        {/* Some enquanto a mesa mostra a jogada: o prazo do servidor só começa a correr quando ela termina. */}
        {snapshot.status === 'IN_PROGRESS' && deadline !== null && !tableBusy && !choosingRest && <Countdown deadline={deadline} warn={mine} />}

        {/* Rolar os dados fica no miolo do tabuleiro (RollButton, 08/11/2026). */}
        {/* Comprar/construir e recusar ("×") ficam no modal de evolução da propriedade; vender para pagar dívida, no aviso de venda (DebtSalePrompt). */}
        {mine && phase === 'AWAITING_END_TURN' && (
          <Button variant="confirm" disabled={offline || cardBusy} onClick={() => act({ type: 'END_TURN' })}>
            Passar a vez
          </Button>
        )}
      </div>

      {/* Por cima, fora do fluxo: uma mensagem larga não pode alargar a coluna da barra (ela é medida
          para reservar o espaço do tabuleiro, que encolhia no celular). */}
      {rejection && (
        <p
          role="alert"
          className="pointer-events-none absolute bottom-full right-0 z-40 mb-2 w-max max-w-[min(24rem,calc(100vw-1rem))] rounded-lg bg-rose-900/90 px-3 py-1 text-right text-sm text-rose-100 shadow-lg"
        >
          {rejection}
        </p>
      )}
    </div>
  );
}

/** Botão de rolar no miolo do tabuleiro (BoardCenterSlot): só na própria vez, depois que a mesa para. */
export function RollButton({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const diceRolling = useDiceStore((s) => s.rolling);
  const tableMoving = usePawnStore((s) => Object.keys(s.moving).length > 0);
  const cardBusy = useCardBusy();
  const turnId = useShownTurnPlayerId();
  if (!snapshot || snapshot.status !== 'IN_PROGRESS') return null;
  const phase = snapshot.phase;
  const canRoll = isMyTurn(snapshot, myId) && turnId === myId && (phase === 'AWAITING_ROLL' || phase === 'AWAITING_TRAVEL_DESTINATION');
  if (!canRoll) return null;
  // No Descanso, o modal da vez (RestTurnChoice) já tem o próprio "Rolar dados".
  if (shouldOfferRestChoice(snapshot, myId)) return null;
  // Some enquanto a mesa mostra a jogada anterior: os dados rolam no miolo, embaixo do botão.
  if (diceRolling || tableMoving || cardBusy) return null;
  return (
    <Button
      variant="roll"
      className="board-roll-button font-black tracking-wide"
      disabled={offline}
      onClick={() => send({ type: 'ROLL_DICE' })}
    >
      ROLAR DADOS
    </Button>
  );
}

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
