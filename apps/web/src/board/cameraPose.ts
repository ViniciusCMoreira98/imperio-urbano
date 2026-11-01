// Poses da câmera em coordenadas esféricas (convenção do camera-controls:
// azimute medido a partir de +z em direção a +x; polar a partir do eixo +y).
import type { TilePlacement } from './layout';

export interface CameraPose {
  target: [number, number, number];
  azimuth: number;
  polar: number;
  /** null = distância que enquadra o tabuleiro inteiro (depende do aspecto da tela). */
  distance: number | null;
}

export const OVERVIEW_POLAR = 0.85;
const FOCUS_POLAR = 0.75;
const FOCUS_DISTANCE = 6;
/** Desvio lateral na aproximação, para manter o ar isométrico. */
const FOCUS_AZIMUTH_OFFSET = Math.PI / 8;

export function overviewPose(quarterTurns: number): CameraPose {
  return {
    target: [0, 0, 0],
    azimuth: 0.08 + (quarterTurns * Math.PI) / 2,
    polar: OVERVIEW_POLAR,
    distance: null,
  };
}

/** Câmera do lado de fora da casa, para que o texto fique legível. */
export function tilePose(placement: TilePlacement): CameraPose {
  return {
    target: [placement.x, 0, placement.z],
    azimuth: placement.rotationY + FOCUS_AZIMUTH_OFFSET,
    polar: FOCUS_POLAR,
    distance: FOCUS_DISTANCE,
  };
}

/**
 * Distância para uma esfera de raio `radius` caber inteira na tela, considerando o campo de visão
 * vertical (`fovDegrees`) e o horizontal, que é o mais estreito em telas em pé (celular).
 */
export function fitDistance(radius: number, fovDegrees: number, aspect: number): number {
  const vertical = (fovDegrees * Math.PI) / 180;
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * aspect);
  return radius / Math.sin(Math.min(vertical, horizontal) / 2);
}

/** Ângulo equivalente a `target` mais próximo de `current`, evitando giros de mais de meia volta. */
export function nearestAngle(current: number, target: number): number {
  const twoPi = Math.PI * 2;
  const delta = ((((target - current) % twoPi) + twoPi + Math.PI) % twoPi) - Math.PI;
  return current + delta;
}
