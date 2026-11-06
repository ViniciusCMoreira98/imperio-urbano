// Trajetória de um lance dos dados 3D dentro do envelope publicado pela arte (manifesto → diceRoll).
// Só apresentação: a face final é sempre a do servidor; aqui se decide o caminho até ela.

/** Duração total do lance; o peão espera esse tempo antes de andar. */
export const ROLL_SECONDS = 0.9;
/** Fases: subir sem girar, girar no ar, pousar já na face oficial. */
export const LIFT_SECONDS = 0.16;
export const LAND_SECONDS = 0.16;
export const SPIN_SECONDS = ROLL_SECONDS - LIFT_SECONDS - LAND_SECONDS;

type Vec3 = [number, number, number];

export interface DicePose {
  position: number[];
  yaw: number;
  size: number;
}

export interface DiceEnvelope {
  horizontalTravel: number;
  bounceHeight: number;
  centerBounds: { min: number[]; max: number[] }[];
}

export interface RollPlan {
  /** Repouso oficial (centro do dado). */
  rest: Vec3;
  /** Pontos do centro durante os giros, todos dentro de centerBounds. */
  air: Vec3[];
  /** Voltas completas (múltiplos de 2π) em X, Y e Z: ao fim a rotação extra é zero e vale a face oficial. */
  turns: Vec3;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Plano de um dado. A altura de giro respeita o mínimo do envelope (abaixo dele não há garantia para
 * girar sem tocar a mesa ou o outro dado); X/Z variam até horizontalTravel e voltam ao repouso.
 */
export function rollPlan(index: number, pose: DicePose, envelope: DiceEnvelope, random: () => number = Math.random): RollPlan {
  const bounds = envelope.centerBounds[index];
  if (!bounds) throw new Error(`Envelope ausente para o dado ${index}.`);
  const rest: Vec3 = [pose.position[0], pose.position[1], pose.position[2]];
  const travel = envelope.horizontalTravel;
  const [minY, maxY] = [bounds.min[1], Math.min(bounds.max[1], bounds.min[1] + envelope.bounceHeight)];
  const point = (height: number): Vec3 => [
    clamp(rest[0] + (random() * 2 - 1) * travel, bounds.min[0], bounds.max[0]),
    clamp(minY + height * (maxY - minY), minY, maxY),
    clamp(rest[2] + (random() * 2 - 1) * travel, bounds.min[2], bounds.max[2]),
  ];
  // Sobe, quica uma vez e fica no alto até centralizar sobre o repouso para o pouso vertical.
  const air: Vec3[] = [point(1), point(0.25), point(0.85), [clamp(rest[0], bounds.min[0], bounds.max[0]), minY, clamp(rest[2], bounds.min[2], bounds.max[2])]];
  const sign = () => (random() < 0.5 ? -1 : 1);
  const turns: Vec3 = [sign() * (2 + Math.floor(random() * 2)), sign() * Math.floor(random() * 2), sign() * (1 + Math.floor(random() * 2))];
  return { rest, air, turns };
}

/** Se o lance aparece animado agora: aba visível e sem pedido de movimento reduzido. */
export const rollAnimates = () =>
  typeof document !== 'undefined' && !document.hidden && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
