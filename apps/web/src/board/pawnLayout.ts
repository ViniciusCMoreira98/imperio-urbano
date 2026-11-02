// Onde cada personagem fica dentro da casa, a partir só do estado oficial (posição e assento).
// Sozinho: no centro da área de personagens (pawnArea). Dividindo a casa: espalhados sem sair dela, na ordem dos assentos, para que
// cada um mantenha o mesmo lugar enquanto ninguém entra ou sai.
import { anchorToWorld, tileAnchor } from './layout';

/** Raio que a base do personagem ocupa no tabuleiro (base de 0,25 com a peça em escala 0,95). */
export const PAWN_RADIUS = 0.24;
/** Afastamento máximo do centro, para não encostar na borda nem em casas vizinhas. */
const MAX_SPREAD = 0.35;

export interface PawnSpot {
  x: number;
  y: number;
  z: number;
}

interface PawnOnBoard {
  id: string;
  position: number;
  seat: number;
}

/** Posições locais da casa (x ao longo da largura, z ao longo da profundidade) por quantidade. */
function localSlots(count: number, a: number, b: number): [number, number][] {
  switch (count) {
    case 1:
      return [[0, 0]];
    case 2:
      return [[-a, -b * 0.5], [a, b * 0.5]];
    case 3:
      return [[-a, -b], [a, -b], [0, b]];
    default:
      return [[-a, -b], [a, -b], [-a, b], [a, b]];
  }
}

/** Lugar de quem está sozinho na casa (também o pouso intermediário dos saltos). */
export function pawnCenter(index: number): PawnSpot {
  const anchor = tileAnchor(index);
  return { ...anchorToWorld(anchor, anchor.pawnArea.x, anchor.pawnArea.z), y: anchor.surfaceY };
}

export function pawnSpots(pawns: PawnOnBoard[]): Map<string, PawnSpot> {
  const byTile = new Map<number, PawnOnBoard[]>();
  for (const pawn of pawns) {
    const list = byTile.get(pawn.position) ?? [];
    list.push(pawn);
    byTile.set(pawn.position, list);
  }
  const spots = new Map<string, PawnSpot>();
  for (const [index, onTile] of byTile) {
    const anchor = tileAnchor(index);
    const area = anchor.pawnArea;
    const a = Math.min(area.width / 2 - PAWN_RADIUS, MAX_SPREAD);
    const b = Math.min(area.depth / 2 - PAWN_RADIUS, MAX_SPREAD);
    const slots = localSlots(onTile.length, a, b);
    [...onTile]
      .sort((p, q) => p.seat - q.seat)
      .forEach((pawn, i) => {
        const [lx, lz] = slots[i % slots.length];
        spots.set(pawn.id, { ...anchorToWorld(anchor, area.x + lx, area.z + lz), y: anchor.surfaceY });
      });
  }
  return spots;
}
