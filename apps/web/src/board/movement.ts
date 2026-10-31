/** Casas visitadas ao andar `steps` casas a partir de `from` (sem incluir a de origem). */
export function movePath(from: number, steps: number, tileCount: number): number[] {
  return Array.from({ length: steps }, (_, i) => (from + i + 1) % tileCount);
}

/** Verdadeiro se o percurso passa pelo Início (casa 0) ou para nele. */
export function passesStart(from: number, steps: number, tileCount: number): boolean {
  return from + steps >= tileCount;
}
