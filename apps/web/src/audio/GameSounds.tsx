// Sons dos eventos oficiais da partida. Cada lote recebido ao vivo vira um grupo de sons que só toca
// quando a mesa mostra aquela jogada: o lance dos dados e o pouso dos personagens que ela move (ver
// soundGate). Os grupos tocam na ordem em que chegaram. Ressincronia (reconexão, eventos perdidos)
// descarta a fila: o estado aparece pronto, sem replay sonoro.
import { useEffect } from 'react';
import { useCardStore } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';
import { playSound } from './audio';
import { eventSounds } from './eventSounds';
import { GRACE_MS, type SoundGroup, groupReady, soundGroup } from './soundGate';
import type { SoundId } from './sounds';

/** Espaço entre sons do mesmo lote, para não se atropelarem. */
const SPACING_SECONDS = 0.35;

export function GameSounds({ myId }: { myId: string }) {
  useEffect(() => {
    let pending: SoundGroup[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    let graceTimer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      timer = null;
      if (pending.length === 0) return;
      const pawns = usePawnStore.getState();
      const table = {
        landed: pawns.landed,
        moving: pawns.moving,
        rolling: useDiceStore.getState().rolling,
        // Carta de evento na tela: o som do dinheiro vem quando ela some (o da carta toca ao aparecer).
        cardDoneId: useCardStore.getState().doneId,
      };
      const now = Date.now();
      const ready: SoundId[] = [];
      // Em ordem: um grupo que ainda espera a mesa segura os seguintes (o "sua vez" vem depois do pouso).
      while (pending.length > 0 && groupReady(pending[0], table, now)) {
        for (const id of pending.shift()!.sounds) if (!ready.includes(id)) ready.push(id);
      }
      ready.forEach((id, i) => playSound(id, { delay: i * SPACING_SECONDS }));
      // Personagem que não chegou a animar não avisa nada: confere de novo depois da tolerância.
      if (pending.length > 0 && pending[0].clearedAt !== null && graceTimer === null) {
        graceTimer = setTimeout(() => {
          graceTimer = null;
          schedule();
        }, GRACE_MS + 50);
      }
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
      const group = soundGroup(fresh, previous.eventsVersion + 1, eventSounds(fresh, myId));
      // Lote mudo que move personagem (ou tira carta) também entra: segura os sons seguintes até o pouso.
      if (group.sounds.length === 0 && Object.keys(group.moves).length === 0 && group.cardId < 0) return;
      pending.push(group);
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
      if (graceTimer !== null) clearTimeout(graceTimer);
    };
  }, [myId]);

  return null;
}
