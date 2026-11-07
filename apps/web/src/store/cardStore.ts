// Carta de evento na tela (somente cliente). O efeito já é oficial; isto só ordena a apresentação: o
// peão que a carta move, o saldo que ela muda e a escolha no tabuleiro esperam a carta sumir.
import { create } from 'zustand';
import { useGameStore } from './gameStore';

interface CardPresentationState {
  /** Versão da última carta que já apareceu e sumiu. */
  doneId: number;
  /** Carta aparecendo agora (versão); null sem carta na tela. */
  shownId: number | null;
  show: (id: number) => void;
  finish: (id: number) => void;
}

export const useCardStore = create<CardPresentationState>()((set) => ({
  doneId: -1,
  shownId: null,
  show: (id) => set({ shownId: id }),
  finish: (id) => set((s) => ({ doneId: Math.max(s.doneId, id), shownId: s.shownId === id ? null : s.shownId })),
}));

// Primeiro snapshot ou ressincronia (outra partida, reconexão): cartas antigas não aparecem mais.
useGameStore.subscribe((state, previous) => {
  if (state.resync === previous.resync) return;
  useCardStore.setState({ doneId: state.eventsVersion ?? -1, shownId: null });
});

/** Há carta na tela ou esperando a vez de aparecer. */
export function cardPending(doneId: number, cards: readonly { id: number }[]): boolean {
  return cards.some((card) => card.id > doneId);
}

export function useCardBusy(): boolean {
  const doneId = useCardStore((s) => s.doneId);
  return useGameStore((s) => cardPending(doneId, s.cards));
}
