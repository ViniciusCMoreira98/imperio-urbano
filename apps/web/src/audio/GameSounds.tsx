// Sons dos eventos oficiais da partida. Cada lote recebido ao vivo vira uma fila de sons que só toca
// quando a mesa mostra o resultado: depois do lance dos dados e dos saltos dos personagens. Ressincronia
// (reconexão, eventos perdidos) descarta a fila: o estado aparece pronto, sem replay sonoro.
import { useEffect } from 'react';
import { cardPending, useCardStore } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';
import { playSound } from './audio';
import { eventSounds } from './eventSounds';
import type { SoundId } from './sounds';

/** Espaço entre sons do mesmo lote, para não se atropelarem. */
const SPACING_SECONDS = 0.35;

export function GameSounds({ myId }: { myId: string }) {
  useEffect(() => {
    let pending: SoundId[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      timer = null;
      if (pending.length === 0) return;
      // Carta de evento na tela: o som do dinheiro vem quando ela some (o da carta toca ao aparecer).
      const busy =
        useDiceStore.getState().rolling ||
        Object.keys(usePawnStore.getState().moving).length > 0 ||
        cardPending(useCardStore.getState().doneId, useGameStore.getState().cards);
      if (busy) return; // As stores de movimento chamam de novo quando a mesa parar.
      pending.forEach((id, i) => playSound(id, { delay: i * SPACING_SECONDS }));
      pending = [];
    };
    // Adiado: os dados e os personagens marcam o movimento na mesma notificação que trouxe os eventos.
    const schedule = () => {
      if (timer === null) timer = setTimeout(flush, 0);
    };

    const offGame = useGameStore.subscribe((state, previous) => {
      if (state.resync !== previous.resync) {
        pending = [];
        return;
      }
      if (state.rejection && state.rejection !== previous.rejection) playSound('erroAcaoInvalida');
      if (state.eventsVersion === null || previous.eventsVersion === null || state.eventsVersion <= previous.eventsVersion) return;
      const fresh = state.log.slice(-(state.eventsVersion - previous.eventsVersion));
      for (const id of eventSounds(fresh, myId)) if (!pending.includes(id)) pending.push(id);
      schedule();
    });
    const offDice = useDiceStore.subscribe((s, p) => {
      if (p.rolling && !s.rolling) schedule();
    });
    const offPawns = usePawnStore.subscribe(schedule);
    const offCards = useCardStore.subscribe((s, p) => {
      if (s.doneId !== p.doneId) schedule();
    });
    return () => {
      offGame();
      offDice();
      offPawns();
      offCards();
      if (timer !== null) clearTimeout(timer);
    };
  }, [myId]);

  return null;
}
