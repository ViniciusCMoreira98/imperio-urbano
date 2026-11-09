// De quem é a vez NA TELA (somente cliente). O servidor passa a vez assim que a jogada é decidida, mas a
// mesa ainda mostra os dados rolando, o personagem andando ou a carta de evento. O card da vez, o destaque
// do jogador e o botão de rolar só trocam para o próximo jogador quando a mesa para.
import { create } from 'zustand';
import { cardPending, useCardStore } from './cardStore';
import { useDiceStore } from './diceStore';
import { useGameStore } from './gameStore';
import { usePawnStore } from './pawnStore';

export const useShownTurnStore = create<{ playerId: string | null }>()(() => ({ playerId: null }));

function tableBusy(): boolean {
  return (
    useDiceStore.getState().rolling ||
    Object.keys(usePawnStore.getState().moving).length > 0 ||
    cardPending(useCardStore.getState().doneId, useGameStore.getState().cards)
  );
}

/** Acompanha o servidor, segurando a troca de jogador enquanto a mesa mostra a jogada anterior. */
export function syncShownTurn(force = false) {
  const official = useGameStore.getState().snapshot?.currentPlayerId ?? null;
  const shown = useShownTurnStore.getState().playerId;
  if (shown === official) return;
  if (!force && shown !== null && official !== null && tableBusy()) return;
  useShownTurnStore.setState({ playerId: official });
}

// Entrada, reconexão ou outra partida: direto no jogador oficial, sem esperar animação.
useGameStore.subscribe((state, previous) => syncShownTurn(state.resync !== previous.resync));
useDiceStore.subscribe(() => syncShownTurn());
usePawnStore.subscribe(() => syncShownTurn());
useCardStore.subscribe(() => syncShownTurn());

export function useShownTurnPlayerId(): string | null {
  return useShownTurnStore((s) => s.playerId);
}
