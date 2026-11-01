// Normalização de um modelo de personagem a partir da caixa dele na pose de repouso, sem alterar a
// geometria: escala uniforme para a altura pedida, centro em X/Z e pés em Y = 0.

export interface Bounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface Placement {
  scale: number;
  /** Translação aplicada depois da escala (já inclui o ajuste fino do manifesto). */
  position: [number, number, number];
}

export function normalizePlacement(bounds: Bounds, height: number, offset: [number, number, number] = [0, 0, 0]): Placement {
  const modelHeight = bounds.max[1] - bounds.min[1];
  if (!(modelHeight > 0) || !Number.isFinite(modelHeight)) {
    throw new Error('Modelo sem altura mensurável (caixa vazia ou inválida).');
  }
  const scale = height / modelHeight;
  const centerX = (bounds.min[0] + bounds.max[0]) / 2;
  const centerZ = (bounds.min[2] + bounds.max[2]) / 2;
  return {
    scale,
    position: [-centerX * scale + offset[0], -bounds.min[1] * scale + offset[1], -centerZ * scale + offset[2]],
  };
}
