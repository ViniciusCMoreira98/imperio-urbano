import type { GameSnapshot, PlayerState } from '@imperio/shared-types';

/**
 * Quem está parado numa casa (09/11/2026, pedido do Codex): em casas estreitas quatro personagens se
 * escondem uns atrás dos outros, então a consulta da propriedade lista os ocupantes. Falidos saem do
 * tabuleiro; a ordem é a dos assentos. Ocupante não é dono: o dono vem de `property.ownerId`.
 */
export function tileOccupants(snapshot: GameSnapshot, tileIndex: number): PlayerState[] {
  return snapshot.players
    .filter((p) => !p.bankrupt && p.position === tileIndex)
    .sort((a, b) => a.seat - b.seat);
}
