// Onde cada personagem fica dentro da casa, a partir só do estado oficial (posição e assento).
// Sozinho: no centro da área de personagens (pawnArea). Dividindo a casa: espalhados sem sair do contorno dela, na ordem dos
// assentos, para que cada um mantenha o mesmo lugar enquanto ninguém entra ou sai.
import { anchorToWorld, tileAnchor } from './layout';

/**
 * Escala do personagem com a base. Nas casas mais estreitas do tabuleiro de 33 casas (ES, CE) quatro
 * personagens só cabem com a base de até ~0,19 de raio; os testes de layout conferem com o contorno real.
 */
export const PAWN_SCALE = 0.75;
/** Only the figure grows; bases, slots and movement anchors keep their tested footprint. */
export function pawnFigureScale(occupants:number):number{return occupants<=1?1.7:occupants===2?1.35:1;}
/** Raio que a base do personagem ocupa no tabuleiro (base de 0,25 na escala PAWN_SCALE). */
export const PAWN_RADIUS = 0.25 * PAWN_SCALE;
/** Afastamento de cada personagem até o centro do grupo quando dividem a casa. */
const PAWN_SPREAD = PAWN_RADIUS + 0.005;

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
    // Grupo compacto, bases quase encostadas: as casas são inclinadas e espalhar mais faria
    // quem fica nos cantos passar do contorno.
    const a = PAWN_SPREAD;
    const b = PAWN_SPREAD;
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
