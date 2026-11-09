import { beforeEach, describe, expect, it } from 'vitest';
import type { GameSnapshot } from '@imperio/shared-types';
import { useCardStore } from './cardStore';
import { useDiceStore } from './diceStore';
import { useGameStore } from './gameStore';
import { usePawnStore } from './pawnStore';
import { useShownTurnStore } from './shownTurn';

const turnOf = (currentPlayerId: string) => ({ currentPlayerId }) as GameSnapshot;
const shown = () => useShownTurnStore.getState().playerId;

describe('vez mostrada na tela', () => {
  beforeEach(() => {
    useDiceStore.setState({ rolling: false });
    usePawnStore.setState({ moving: {}, waiting: {} });
    useCardStore.setState({ doneId: -1, shownId: null });
    useGameStore.setState((s) => ({ snapshot: turnOf('ana'), cards: [], resync: s.resync + 1 }));
  });

  it('segue o servidor quando a mesa está parada', () => {
    expect(shown()).toBe('ana');
    useGameStore.setState({ snapshot: turnOf('bia') });
    expect(shown()).toBe('bia');
  });

  it('segura o jogador anterior enquanto dados e personagem ainda mostram a jogada', () => {
    useDiceStore.setState({ rolling: true });
    useGameStore.setState({ snapshot: turnOf('bia') });
    expect(shown()).toBe('ana');
    usePawnStore.setState({ moving: { ana: true } });
    useDiceStore.setState({ rolling: false });
    expect(shown()).toBe('ana');
    usePawnStore.setState({ moving: {} });
    expect(shown()).toBe('bia');
  });

  it('espera a carta de evento sumir', () => {
    useGameStore.setState({ cards: [{ id: 5 }] as never, snapshot: turnOf('bia') });
    expect(shown()).toBe('ana');
    useCardStore.setState({ doneId: 5 });
    expect(shown()).toBe('bia');
  });

  it('ressincronia vai direto ao jogador oficial', () => {
    useDiceStore.setState({ rolling: true });
    useGameStore.setState((s) => ({ snapshot: turnOf('bia'), resync: s.resync + 1 }));
    expect(shown()).toBe('bia');
  });
});
