// Arte provisória das casas, desenhada em canvas (sem fontes nem imagens externas).
// O topo do canvas corresponde ao lado interno da casa, onde fica a faixa de cor.
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { ColorGroup, StateDefinition, TileDefinition, TileType } from '@imperio/shared-types';

const PX_PER_UNIT = 256;
const PAPER = '#f4ecd8';
const INK = '#1f2a3a';

const SPECIAL_STYLE: Record<Exclude<TileType, 'PROPERTY'>, { bg: string; icon: string; caption?: string }> = {
  START: { bg: '#3f9b5a', icon: '➜', caption: '+200' },
  REST: { bg: '#6b8fb0', icon: '☾' },
  VISIT: { bg: '#3aa7a0', icon: '⌂' },
  OLYMPICS: { bg: '#e0a526', icon: '★', caption: 'Sede ×2–×10' },
  NATIONAL_TRAVEL: { bg: '#2f6fd0', icon: '✈' },
  EVENT: { bg: '#8a5cc2', icon: '?' },
};

interface TileArt {
  tile: TileDefinition;
  state?: StateDefinition;
  group?: ColorGroup;
  width: number;
  depth: number;
  /** Estado comprado: aluguel atual (com construções e Olimpíadas) e a cor do peão do dono. */
  owned?: { rent: number; ownerColor: string };
}

export function createTileTexture({ tile, state, group, width, depth, owned }: TileArt): CanvasTexture {
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
    ctx.fillStyle = group.color;
    ctx.fillRect(0, 0, w, h * 0.24);
    ctx.fillStyle = INK;
    ctx.font = `800 ${w * 0.36}px system-ui, sans-serif`;
    ctx.fillText(state.abbreviation, w / 2, h * 0.42);
    drawWrapped(ctx, state.name, w / 2, h * 0.62, w * 0.88, w * 0.11);
    // Como no Business Tour: estado livre não mostra valor; comprado mostra o aluguel numa faixa do dono.
    if (owned) {
      ctx.fillStyle = owned.ownerColor;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      ctx.fillStyle = readableOn(owned.ownerColor);
      ctx.font = `800 ${w * 0.17}px system-ui, sans-serif`;
      ctx.fillText(`$ ${owned.rent}`, w / 2, h * 0.89, w * 0.92);
    }
  } else {
    const style = SPECIAL_STYLE[tile.type as Exclude<TileType, 'PROPERTY'>];
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    const base = Math.min(w, h);
    ctx.font = `700 ${base * 0.4}px system-ui, sans-serif`;
    ctx.fillText(style.icon, w / 2, h * 0.38);
    drawWrapped(ctx, (tile.name ?? '').toUpperCase(), w / 2, h * 0.68, w * 0.9, base * 0.13);
    if (style.caption) {
      ctx.font = `600 ${base * 0.1}px system-ui, sans-serif`;
      ctx.fillText(style.caption, w / 2, h * 0.86);
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
) {
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
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
