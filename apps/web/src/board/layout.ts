// Geometria do tabuleiro: converte o índice da casa em posição na cena.
// Eixos: x para a direita, z em direção à câmera. A casa 0 (Início) fica no canto inferior direito
// e o percurso segue no sentido horário visto de cima: inferior → esquerdo → superior → direito.

import { board } from '@imperio/game-data';

export const TILE_WIDTH = 1;
export const CORNER_SIZE = 1.6;
/** Espessura das casas: o topo delas fica em y = TILE_HEIGHT (contrato em docs/11-contratos-claude-codex.md). */
export const TILE_HEIGHT = 0.08;
/** Quanto a casa selecionada sobe; quem está em cima dela sobe junto. */
export const SELECTED_TILE_LIFT = 0.06;

export interface TilePlacement {
  index: number;
  x: number;
  z: number;
  /** Rotação em Y que leva o +z local para fora do tabuleiro (a faixa de cor fica no lado interno). */
  rotationY: number;
  width: number;
  depth: number;
  isCorner: boolean;
}

export function boardLength(tilesPerSide: number): number {
  return 2 * CORNER_SIZE + (tilesPerSide - 1) * TILE_WIDTH;
}

const SIDE_ROTATIONS = [0, -Math.PI / 2, Math.PI, Math.PI / 2];

export function tilePlacement(index: number, tilesPerSide: number): TilePlacement {
  const half = boardLength(tilesPerSide) / 2;
  const side = Math.floor(index / tilesPerSide);
  const k = index % tilesPerSide;
  const rotationY = SIDE_ROTATIONS[side];
  const isCorner = k === 0;

  // Distância percorrida ao longo do lado, a partir do canto inicial, até o centro da casa.
  const along = isCorner ? CORNER_SIZE / 2 : CORNER_SIZE + (k - 0.5) * TILE_WIDTH;
  const edge = half - CORNER_SIZE / 2;
  const t = half - along;

  const [x, z] = [
    [t, edge],
    [-edge, t],
    [-t, -edge],
    [edge, -t],
  ][side];

  return {
    index,
    x,
    z,
    rotationY,
    width: isCorner ? CORNER_SIZE : TILE_WIDTH,
    depth: CORNER_SIZE,
    isCorner,
  };
}

/**
 * Retângulo no sistema da casa: x ao longo da largura, z ao longo da profundidade (+z para fora do
 * tabuleiro, -z para o centro), origem no centro da casa.
 */
export interface TileArea {
  x: number;
  z: number;
  width: number;
  depth: number;
}

/**
 * Âncora de uma casa para quem fica em cima dela (personagens, bases, construções): centro, altura
 * do topo, orientação e áreas. Fonte única de posição e altura das casas; a arte mantém surfaceY
 * igual ao topo real (contrato em docs/11-contratos-claude-codex.md, seção 10).
 */
export interface TileAnchor {
  index: number;
  x: number;
  z: number;
  surfaceY: number;
  /** Mesmo sentido de TilePlacement.rotationY: leva o +z local para fora do tabuleiro. */
  rotationY: number;
  width: number;
  depth: number;
  isCorner: boolean;
  /** Onde até 4 personagens se distribuem. */
  pawnArea: TileArea;
  /** Faixa de casas e hotel, sem sobrepor pawnArea; null onde não há construção. */
  buildingArea: TileArea | null;
  /** Quanto a casa sobe ao ser selecionada (0 se a arte não sobe); quem está nela sobe junto. */
  selectedLift: number;
}

/** Margem entre as áreas e a borda da casa. */
const AREA_MARGIN = 0.01;
/** Profundidade da faixa de construções, no lado interno da casa (perto do centro do tabuleiro). */
const BUILDING_BAND = 0.5;

function areas(index: number, width: number, depth: number): Pick<TileAnchor, 'pawnArea' | 'buildingArea'> {
  const inner = -depth / 2 + AREA_MARGIN;
  const outer = depth / 2 - AREA_MARGIN;
  const usableWidth = width - 2 * AREA_MARGIN;
  if (board.tiles[index]?.type !== 'PROPERTY') {
    return { pawnArea: { x: 0, z: 0, width: usableWidth, depth: outer - inner }, buildingArea: null };
  }
  const split = inner + BUILDING_BAND;
  return {
    buildingArea: { x: 0, z: (inner + split) / 2, width: usableWidth, depth: BUILDING_BAND },
    pawnArea: { x: 0, z: (split + outer) / 2, width: usableWidth, depth: outer - split },
  };
}

export function tileAnchor(index: number, tilesPerSide: number = board.tilesPerSide): TileAnchor {
  const { x, z, rotationY, width, depth, isCorner } = tilePlacement(index, tilesPerSide);
  return {
    index, x, z, surfaceY: TILE_HEIGHT, rotationY, width, depth, isCorner,
    ...areas(index, width, depth),
    selectedLift: SELECTED_TILE_LIFT,
  };
}

/** Ponto do sistema da casa (x, z locais) no mundo, com a mesma rotação em Y que a casa usa. */
export function anchorToWorld(anchor: TileAnchor, lx: number, lz: number): { x: number; z: number } {
  const cos = Math.cos(anchor.rotationY);
  const sin = Math.sin(anchor.rotationY);
  return { x: anchor.x + lx * cos + lz * sin, z: anchor.z - lx * sin + lz * cos };
}
