// Dinheiro que depende do personagem chegar (somente apresentação). O servidor já pagou o aluguel, a
// taxa, o saque e o bônus do Início quando decidiu a jogada; o painel só mostra cada valor quando o
// personagem pousa na casa (ou, no bônus, quando passa pelo Início).
import type { DomainEvent } from '@imperio/shared-types';

/** Chave do fundo da Taxa (o Saque) entre os saldos segurados: também só muda quando o personagem pousa. */
export const TAX_POOL = '__taxPool';

export interface MoneyHold {
  /** Versão do PLAYER_MOVED que leva o personagem até onde o dinheiro muda. */
  moveId: number;
  mover: string;
  /** Bônus do Início: libera ao passar pela casa 0, sem esperar o fim do movimento. */
  atStart: boolean;
  credits: Record<string, number>;
}

/** Mudanças de saldo de um lote de EVENTS que vêm depois de um movimento do mesmo jogador. */
export function moneyFromEvents(events: DomainEvent[], firstVersion: number): MoneyHold[] {
  const lastMove = new Map<string, number>();
  const holds: MoneyHold[] = [];
  const hold = (mover: string, atStart: boolean, credits: Record<string, number>) => {
    const moveId = lastMove.get(mover);
    if (moveId !== undefined) holds.push({ moveId, mover, atStart, credits });
  };
  events.forEach((event, i) => {
    switch (event.type) {
      case 'PLAYER_MOVED':
        lastMove.set(event.playerId, firstVersion + i);
        if (event.startBonus > 0) hold(event.playerId, true, { [event.playerId]: event.startBonus });
        break;
      case 'RENT_PAID':
        hold(event.fromId, false, { [event.fromId]: -event.amount, [event.toId]: event.amount });
        break;
      case 'TAX_PAID':
        hold(event.playerId, false, { [event.playerId]: -event.amount, [TAX_POOL]: event.amount });
        break;
      case 'SAQUE_COLLECTED':
        hold(event.playerId, false, { [event.playerId]: event.amount, [TAX_POOL]: -event.amount });
        break;
      case 'TURN_ENDED':
        lastMove.delete(event.playerId);
        break;
    }
  });
  return holds;
}

/**
 * Quanto ainda não aparece no saldo de cada jogador (e no fundo da Taxa, em TAX_POOL) porque o personagem não chegou.
 * {@code snapshotVersion}: só segura o que o snapshot já inclui. Os eventos chegam um instante antes do snapshot
 * novo; descontar do saldo antigo fazia o painel piscar errado (taxa +100, bônus do Início -300 até o snapshot).
 */
export function heldMoveCredits(
  holds: readonly MoneyHold[],
  landed: Readonly<Record<string, number>>,
  passedStart: Readonly<Record<string, number>>,
  snapshotVersion = Number.POSITIVE_INFINITY,
): Record<string, number> {
  const held: Record<string, number> = {};
  for (const h of holds) {
    if (h.moveId > snapshotVersion) continue;
    if ((landed[h.mover] ?? -1) >= h.moveId) continue;
    if (h.atStart && (passedStart[h.mover] ?? -1) >= h.moveId) continue;
    for (const [playerId, amount] of Object.entries(h.credits)) held[playerId] = (held[playerId] ?? 0) + amount;
  }
  return held;
}
