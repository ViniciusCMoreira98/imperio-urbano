// Arte do tabuleiro (docs/referencias/tabuleiro-arte.webp, 1312×1199): cada casa usa só a ilustração
// recortada da imagem; nomes, siglas e valores continuam vindo do catálogo (a arte tem preços em "C").
import { useEffect, useState } from 'react';
import artUrl from '../../../../assets/board/tabuleiro-arte.webp?url';
import type { TileType } from '@imperio/shared-types';

/** Retângulo na imagem: x, y, largura, altura (px). */
export type Crop = readonly [number, number, number, number];

// Faixas das casas na imagem, medidas pelas bordas escuras entre elas.
const TOP: Record<string, [number, number]> = {
  RR: [182, 284], AM: [288, 390], AC: [393, 492], RO: [496, 599],
  TO: [726, 827], PA: [831, 929], AP: [933, 1032], MA: [1036, 1138],
};
const BOTTOM: Record<string, [number, number]> = {
  SP: [182, 329], PR: [333, 469], SC: [473, 608], RS: [612, 749], BA: [874, 1004],
};
const LEFT: Record<string, [number, number]> = {
  PI: [195, 294], CE: [298, 398], RN: [402, 503], PB: [507, 607], PE: [706, 796], AL: [800, 891], SE: [895, 995],
};
const RIGHT: Record<string, [number, number]> = {
  MT: [196, 294], MS: [298, 398], GO: [402, 504], DF: [507, 607], MG: [706, 796], ES: [799, 891], RJ: [894, 995],
};
/** Nas casas laterais o nome fica sobre o céu da paisagem: nomes de três linhas descem mais. */
const THREE_LINE_NAMES = new Set(['RN', 'MS', 'DF', 'ES']);

function stateCrops(): Record<string, Crop> {
  const crops: Record<string, Crop> = {};
  for (const [id, [a, b]] of Object.entries(TOP)) crops[id] = [a + 3, 66, b - a - 6, 74];
  for (const [id, [a, b]] of Object.entries(BOTTOM)) crops[id] = [a + 6, 1060, b - a - 12, 58];
  const side = (x: number, w: number, id: string, [a, b]: [number, number]): Crop => {
    const start = a + (THREE_LINE_NAMES.has(id) ? 0.53 : 0.42) * (b - a);
    return [x, Math.round(start), w, Math.round(a + 0.74 * (b - a) - start)];
  };
  for (const [id, range] of Object.entries(LEFT)) crops[id] = side(46, 132, id, range);
  for (const [id, range] of Object.entries(RIGHT)) crops[id] = side(1162, 134, id, range);
  return crops;
}

export const STATE_CROPS = stateCrops();

export const SPECIAL_CROPS: Record<Exclude<TileType, 'PROPERTY'>, Crop> = {
  START: [30, 58, 130, 55],
  OLYMPICS: [1165, 18, 115, 88],
  VISIT: [45, 1008, 100, 72],
  REST: [1148, 1008, 140, 100],
  EVENT: [612, 20, 100, 95],
  NATIONAL_TRAVEL: [1011, 1012, 107, 108],
};

let loading: Promise<HTMLImageElement> | null = null;

function loadArt(): Promise<HTMLImageElement> {
  loading ??= new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = artUrl;
  });
  return loading;
}

/** A imagem da arte, ou nula enquanto carrega (as casas se redesenham quando ela chega). */
export function useBoardArt(): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let active = true;
    loadArt().then((loaded) => active && setImage(loaded), () => undefined);
    return () => {
      active = false;
    };
  }, []);
  return image;
}

/** Desenha o recorte cobrindo o retângulo de destino (corta o excesso, sem distorcer). */
export function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, [sx, sy, sw, sh]: Crop, dx: number, dy: number, dw: number, dh: number) {
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  ctx.drawImage(image, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, dx, dy, dw, dh);
}

/**
 * Recorta uma figura da arte tirando o fundo: mantém só os pixels ligados às sementes (x, y relativos ao
 * recorte) que não são fundo. Usado para o logotipo e o mapa do Brasil, que na arte estão sobre paisagem.
 */
function cutout(image: HTMLImageElement, [sx, sy, sw, sh]: Crop, seeds: [number, number][], isBackground: (r: number, g: number, b: number) => boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const data = ctx.getImageData(0, 0, sw, sh);
  const px = data.data;
  const keep = new Uint8Array(sw * sh);
  const queue = seeds.map(([x, y]) => y * sw + x);
  while (queue.length) {
    const i = queue.pop()!;
    if (keep[i] || isBackground(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])) continue;
    keep[i] = 1;
    const x = i % sw;
    if (x > 0) queue.push(i - 1);
    if (x < sw - 1) queue.push(i + 1);
    if (i >= sw) queue.push(i - sw);
    if (i < sw * (sh - 1)) queue.push(i + sw);
  }
  for (let i = 0; i < keep.length; i++) if (!keep[i]) px[i * 4 + 3] = 0;
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/** Mapa do Brasil sem a água em volta. */
export function brazilMap(image: HTMLImageElement): HTMLCanvasElement {
  const water = (r: number, g: number, b: number) => b > r + 20 && b > g - 5;
  return cutout(image, [470, 485, 400, 370], [[200, 150], [150, 120], [250, 200]], water);
}

/** Logotipo (escudo azul-marinho com borda dourada) sem a paisagem atrás. */
export function logo(image: HTMLImageElement): HTMLCanvasElement {
  const outside = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const badge = max < 90 || (r > 170 && g > 120 && b < 110 && r > b + 80) || min > 200;
    const green = g > r + 25 && g > b + 10 && max > 90;
    const sky = b > r + 30 && max > 120;
    return !badge || green || sky;
  };
  return cutout(image, [440, 190, 440, 300], [[220, 150], [220, 120], [150, 160]], outside);
}
