// Geometria do tabuleiro: converte o índice da casa em posição na cena.
// Eixos: x para a direita, z em direção à câmera. A casa 0 (Início) fica no canto inferior direito
// e o percurso segue no sentido horário visto de cima: inferior → esquerdo → superior → direito.

export const TILE_WIDTH = 1;
export const CORNER_SIZE = 1.6;

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
