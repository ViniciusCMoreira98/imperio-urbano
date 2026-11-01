/** Orientação visual controlada; resultados e sorteio pertencem ao servidor. */
export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

const rotations: Record<DiceFace, readonly [number, number, number]> = {
  1: [0, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
  5: [Math.PI / 2, 0, 0],
  6: [Math.PI, 0, 0],
};

/** Rotação XYZ que deixa para cima a face explicitamente recebida. */
export function diceFaceRotation(face: DiceFace): [number, number, number] {
  if (!Number.isInteger(face) || face < 1 || face > 6) throw new Error('Face do dado deve ser um inteiro entre 1 e 6.');
  return [...rotations[face]];
}
