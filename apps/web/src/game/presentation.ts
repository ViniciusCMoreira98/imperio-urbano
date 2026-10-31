// Nomes, cores e textos exibidos na partida.
import { board, eventCards, rules, states } from '@imperio/game-data';
import type { AvatarId, DomainEvent, PawnColor } from '@imperio/shared-types';
import { formatCredits } from '../property-card/tileInfo';

/** Avatares provisórios (fauna brasileira) até os modelos 3D da E23. */
export const AVATARS: Record<AvatarId, { name: string; emoji: string }> = {
  'avatar-1': { name: 'Arara', emoji: '🦜' },
  'avatar-2': { name: 'Onça', emoji: '🐆' },
  'avatar-3': { name: 'Tartaruga', emoji: '🐢' },
  'avatar-4': { name: 'Boto', emoji: '🐬' },
  'avatar-5': { name: 'Preguiça', emoji: '🦥' },
};

export const PAWN_COLORS: Record<PawnColor, { name: string; hex: string }> = {
  VERDE: { name: 'Verde', hex: '#2e9e5b' },
  AMARELO: { name: 'Amarelo', hex: '#f2c230' },
  AZUL: { name: 'Azul', hex: '#3d7dd8' },
  VERMELHO: { name: 'Vermelho', hex: '#e63946' },
  ROXO: { name: 'Roxo', hex: '#9b5de5' },
  LARANJA: { name: 'Laranja', hex: '#f28c28' },
};

const stateNames = new Map(states.map((s) => [s.id, s.name]));
const cardsById = new Map(eventCards.map((c) => [c.id, c]));

function tileName(index: number): string {
  const tile = board.tiles[index];
  return tile.stateId ? (stateNames.get(tile.stateId) ?? tile.stateId) : (tile.name ?? `casa ${index}`);
}

/** Linha do histórico em português; {@code null} para eventos sem interesse para o jogador. */
export function describeEvent(event: DomainEvent, name: (playerId: string) => string): string | null {
  switch (event.type) {
    case 'GAME_STARTED':
      return 'A partida começou!';
    case 'DICE_ROLLED':
      return `${name(event.playerId)} tirou ${event.dice.first} + ${event.dice.second}.`;
    case 'PLAYER_MOVED':
      if (event.sentToRest) return `${name(event.playerId)} foi para o Descanso.`;
      return `${name(event.playerId)} foi para ${tileName(event.to)}${event.startBonus ? ` e recebeu ${formatCredits(event.startBonus)} no Início` : ''}.`;
    case 'REST_TURN_LOST':
      return `${name(event.playerId)} descansou e perdeu a jogada.`;
    case 'REST_LEFT':
      return `${name(event.playerId)} tirou dupla e saiu do Descanso.`;
    case 'TRAVEL_CHOSEN':
      return `${name(event.playerId)} viajou para ${tileName(event.tileIndex)}.`;
    case 'PROPERTY_PURCHASED':
      return `${name(event.playerId)} comprou ${stateNames.get(event.stateId)} por ${formatCredits(event.price)}.`;
    case 'PURCHASE_DECLINED':
      return `${name(event.playerId)} não comprou ${stateNames.get(event.stateId)}.`;
    case 'BUILD_SKIPPED':
      return `${name(event.playerId)} não construiu em ${stateNames.get(event.stateId)}.`;
    case 'OLYMPICS_SKIPPED':
      return `${name(event.playerId)} não sediou as Olimpíadas.`;
    case 'TRAVEL_DECLINED':
      return `${name(event.playerId)} preferiu rolar os dados a viajar.`;
    case 'HOUSE_BUILT':
      return `${name(event.playerId)} construiu ${event.count} casa(s) em ${stateNames.get(event.stateId)}.`;
    case 'HOTEL_BUILT':
      return `${name(event.playerId)} construiu um hotel em ${stateNames.get(event.stateId)}.`;
    case 'RENT_PAID':
      return `${name(event.fromId)} pagou ${formatCredits(event.amount)} de aluguel a ${name(event.toId)}.`;
    case 'DEBT_INCURRED':
      return `${name(event.debtorId)} não tem saldo para pagar ${formatCredits(event.amount)}.`;
    case 'OLYMPICS_HOST_SELECTED':
      return `${stateNames.get(event.stateId)} é sede da ${event.edition}ª Olimpíada (×${event.multiplier})!`;
    case 'EVENT_CARD_DRAWN': {
      const card = cardsById.get(event.cardId);
      return card ? `${name(event.playerId)} tirou "${card.title}": ${card.text}` : null;
    }
    case 'CREDITS_TRANSFERRED':
      return `${name(event.fromId)} pagou ${formatCredits(event.amount)} a ${name(event.toId)}.`;
    case 'BUILDING_SOLD':
      return `${name(event.playerId)} vendeu uma construção em ${stateNames.get(event.stateId)}.`;
    case 'PROPERTY_SOLD':
      return `${name(event.playerId)} vendeu ${stateNames.get(event.stateId)} ao banco.`;
    case 'DEBT_SETTLED':
      return `${name(event.debtorId)} quitou a dívida.`;
    case 'PLAYER_BANKRUPT':
      return `${name(event.playerId)} faliu.`;
    case 'GAME_ABANDONED':
      return `Partida encerrada: todos saíram por mais de ${Math.round(rules.abandonment.seconds / 60)} minutos.`;
    case 'GAME_FINISHED':
      return `Fim de jogo! ${event.winnerIds.map(name).join(' e ')} venceu.`;
    default:
      return null;
  }
}
