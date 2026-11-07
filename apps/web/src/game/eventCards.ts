// Cartas de evento vistas pelo cliente: quais foram reveladas num lote (para mostrar a arte do Codex na
// ordem certa), quanto dinheiro só deve aparecer depois que a carta some, e quais estados a carta deixa
// escolher. Tudo derivado dos eventos e do snapshot oficiais; o servidor confere a escolha de novo.
import { board, eventCards } from '@imperio/game-data';
import type { CardEffect, DomainEvent, GameSnapshot, StateId } from '@imperio/shared-types';

export interface CardShow {
  /** Versão do evento EVENT_CARD_DRAWN na partida (única e crescente). */
  id: number;
  playerId: string;
  cardId: string;
  /** A carta não tinha alvo (ninguém para atingir, sem sede). */
  withoutEffect: boolean;
  /**
   * Mudanças de saldo que vieram depois da carta no mesmo lote (prêmio, assalto, bônus e aluguel da
   * visita). O painel só as mostra quando a carta some (pedido do usuário, 06/11/2026).
   */
  credits: Record<string, number>;
}

const effects = new Map(eventCards.map((c) => [c.id, c.effect]));

export function cardEffect(cardId: string | null | undefined): CardEffect | undefined {
  return cardId ? effects.get(cardId) : undefined;
}

/** Cartas reveladas num lote de EVENTS; `firstVersion` é a versão do primeiro evento do lote. */
export function cardsFromEvents(events: DomainEvent[], firstVersion: number): CardShow[] {
  const cards: CardShow[] = [];
  let current: CardShow | null = null;
  const add = (playerId: string, amount: number) => {
    if (current && amount !== 0) current.credits[playerId] = (current.credits[playerId] ?? 0) + amount;
  };
  events.forEach((event, i) => {
    switch (event.type) {
      case 'EVENT_CARD_DRAWN':
        current = { id: firstVersion + i, playerId: event.playerId, cardId: event.cardId, withoutEffect: false, credits: {} };
        cards.push(current);
        break;
      case 'EVENT_CARD_WITHOUT_EFFECT':
        if (current) current.withoutEffect = true;
        break;
      case 'CREDITS_FROM_BANK':
        add(event.playerId, event.amount);
        break;
      case 'CREDITS_TO_BANK':
        add(event.playerId, -event.amount);
        break;
      case 'PLAYER_MOVED':
        add(event.playerId, event.startBonus);
        break;
      case 'RENT_PAID':
        add(event.fromId, -event.amount);
        add(event.toId, event.amount);
        break;
    }
  });
  return cards;
}

/** Soma, por jogador, do dinheiro das cartas que ainda não sumiram da tela. */
export function heldCredits(cards: readonly CardShow[], doneId: number): Record<string, number> {
  const held: Record<string, number> = {};
  for (const card of cards) {
    if (card.id <= doneId) continue;
    for (const [playerId, amount] of Object.entries(card.credits)) held[playerId] = (held[playerId] ?? 0) + amount;
  }
  return held;
}

/** Mesma regra do servidor: Incêndio e Apagão, estados de oponentes; Escolha da sede, qualquer estado com dono. */
export function eventTargets(snapshot: GameSnapshot, playerId: string, effect: CardEffect | undefined): StateId[] {
  if (!effect) return [];
  return snapshot.properties
    .filter((p) => p.ownerId !== null)
    .filter((p) => {
      if (effect.type === 'BURN_PROPERTY' || effect.type === 'BLACKOUT') return p.ownerId !== playerId;
      return effect.type === 'CHOOSE_OLYMPICS_HOST';
    })
    .map((p) => p.stateId);
}

/** Casas do tabuleiro desses estados. */
export function tilesOf(stateIds: readonly StateId[]): number[] {
  const wanted = new Set(stateIds);
  return board.tiles.filter((t) => t.stateId && wanted.has(t.stateId)).map((t) => t.index);
}
