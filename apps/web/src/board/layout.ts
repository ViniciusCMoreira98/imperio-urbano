// Geometria do tabuleiro: converte o índice da casa em posição na cena.
// Fonte: manifesto visual de 33 ou 34 casas, escolhido pela sequência completa do catálogo e consultado pelo id estável da casa
// no catálogo (board.json). Eixos: x para a direita, z em direção à câmera; o +z local de cada casa
// aponta para fora do tabuleiro.

import { board } from '@imperio/game-data';
import {boardVisualManifest} from './boardVisualManifest';
const manifest = boardVisualManifest(board.tiles);

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
 * do topo, orientação e áreas. Fonte única de posição e altura das casas (contrato em
 * docs/11-contratos-claude-codex.md e no manifesto da arte).
 */
export interface TileAnchor {
  index: number;
  /** Id estável da casa (board.json), o mesmo do manifesto da arte. */
  id: string;
  x: number;
  z: number;
  surfaceY: number;
  /** Rotação em Y que leva o +z local para fora do tabuleiro. */
  rotationY: number;
  width: number;
  depth: number;
  /** Onde até 4 personagens se distribuem. */
  pawnArea: TileArea;
  /** Faixa de casas e hotel, sem sobrepor pawnArea; null onde não há construção. */
  buildingArea: TileArea | null;
  /** Quanto a casa sobe ao ser selecionada (0 se a arte não sobe); quem está nela sobe junto. */
  selectedLift: number;
  /** Contorno real da casa no mundo (x, z): as áreas são retângulos dentro dele. */
  polygon: [number, number][];
}

const manifestById = new Map(manifest.tiles.map((t) => [t.id, t]));

const anchors: TileAnchor[] = board.tiles.map((tile) => {
  const art = manifestById.get(tile.id);
  if (!art) throw new Error(`Casa ${tile.index} (${tile.id}) sem arte no manifesto do tabuleiro`);
  const a = art.anchor;
  return {
    index: tile.index,
    id: tile.id,
    x: a.x,
    z: a.z,
    surfaceY: a.surfaceY,
    rotationY: a.rotationY,
    width: a.width,
    depth: a.depth,
    pawnArea: a.pawnArea,
    buildingArea: tile.type === 'PROPERTY' ? a.buildingArea : null,
    selectedLift: a.selectedLift,
    polygon: art.polygon.map(([x, , z]) => [x, z]),
  };
});

const indexById = new Map(board.tiles.map((t) => [t.id, t.index]));

export function tileAnchor(index: number): TileAnchor {
  return anchors[((index % anchors.length) + anchors.length) % anchors.length];
}

/** Índice oficial da casa a partir do id visual (seleção na cena); null se não for uma casa do percurso. */
export function tileIndexOf(id: string): number | null {
  return indexById.get(id) ?? null;
}

/** Ponto do sistema da casa (x, z locais) no mundo, com a mesma rotação em Y que a casa usa. */
export function anchorToWorld(anchor: TileAnchor, lx: number, lz: number): { x: number; z: number } {
  const cos = Math.cos(anchor.rotationY);
  const sin = Math.sin(anchor.rotationY);
  return { x: anchor.x + lx * cos + lz * sin, z: anchor.z - lx * sin + lz * cos };
}

// ---------------------------------------------------------------------------------------------
// Tabuleiro antigo (36 casas, quatro lados iguais). Só a cena antiga (BoardScene/Tile, arte) e
// ferramentas de arte ainda usam; a partida usa as âncoras acima.

/** Casas por lado no tabuleiro antigo. */
export const LEGACY_TILES_PER_SIDE = 9;
export const TILE_WIDTH = 1;
export const CORNER_SIZE = 1.6;
/** Espessura das casas no tabuleiro antigo. */
export const TILE_HEIGHT = 0.08;
/** Quanto a casa selecionada sobe no tabuleiro antigo. */
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

export function boardLength(tilesPerSide: number = LEGACY_TILES_PER_SIDE): number {
  return 2 * CORNER_SIZE + (tilesPerSide - 1) * TILE_WIDTH;
}

const SIDE_ROTATIONS = [0, -Math.PI / 2, Math.PI, Math.PI / 2];

export function tilePlacement(index: number, tilesPerSide: number = LEGACY_TILES_PER_SIDE): TilePlacement {
  const half = boardLength(tilesPerSide) / 2;
  const side = Math.floor(index / tilesPerSide) % 4;
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
