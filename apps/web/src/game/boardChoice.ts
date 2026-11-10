// Escolha feita tocando no tabuleiro: sede das Olimpíadas (um estado do jogador), destino da viagem
// pelo Aeroporto (qualquer estado) ou o estado pedido por uma carta de evento (Incêndio, Apagão,
// Escolha da sede). Diz quais casas valem e o comando de cada uma; o servidor confere tudo de novo.
import { board, rules } from '@imperio/game-data';
import type { Command, GameSnapshot } from '@imperio/shared-types';
import { formatCredits, tileInfo } from '../property-card/tileInfo';
import { cardEffect, eventTargets, tilesOf } from './eventCards';
import { isMyTurn, playerOf } from './rules';

export type BoardChoiceKind = 'olympics' | 'travel' | 'event' | 'sale';

export interface BoardChoice {
  kind: BoardChoiceKind;
  /** Casas que podem ser escolhidas agora (destacadas no tabuleiro). */
  tiles: number[];
  title: string;
  instruction: string;
  fee: number;
  /** Escolha de carta de evento: qual efeito (muda o rótulo do botão). */
  effect?: 'BURN_PROPERTY' | 'BLACKOUT' | 'CHOOSE_OLYMPICS_HOST';
  /** Aviso quando a casa tocada não vale. */
  invalidHint: string;
}

const EVENT_CHOICES = {
  BURN_PROPERTY: { title: '🔥 Incêndio', instruction: 'Toque no estado de um oponente: ele volta a ficar livre, sem as construções.', invalidHint: 'Escolha um estado de um oponente, destacado.' },
  BLACKOUT: { title: '💡 Apagão', instruction: 'Toque no estado de um oponente: ninguém paga aluguel nele até o dono parar lá 3 vezes.', invalidHint: 'Escolha um estado de um oponente, destacado.' },
  CHOOSE_OLYMPICS_HOST: { title: '🏅 Escolha da sede', instruction: 'Toque num dos seus estados para sediar as Olimpíadas (sem taxa).', invalidHint: 'Esse estado não é seu. Escolha um estado destacado.' },
} as const;

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
      invalidHint: 'Esse estado não é seu. Escolha um estado destacado.',
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
      invalidHint: 'Só dá para viajar para um estado. Escolha um destacado.',
    };
  }
  if (snapshot.phase === 'AWAITING_DEBT_RESOLUTION') {
    // Venda para pagar dívida: marca vários estados próprios (DebtSalePrompt soma e confirma).
    const owned = new Set(snapshot.properties.filter((p) => p.ownerId === myId).map((p) => p.stateId));
    return {
      kind: 'sale',
      tiles: board.tiles.filter((t) => t.stateId && owned.has(t.stateId)).map((t) => t.index),
      title: '💰 Pagar a dívida',
      instruction: 'Toque nos seus estados para vender ao banco.',
      fee: 0,
      invalidHint: 'Esse estado não é seu. Escolha um estado destacado.',
    };
  }
  if (snapshot.phase === 'AWAITING_EVENT_TARGET') {
    const effect = cardEffect(snapshot.pendingEventCardId);
    if (!effect || !(effect.type in EVENT_CHOICES)) return null;
    const type = effect.type as keyof typeof EVENT_CHOICES;
    return { kind: 'event', effect: type, tiles: tilesOf(eventTargets(snapshot, myId, effect)), fee: 0, ...EVENT_CHOICES[type] };
  }
  return null;
}

/** Comando e rótulo do botão de confirmar para a casa escolhida; null se ela não vale. */
export function choiceAction(choice: BoardChoice, tileIndex: number | null): { label: string; command: Command } | null {
  if (choice.kind === 'sale' || tileIndex === null || !choice.tiles.includes(tileIndex)) return null;
  const name = tileName(tileIndex);
  if (choice.kind === 'olympics') {
    const stateId = board.tiles[tileIndex].stateId!;
    return { label: `Sediar em ${name} — ${formatCredits(choice.fee)}`, command: { type: 'HOST_OLYMPICS', stateId } };
  }
  if (choice.kind === 'event') {
    const stateId = board.tiles[tileIndex].stateId!;
    const label = choice.effect === 'BURN_PROPERTY' ? `Incendiar ${name}` : choice.effect === 'BLACKOUT' ? `Apagão em ${name}` : `Sede em ${name}`;
    return { label, command: { type: 'CHOOSE_EVENT_TARGET', stateId } };
  }
  return { label: `Viajar para ${name} — ${formatCredits(choice.fee)}`, command: { type: 'CHOOSE_TRAVEL', tileIndex } };
}
