// Modal de evolução da propriedade (C6): abre sozinho na compra/construção da vez e, fora disso, ao
// clicar num estado, só para consulta. A arte é do Codex (PropertyEvolutionPanel); aqui ficam o
// diálogo, o foco, o prazo e os comandos.
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  type OlympicRent,
  type PropertyDecision,
  actionLabel,
  commandFor,
  costFor,
  defaultSelection,
  olympicRent,
  pendingDecision,
  refuseCommand,
  rentAt,
  viewDecision,
} from '../game/propertyDecision';
import { tileOccupants } from '../game/occupants';
import { playerOf } from '../game/rules';
import { PAWN_COLORS } from '../game/presentation';
import { PlayerPortrait } from './AvatarPortrait';
import { formatCredits } from '../property-card/tileInfo';
import { PropertyEvolutionPanel } from '../property-evolution/PropertyEvolutionPanel';
import { useGameStore } from '../store/gameStore';
import { playSound } from '../audio/audio';
import { usePawnStore } from '../store/pawnStore';
import { useViewStore } from '../store/viewStore';
import { Countdown } from './ActionBar';

export function PropertyDecisionDialog({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const selectedTile = useViewStore((s) => s.selectedTile);
  // A fase muda no servidor antes de o personagem terminar os saltos: a decisão espera o pouso.
  const landed = usePawnStore((s) => !s.moving[myId]);
  const decision = useMemo(() => {
    if (!snapshot) return null;
    const pending = pendingDecision(snapshot, myId);
    if (pending) return landed ? pending : null;
    return selectedTile === null ? null : viewDecision(snapshot, myId, selectedTile);
  }, [snapshot, myId, selectedTile, landed]);
  // A decisão da vez substitui a consulta aberta antes; ao terminar, não reabre a casa antiga.
  const deciding = decision !== null && decision.mode !== 'view';
  useEffect(() => {
    if (deciding) useViewStore.getState().clearSelection();
  }, [deciding]);
  if (!decision) return null;
  // Trocar de modo ou de casa recomeça a seleção e o foco.
  return <DecisionDialog key={`${decision.mode}-${decision.tileIndex}`} decision={decision} myId={myId} />;
}

function DecisionDialog({ decision, myId }: { decision: PropertyDecision; myId: string }) {
  // Cada abertura (a chave muda com o modo e a casa) toca o som da janela.
  useEffect(() => playSound('abrirJanela'), []);
  const snapshot = useGameStore((s) => s.snapshot)!;
  const send = useGameStore((s) => s.send);
  const rejection = useGameStore((s) => s.rejection);
  const clearRejection = useGameStore((s) => s.clearRejection);
  const offline = useGameStore((s) => s.connection !== 'open');
  const deadline = useGameStore((s) => s.turnDeadline);
  const clearSelection = useViewStore((s) => s.clearSelection);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<number | null>(() => defaultSelection(decision));
  // Versão em que o último comando saiu: aguarda até o servidor responder com outro snapshot ou recusar.
  const [sentAt, setSentAt] = useState<number | null>(null);
  const pending = sentAt === snapshot.version && !rejection;

  // Saldo, visitas ou Olimpíadas mudaram: a escolha deixa de valer se a etapa não está mais disponível.
  const stillAvailable = decision.stages.find((s) => s.level === selected)?.status === 'available';
  useEffect(() => {
    if (!stillAvailable) setSelected(defaultSelection(decision));
  }, [stillAvailable, decision]);

  useDialogFocus(dialogRef, decision.mode === 'view' ? clearSelection : undefined);
  const fit = useFitToHeight();

  const decide = decision.mode !== 'view';
  const close = () => {
    const refuse = refuseCommand(decision);
    if (!refuse) return clearSelection();
    clearRejection();
    if (send(refuse)) setSentAt(snapshot.version);
  };
  const confirm = () => {
    if (selected === null) return;
    const command = commandFor(decision, selected);
    if (!command) return;
    clearRejection();
    if (send(command)) setSentAt(snapshot.version);
  };

  const { definition } = decision;
  const owner = playerOf(snapshot, decision.property?.ownerId ?? undefined);
  const me = playerOf(snapshot, myId);
  const target = selected ?? decision.currentLevel;

  // Sede olímpica: os aluguéis do modal já vêm multiplicados; a frase diz por quanto e de quanto era.
  const olympics = olympicRent(snapshot, definition, decision.currentLevel);
  let message: string | undefined;
  if (decide && offline) message = 'Sem conexão com o servidor. Aguarde a reconexão para decidir.';
  // Só a recusa do que saiu deste modal; uma anterior (ex.: rolar fora de hora) não é sobre esta decisão.
  else if (decide && rejection && sentAt !== null) message = rejection;
  else if (decide) {
    const balance = me ? `Seu saldo: ${formatCredits(me.credits)}` : '';
    message = balance || undefined;
  } else message = !decision.property?.ownerId ? `Disponível para compra por ${formatCredits(definition.price)}.` : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-[2px]" onClick={decide ? undefined : clearSelection}>
      <div className="flex min-h-full items-center justify-center px-3 pb-4 pt-8 sm:px-8 sm:pt-10">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${definition.name}: ${decide ? (decision.mode === 'purchase' ? 'comprar' : 'construir') : 'consulta'}`}
          className="relative w-full max-w-[1100px]"
          style={{ height: fit.height }}
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={fit.ref} style={{ transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined, transformOrigin: 'top center' }}>
          {decide && deadline !== null && (
            <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 sm:-top-8">
              <Countdown deadline={deadline} />
            </div>
          )}
          {/* No alto, onde a consulta não tem prazo: no celular deitado embaixo do painel ficava fora da tela. */}
          {!decide && <TileOccupants tileIndex={decision.tileIndex} myId={myId} />}
          <PropertyEvolutionPanel
            stateCode={definition.abbreviation}
            stateName={definition.name}
            mode={decision.mode}
            owner={owner ? {name: `${owner.nickname}${owner.id === myId ? ' (você)' : ''}`,color: PAWN_COLORS[owner.pawnColor].hex,portrait: <PlayerPortrait avatarId={owner.avatarId} photoUrl={owner.photoUrl}/>} : null}
            stages={decision.stages}
            olympics={olympics ? {multiplier: olympics.multiplier, edition: olympics.edition, label: `Sede das Olimpíadas ×${olympics.multiplier}`} : undefined}
            selectedLevel={selected}
            costLabel={decide && selected !== null ? formatCredits(costFor(decision, selected)) : '—'}
            newRentLabel={target >= 0 ? formatCredits(rentAt(snapshot, definition, target)) : '—'}
            actionLabel={actionLabel(decision, selected)}
            actionDisabled={!decide || offline || selected === null}
            pending={pending}
            message={message}
            onSelect={(level) => decide && setSelected(level)}
            onConfirm={confirm}
            onClose={close}
          />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quem está parado na casa, só na consulta (09/11/2026): em casas estreitas os personagens se escondem
 * uns atrás dos outros. Fora do painel do Codex, que pode trazer a lista para dentro da arte depois.
 */
function TileOccupants({ tileIndex, myId }: { tileIndex: number; myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const occupants = snapshot ? tileOccupants(snapshot, tileIndex) : [];
  if (occupants.length === 0) return null;
  return (
    <div className="tile-occupants" role="status" aria-label="Jogadores nesta casa">
      <span className="tile-occupants-label">Nesta casa:</span>
      <ul>
        {occupants.map((p) => (
          <li key={p.id}>
            <span className="tile-occupants-dot" style={{ background: PAWN_COLORS[p.pawnColor].hex }} aria-hidden="true" />
            {p.nickname}
            {p.id === myId && <small> (você)</small>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Espaço vertical do diálogo fora do painel: prazo acima e margem abaixo. */
const DIALOG_CHROME_PX = 56;
const MIN_SCALE = 0.6;

/**
 * O painel fica mais alto que largo nas telas menores; em tela larga (notebook 1366×768) ele encolhe
 * por inteiro para o botão de confirmar caber sem rolar. No celular a rolagem continua.
 */
function useFitToHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ scale: number; height?: number }>({ scale: 1 });
  useLayoutEffect(() => {
    const inner = ref.current;
    if (!inner) return;
    const update = () => {
      // transform não muda offsetHeight: é a altura natural do painel.
      const natural = inner.offsetHeight;
      const available = window.innerHeight - DIALOG_CHROME_PX;
      const wide = window.innerWidth >= 640;
      const scale = wide && natural > available ? Math.max(MIN_SCALE, available / natural) : 1;
      setState(scale < 1 ? { scale, height: natural * scale } : { scale: 1 });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(inner);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  return { ref, ...state };
}

/**
 * Foco do diálogo: entra na primeira etapa disponível (ou no fechar), fica preso no modal com Tab e
 * volta para onde estava ao fechar. Escape só fecha a consulta: na compra/construção o "×" recusa,
 * então fechar sem querer pelo teclado não deve tomar a decisão.
 */
function useDialogFocus(ref: RefObject<HTMLDivElement | null>, onEscape?: () => void) {
  const escape = useRef(onEscape);
  escape.current = onEscape;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')];
    (dialog.querySelector<HTMLElement>('.pe-available') ?? focusable()[0])?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && escape.current) {
        event.preventDefault();
        escape.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [ref]);
}
