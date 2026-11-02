// Onde ficam as casas e o hotel dentro da faixa de construções (buildingArea) de cada estado, e em que
// tamanho: no tabuleiro de 33 casas as faixas variam bastante, e as miniaturas encolhem para caber.
import type { TileAnchor } from './layout';

/** Tamanhos de referência das miniaturas (BuildingModels). */
const HOUSE_SIZE = 0.19;
const HOTEL = { width: 0.5, height: 0.42, depth: 0.26 };
/** Folga entre casinhas vizinhas e entre a construção e a borda da faixa. */
const GAP = 0.01;

/** Faixa do dono: logo depois da área de personagens, do lado de fora, mais curta que ela (cabe no contorno inclinado). */
export function ownerStrip(anchor: TileAnchor): { z: number; width: number; depth: number } {
  const area = anchor.pawnArea;
  return { z: area.z + area.depth / 2, width: area.width * 0.8, depth: 0.1 };
}

export interface BuildingPlacement {
  /** Centro de cada casinha (x, z) no sistema da casa, sempre nos mesmos lugares (a 1ª não muda quando chega a 2ª). */
  houses: [number, number][];
  /** Lado da casinha (quadrada). */
  houseSize: number;
  /** Hotel (nível 5) no centro da faixa; null abaixo do nível 5. */
  hotel: { x: number; z: number; width: number; height: number; depth: number } | null;
}

export function buildingPlacement(anchor: TileAnchor, level: number): BuildingPlacement {
  const area = anchor.buildingArea;
  const houseSize = area ? Math.min(HOUSE_SIZE, area.width / 4 - GAP, area.depth - 2 * GAP) : HOUSE_SIZE;
  if (!area || level <= 0) return { houses: [], houseSize, hotel: null };
  if (level >= 5) {
    const scale = Math.min(1, (area.width - 2 * GAP) / HOTEL.width, (area.depth - 2 * GAP) / HOTEL.depth);
    return {
      houses: [],
      houseSize,
      hotel: { x: area.x, z: area.z, width: HOTEL.width * scale, height: HOTEL.height * scale, depth: HOTEL.depth * scale },
    };
  }
  const spacing = houseSize + GAP;
  return {
    houses: Array.from({ length: level }, (_, i) => [area.x + (i - 1.5) * spacing, area.z] as [number, number]),
    houseSize,
    hotel: null,
  };
}
