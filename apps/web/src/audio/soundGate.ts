// Quando os sons de um lote de eventos podem tocar (08/11/2026). Antes a fila esperava a mesa inteira
// parar; se o próximo jogador rolasse antes do personagem anterior assentar, o som da Taxa (e do aluguel,
// do saque...) só vinha depois do lance seguinte, junto com o "sua vez". Agora cada lote espera só o que
// é dele: o pouso dos personagens que ele move, a carta que ele tirou e, sem movimento, os próprios dados.
import type { DomainEvent } from '@imperio/shared-types';
import type { SoundId } from './sounds';

/** Personagem que não começou a andar até aqui (contado a partir de quando a carta e os dados liberam) não vai
 * animar: não segura o som para sempre. */
export const GRACE_MS = 1000;

export interface SoundGroup {
  sounds: SoundId[];
  /** Último PLAYER_MOVED do lote (versão) por jogador: o som espera esse pouso. */
  moves: Record<string, number>;
  /** Maior carta do lote (versão do EVENT_CARD_DRAWN); -1 sem carta. */
  cardId: number;
  /** Lance sem movimento (Descanso): espera os dados pararem. */
  dice: boolean;
  /** Quando a carta e os dados do lote liberaram (a partir daí conta a tolerância); null antes disso. */
  clearedAt: number | null;
}

export interface TableState {
  landed: Readonly<Record<string, number>>;
  moving: Readonly<Record<string, true>>;
  rolling: boolean;
  cardDoneId: number;
}

export function soundGroup(events: readonly DomainEvent[], firstVersion: number, sounds: SoundId[]): SoundGroup {
  const moves: Record<string, number> = {};
  let cardId = -1;
  let rolled = false;
  events.forEach((event, i) => {
    if (event.type === 'PLAYER_MOVED') moves[event.playerId] = firstVersion + i;
    else if (event.type === 'EVENT_CARD_DRAWN') cardId = firstVersion + i;
    else if (event.type === 'DICE_ROLLED') rolled = true;
  });
  return { sounds, moves, cardId, dice: rolled && Object.keys(moves).length === 0, clearedAt: null };
}

/** Anota em {@code group.clearedAt} quando a carta e os dados liberam. */
export function groupReady(group: SoundGroup, table: TableState, now: number): boolean {
  if (group.cardId > table.cardDoneId) return false;
  if (group.dice && table.rolling) return false;
  group.clearedAt ??= now;
  const late = now - group.clearedAt >= GRACE_MS;
  return Object.entries(group.moves).every(
    ([playerId, moveId]) => (table.landed[playerId] ?? -1) >= moveId || (late && !table.moving[playerId]),
  );
}
