// Avisos rápidos da mesa (08/11/2026), decididos a partir de cada lote de eventos oficiais. Só texto:
// quem mostra (e quando) é o TableNotices.
// - Aluguel Zero usado: a carta age sozinha e sem aviso parecia que o aluguel tinha sido esquecido.
// - Sem saldo: o servidor pula a compra, a construção, a sede das Olimpíadas e a Viagem Nacional quando
//   o saldo não paga; o jogador da tela precisa saber por que nada foi oferecido.
// - Dados iguais: quem tirou, e o que acontece (joga de novo, sai do Descanso ou vai para ele).
// - Taxa e Saque (09/11/2026): quem pagou a taxa ao banco (o valor vai para o fundo do Saque) e quem
//   sacou o fundo; todos veem, quando o personagem chega na casa.
import { board, rules, states } from '@imperio/game-data';
import type { DomainEvent, GameSnapshot } from '@imperio/shared-types';
import { formatCredits } from '../property-card/tileInfo';
import { buildOptions } from './rules';

const statesById = new Map(states.map((s) => [s.id, s]));

export type TableNoticeKind = 'rentWaiver' | 'noFunds' | 'doubles' | 'tax' | 'saque';

export interface TableNotice {
  /** Versão do evento que gerou o aviso: identifica o aviso. */
  id: number;
  kind: TableNoticeKind;
  title: string;
  text: string;
  /** 'dice': aparece quando os dados param; 'table': quando a mesa termina de mostrar a jogada. */
  after: 'dice' | 'table';
}

export function tableNotices(
  events: readonly DomainEvent[],
  firstVersion: number,
  snapshot: GameSnapshot,
  myId: string,
  name: (playerId: string) => string,
): TableNotice[] {
  const notices: TableNotice[] = [];
  let myLastMove = -1;
  let turnCameToMe = -1;

  events.forEach((event, i) => {
    const id = firstVersion + i;
    switch (event.type) {
      case 'DICE_ROLLED': {
        if (event.dice.first !== event.dice.second) break;
        const next = events.slice(i + 1);
        const toRest = next.some((e) => e.type === 'PLAYER_MOVED' && e.playerId === event.playerId && e.sentToRest);
        const leftRest = next[0]?.type === 'REST_LEFT';
        const me = event.playerId === myId;
        const who = me ? 'Você' : name(event.playerId);
        const text = toRest
          ? `Três duplas seguidas: ${me ? 'você vai' : `${who} vai`} direto para o Descanso.`
          : leftRest
            ? `${who} saiu do Descanso.`
            : `${who} joga de novo.`;
        notices.push({ id, kind: 'doubles', title: `Dados iguais: ${event.dice.first} e ${event.dice.second}!`, text, after: 'dice' });
        break;
      }
      case 'RENT_WAIVED': {
        const where = statesById.get(event.stateId)?.name ?? event.stateId;
        const amount = formatCredits(event.amount);
        const text =
          event.playerId === myId
            ? `Você usou o Aluguel Zero e não pagou ${amount} em ${where}.`
            : event.ownerId === myId
              ? `${name(event.playerId)} usou o Aluguel Zero e não pagou seus ${amount} em ${where}.`
              : `${name(event.playerId)} usou o Aluguel Zero e não pagou ${amount} a ${name(event.ownerId)} em ${where}.`;
        notices.push({ id, kind: 'rentWaiver', title: 'Aluguel Zero!', text, after: 'table' });
        break;
      }
      case 'TAX_PAID': {
        const amount = formatCredits(event.amount);
        const text =
          event.playerId === myId
            ? `Você está pagando ${amount} de taxa ao banco. O valor fica guardado para quem parar no Saque.`
            : `${name(event.playerId)} está pagando ${amount} de taxa ao banco. O valor fica guardado para quem parar no Saque.`;
        notices.push({ id, kind: 'tax', title: 'Taxa', text, after: 'table' });
        break;
      }
      case 'SAQUE_COLLECTED': {
        const amount = formatCredits(event.amount);
        const text =
          event.playerId === myId
            ? `Você sacou ${amount}, todo o dinheiro guardado na casa Taxa.`
            : `${name(event.playerId)} sacou ${amount}, todo o dinheiro guardado na casa Taxa.`;
        notices.push({ id, kind: 'saque', title: 'Saque!', text, after: 'table' });
        break;
      }
      case 'PLAYER_MOVED':
        if (event.playerId === myId) myLastMove = event.sentToRest ? -1 : i;
        break;
      case 'TURN_ENDED':
        turnCameToMe = event.nextPlayerId === myId ? i : -1;
        break;
    }
  });

  const me = snapshot.players.find((p) => p.id === myId);
  if (!me || me.bankrupt) return notices;

  if (myLastMove >= 0) {
    const moved = events[myLastMove] as Extract<DomainEvent, { type: 'PLAYER_MOVED' }>;
    const short = noFundsAt(snapshot, myId, moved.to, me.credits);
    if (short) notices.push({ id: firstVersion + myLastMove, kind: 'noFunds', after: 'table', ...short });
  }
  if (turnCameToMe >= 0 && me.travelPending && me.credits < rules.nationalTravel.fee) {
    notices.push({
      id: firstVersion + turnCameToMe,
      kind: 'noFunds',
      after: 'table',
      title: 'Sem saldo para viajar',
      text: `A Viagem Nacional custa ${formatCredits(rules.nationalTravel.fee)} e você tem ${formatCredits(me.credits)}. Role os dados para seguir.`,
    });
  }
  return notices;
}

/** O que o jogador não pôde fazer por falta de saldo ao parar em {@code tile}; null se não faltou nada. */
function noFundsAt(snapshot: GameSnapshot, myId: string, tile: number, credits: number): { title: string; text: string } | null {
  const definition = board.tiles[tile];
  if (!definition) return null;
  const have = `você tem ${formatCredits(credits)}`;
  if (definition.type === 'OLYMPICS') {
    const owns = snapshot.properties.some((p) => p.ownerId === myId);
    const fee = rules.olympics.hostFee;
    if (!owns || credits >= fee || snapshot.phase === 'AWAITING_OLYMPICS_HOST') return null;
    return { title: 'Sem saldo para sediar', text: `Sediar as Olimpíadas custa ${formatCredits(fee)} e ${have}.` };
  }
  if (definition.type !== 'PROPERTY' || !definition.stateId) return null;
  const state = statesById.get(definition.stateId);
  if (!state) return null;
  const property = snapshot.properties.find((p) => p.stateId === definition.stateId);
  if (!property) {
    if (credits >= state.price || snapshot.phase === 'AWAITING_PURCHASE') return null;
    return { title: 'Sem saldo para comprar', text: `${state.name} custa ${formatCredits(state.price)} e ${have}.` };
  }
  if (property.ownerId !== myId || snapshot.phase === 'AWAITING_BUILD') return null;
  const options = buildOptions(property);
  if (options.houses === 0 && !options.hotel) return null;
  const canAfford = (options.houses > 0 && credits >= state.houseCost) || (options.hotel && credits >= state.hotelCost);
  if (canAfford) return null;
  const what = options.hotel ? `O hotel custa ${formatCredits(state.hotelCost)}` : `Uma casa custa ${formatCredits(state.houseCost)}`;
  return { title: 'Sem saldo para construir', text: `${what} em ${state.name} e ${have}.` };
}
