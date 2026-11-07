// Aviso no meio da tela quando a vez pede uma escolha no tabuleiro (sediar as Olimpíadas ou viajar
// pelo Aeroporto): diz o que fazer, mostra a casa tocada e confirma. As casas que valem ficam
// destacadas no tabuleiro (ChoiceHighlights). O cartão não tapa os toques fora dele.
import { useEffect } from 'react';
import { boardChoice, choiceAction, tileName } from '../game/boardChoice';
import { useGameStore } from '../store/gameStore';
import { useTableBusy } from '../store/tableBusy';
import { useViewStore } from '../store/viewStore';
import { Button } from '../ui/ui';
import { Countdown } from './ActionBar';

export function BoardChoicePrompt({ myId }: { myId: string }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const send = useGameStore((s) => s.send);
  const offline = useGameStore((s) => s.connection !== 'open');
  const deadline = useGameStore((s) => s.turnDeadline);
  const selected = useViewStore((s) => s.selectedTile);
  const clearSelection = useViewStore((s) => s.clearSelection);
  // Aparece quando a mesa para: primeiro o jogador vê o peão chegar.
  const tableBusy = useTableBusy();
  const choice = snapshot ? boardChoice(snapshot, myId) : null;
  const kind = choice?.kind ?? null;

  // Cada escolha começa sem casa marcada, e uma casa marcada não reabre a consulta depois.
  useEffect(() => {
    clearSelection();
    return () => clearSelection();
  }, [kind, clearSelection]);

  if (!choice || tableBusy) return null;
  const action = choiceAction(choice, selected);
  const invalid = selected !== null && !action;
  const act = (command: Parameters<typeof send>[0]) => {
    clearSelection();
    send(command);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-3">
      <section
        role="dialog"
        aria-label={choice.title}
        className="hud-panel pointer-events-auto w-[min(26rem,100%)] rounded-2xl border border-amber-300/60 px-4 py-3 text-center text-white shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-center gap-2">
          <h2 className="text-lg font-black tracking-wide text-amber-200 sm:text-xl">{choice.title}</h2>
          {deadline !== null && <Countdown deadline={deadline} />}
        </div>
        <p className="text-sm text-white/90">{choice.instruction}</p>
        {invalid && (
          <p className="mt-2 text-sm text-rose-200">
            {choice.kind === 'olympics' ? `${tileName(selected)} não é seu. Escolha um estado destacado.` : 'Só dá para viajar para um estado. Escolha um destacado.'}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="primary" disabled={offline || !action} onClick={() => action && act(action.command)}>
            {action ? action.label : 'Toque num estado destacado'}
          </Button>
          {choice.kind === 'olympics' && (
            <Button variant="neon" disabled={offline} onClick={() => act({ type: 'SKIP_OLYMPICS' })}>
              Não sediar
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
