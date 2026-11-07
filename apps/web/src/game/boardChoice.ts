// Escolha feita tocando no tabuleiro: sede das Olimpíadas (um estado do jogador) ou destino da viagem
// pelo Aeroporto (qualquer estado). Diz quais casas valem e o comando de cada uma; o
// servidor confere tudo de novo.
import { board, rules } from '@imperio/game-data';
import type { Command, GameSnapshot } from '@imperio/shared-types';
import { formatCredits, tileInfo } from '../property-card/tileInfo';
import { isMyTurn, playerOf } from './rules';

export type BoardChoiceKind = 'olympics' | 'travel';

export interface BoardChoice {
  kind: BoardChoiceKind;
  /** Casas que podem ser escolhidas agora (destacadas no tabuleiro). */
  tiles: number[];
  title: string;
  instruction: string;
  fee: number;
}

export const tileName = (index: number): string => {
  const info = tileInfo(index);
  return info.kind === 'property' ? info.state.name : info.title;
};

export function boardChoice(snapshot: GameSnapshot, myId: string): BoardChoice | null {
  if (snapshot.status !== 'IN_PROGRESS' || !isMyTurn(snapshot, myId)) return null;
  const me = playerOf(snapshot, myId);
  if (!me) return null;
  if (snapshot.phase === 'AWAITING_OLYMPICS_HOST') {
    const fee = rules.olympics.hostFee;
    const owned = new Set(snapshot.properties.filter((p) => p.ownerId === myId).map((p) => p.stateId));
    return {
      kind: 'olympics',
      tiles: board.tiles.filter((t) => t.stateId && owned.has(t.stateId)).map((t) => t.index),
      title: '🔥 Sediar as Olimpíadas',
      instruction: `Toque num dos seus estados destacados para sediar os jogos (${formatCredits(fee)}).`,
      fee,
    };
  }
  if (snapshot.phase === 'AWAITING_TRAVEL_DESTINATION') {
    const fee = rules.nationalTravel.fee;
    return {
      kind: 'travel',
      // Só estados são destino (o Aeroporto não é estado, então a casa atual já fica de fora).
      tiles: board.tiles.filter((t) => t.type === 'PROPERTY').map((t) => t.index),
      title: '✈️ Viagem pelo Aeroporto',
      instruction: `Toque no estado para onde quer viajar (${formatCredits(fee)}) ou role os dados para seguir normalmente.`,
      fee,
    };
  }
  return null;
}

/** Comando e rótulo do botão de confirmar para a casa escolhida; null se ela não vale. */
export function choiceAction(choice: BoardChoice, tileIndex: number | null): { label: string; command: Command } | null {
  if (tileIndex === null || !choice.tiles.includes(tileIndex)) return null;
  const name = tileName(tileIndex);
  if (choice.kind === 'olympics') {
    const stateId = board.tiles[tileIndex].stateId!;
    return { label: `Sediar em ${name} — ${formatCredits(choice.fee)}`, command: { type: 'HOST_OLYMPICS', stateId } };
  }
  return { label: `Viajar para ${name} — ${formatCredits(choice.fee)}`, command: { type: 'CHOOSE_TRAVEL', tileIndex } };
}
