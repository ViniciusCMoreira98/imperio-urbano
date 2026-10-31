// Arte das casas em canvas: ilustração recortada da arte do tabuleiro (boardArt.ts) + nome, sigla e
// valores do catálogo. O topo do canvas corresponde ao lado interno da casa, onde fica a faixa de cor.
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { ColorGroup, StateDefinition, TileDefinition, TileType } from '@imperio/shared-types';
import { SPECIAL_CROPS, STATE_CROPS, drawCover } from './boardArt';

const PX_PER_UNIT = 256;
const PAPER = '#f8f3e6';
const INK = '#1f2a3a';

/** Cores de fundo e texto como na arte; o ícone em texto só aparece enquanto a imagem carrega. */
const SPECIAL_STYLE: Record<Exclude<TileType, 'PROPERTY'>, { bg: string; ink: string; icon: string; caption?: string }> = {
  START: { bg: '#1f7a3a', ink: '#ffffff', icon: '➜', caption: '+200 ao passar' },
  REST: { bg: '#16304f', ink: '#ffffff', icon: '☾', caption: 'Perde a próxima jogada' },
  VISIT: { bg: '#dcecf7', ink: INK, icon: '⌂', caption: 'Apenas visite' },
  OLYMPICS: { bg: '#0f1d3a', ink: '#ffffff', icon: '★', caption: 'Sede ×2–×10' },
  NATIONAL_TRAVEL: { bg: '#f6d27a', ink: INK, icon: '✈', caption: 'Viaje no próximo turno' },
  EVENT: { bg: '#f8e6b0', ink: INK, icon: '?' },
};

interface TileArt {
  tile: TileDefinition;
  state?: StateDefinition;
  group?: ColorGroup;
  width: number;
  depth: number;
  /** Estado comprado: aluguel atual (com construções e Olimpíadas) e a cor do peão do dono. */
  owned?: { rent: number; ownerColor: string };
  /** Arte do tabuleiro, quando já carregada. */
  art?: HTMLImageElement | null;
}

export function createTileTexture({ tile, state, group, width, depth, owned, art }: TileArt): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * PX_PER_UNIT);
  canvas.height = Math.round(depth * PX_PER_UNIT);
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (tile.type === 'PROPERTY' && state && group) {
    // Faixa do grupo, ilustração do estado e nome com a sigla, como nas casas da arte.
    ctx.fillStyle = group.color;
    ctx.fillRect(0, 0, w, h * 0.1);
    const crop = STATE_CROPS[state.id];
    if (art && crop) {
      drawCover(ctx, art, crop, 0, h * 0.1, w, h * 0.44);
    } else {
      ctx.fillStyle = '#bfe3f5';
      ctx.fillRect(0, h * 0.1, w, h * 0.44);
    }
    ctx.fillStyle = INK;
    drawWrapped(ctx, state.name.toUpperCase(), w / 2, h * 0.63, w * 0.92, w * 0.12, 900);
    ctx.font = `800 ${w * 0.12}px system-ui, sans-serif`;
    ctx.fillText(`(${state.abbreviation})`, w / 2, h * 0.75);
    // Estado livre não mostra valor; comprado mostra o aluguel numa faixa na cor do dono.
    if (owned) {
      ctx.fillStyle = owned.ownerColor;
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      ctx.fillStyle = readableOn(owned.ownerColor);
      ctx.font = `800 ${w * 0.17}px system-ui, sans-serif`;
      ctx.fillText(`$ ${owned.rent}`, w / 2, h * 0.91, w * 0.92);
    }
  } else {
    const type = tile.type as Exclude<TileType, 'PROPERTY'>;
    const style = SPECIAL_STYLE[type];
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, w, h);
    const base = Math.min(w, h);
    if (art) {
      // Ilustração no alto, inteira e centralizada.
      const crop = SPECIAL_CROPS[type];
      const boxW = w * 0.9;
      const boxH = h * 0.56;
      const scale = Math.min(boxW / crop[2], boxH / crop[3]);
      const dw = crop[2] * scale;
      const dh = crop[3] * scale;
      drawCover(ctx, art, crop, (w - dw) / 2, h * 0.06 + (boxH - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = style.ink;
      ctx.font = `700 ${base * 0.4}px system-ui, sans-serif`;
      ctx.fillText(style.icon, w / 2, h * 0.34);
    }
    ctx.fillStyle = style.ink;
    drawWrapped(ctx, (tile.name ?? '').toUpperCase(), w / 2, h * 0.73, w * 0.92, base * 0.14, 900);
    if (style.caption) {
      ctx.font = `600 ${base * 0.085}px system-ui, sans-serif`;
      ctx.fillText(style.caption, w / 2, h * 0.89, w * 0.92);
    }
  }

  ctx.strokeStyle = 'rgba(31,42,58,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Texto escuro sobre cores claras (ex.: peão amarelo), claro sobre escuras. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
  return luminance > 0.6 ? INK : '#ffffff';
}

/** Quebra o texto em linhas que cabem em maxWidth, centralizadas em y. */
function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  weight = 600,
) {
  ctx.font = `${weight} ${fontSize}px system-ui, sans-serif`;
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && ctx.measureText(`${last} ${word}`).width <= maxWidth) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  const lineHeight = fontSize * 1.1;
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, top + i * lineHeight, maxWidth));
}
