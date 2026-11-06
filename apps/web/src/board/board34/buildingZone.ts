// Faixa das construções no tabuleiro de 34 casas, medida na própria arte de cada casa: fica na
// ilustração, sem cobrir o nome do estado nem a placa de aluguel.
// Casas em pé (norte/sul): nome em cima, placa embaixo; a construção ocupa a parte de baixo da
// ilustração, logo acima da placa. Casas deitadas (leste/oeste): nome à esquerda, placa embaixo à
// direita; a construção ocupa a ponta direita da ilustração, acima da placa.
import { type Panel, panelPoint } from './panelProjection';

export interface ZoneTile {
  pixels: number[][];
  polygon: number[][];
  panel: Panel;
  anchor: { x: number; z: number; rotationY: number };
}

/** Retângulo no painel (frações 0–1 da largura u e da altura v). */
export interface PanelBox {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

/** Folga até a placa de aluguel e altura máxima da faixa nas casas em pé (frações do painel). */
const RENT_GAP = 0.03;
const UPRIGHT_HEIGHT = 0.25;
/** Fim do nome nas casas em pé e começo da ponta livre nas deitadas (medidos na arte atual). */
export const UPRIGHT_NAME_END = 0.36;
export const LYING_NAME_END = 0.45;
const LYING_START = 0.62;

export function buildingPanelBox(panel: Panel): PanelBox {
  const rent = panel.rent;
  if (!rent) throw new Error('Casa de estado sem placa de aluguel no manifesto.');
  const rentTop = rent.y / panel.height - RENT_GAP;
  if (panel.horizontal) return { u0: Math.max(LYING_START, rent.x / panel.width), u1: 0.94, v0: 0.1, v1: rentTop - 0.01 };
  return { u0: 0.1, u1: 0.9, v0: Math.max(UPRIGHT_NAME_END, rentTop - UPRIGHT_HEIGHT), v1: rentTop };
}

type Mat = number[];

/** Homografia pixel da arte → mundo (x, z), ajustada aos pontos do contorno da própria casa. */
export function pixelToWorld(tile: ZoneTile): (px: number, py: number) => [number, number] {
  const rows: number[][] = [];
  const rhs: number[] = [];
  tile.pixels.forEach(([px, py], i) => {
    const [x, , z] = tile.polygon[i];
    rows.push([px, py, 1, 0, 0, 0, -px * x, -py * x]);
    rhs.push(x);
    rows.push([0, 0, 0, px, py, 1, -px * z, -py * z]);
    rhs.push(z);
  });
  const h = leastSquares(rows, rhs);
  return (px, py) => {
    const q = h[6] * px + h[7] * py + 1;
    return [(h[0] * px + h[1] * py + h[2]) / q, (h[3] * px + h[4] * py + h[5]) / q];
  };
}

function leastSquares(rows: number[][], rhs: number[]): Mat {
  const n = rows[0].length;
  const m = Array.from({ length: n }, (_, i) => [
    ...Array.from({ length: n }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0)),
    rows.reduce((s, r, k) => s + r[i] * rhs[k], 0),
  ]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(m[k][i]) > Math.abs(m[p][i])) p = k;
    [m[i], m[p]] = [m[p], m[i]];
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const f = m[k][i] / m[i][i];
      for (let j = i; j <= n; j++) m[k][j] -= f * m[i][j];
    }
  }
  return m.map((r, i) => r[n] / r[i]);
}

/** Ponto do mundo no sistema da casa (inverso de anchorToWorld). */
function toLocal(anchor: ZoneTile['anchor'], [x, z]: [number, number]): [number, number] {
  const cos = Math.cos(anchor.rotationY);
  const sin = Math.sin(anchor.rotationY);
  const dx = x - anchor.x;
  const dz = z - anchor.z;
  return [dx * cos - dz * sin, dx * sin + dz * cos];
}

/** Cantos de um retângulo do painel no sistema da casa. */
export function panelBoxCorners(tile: ZoneTile, box: PanelBox): [number, number][] {
  const world = pixelToWorld(tile);
  return [[box.u0, box.v0], [box.u1, box.v0], [box.u1, box.v1], [box.u0, box.v1]].map(([u, v]) =>
    toLocal(tile.anchor, world(...panelPoint(tile.panel, u, v))),
  );
}

/** Maior retângulo alinhado à casa dentro do quadrilátero (a perspectiva da arte o inclina um pouco). */
export function buildingZone(tile: ZoneTile): { x: number; z: number; width: number; depth: number } {
  const corners = panelBoxCorners(tile, buildingPanelBox(tile.panel));
  const xs = corners.map((c) => c[0]).sort((a, b) => a - b);
  const zs = corners.map((c) => c[1]).sort((a, b) => a - b);
  const [x0, x1, z0, z1] = [xs[1], xs[2], zs[1], zs[2]];
  return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, width: x1 - x0, depth: z1 - z0 };
}

type Area = { x: number; z: number; width: number; depth: number };
/** Folga entre a construção e os personagens, e entre os personagens e a borda da casa. */
const PAWN_GAP = 0.02;
const EDGE_MARGIN = 0.06;

/**
 * Construção e personagens na mesma casa sem se sobrepor: a construção fica junto da placa de
 * aluguel e os personagens ocupam o resto da casa na profundidade, do outro lado dela.
 */
export function tileZones(tile: ZoneTile, pawnArea: Area): { building: Area; pawns: Area } {
  const building = buildingZone(tile);
  const zs = tile.polygon.map(([x, , z]) => toLocal(tile.anchor, [x, z])[1]);
  const [zMin, zMax] = [Math.min(...zs) + EDGE_MARGIN, Math.max(...zs) - EDGE_MARGIN];
  const [from, to] =
    building.z < 0 ? [building.z + building.depth / 2 + PAWN_GAP, zMax] : [zMin, building.z - building.depth / 2 - PAWN_GAP];
  return { building, pawns: { x: pawnArea.x, width: pawnArea.width, z: (from + to) / 2, depth: to - from } };
}
