import type { Panel, PanelRect } from './panelProjection';

/**
 * Faixa do nome (sigla + nome do estado) de uma propriedade comprada, repintada na cor do dono
 * (pedido do usuário, 07/11/2026). A faixa branca faz parte do atlas; esta cobre a original por inteiro,
 * em coordenadas do painel: nas casas em pé fica no topo, nas deitadas à esquerda.
 */
export function ownerHeaderRect(panel: Panel, stateId?: string): PanelRect {
  const m = 4.5;
  return panel.horizontal
    ? { x: m, y: m, width: panel.width * 0.43 + 2, height: panel.height - 2 * m }
    : { x: m, y: m, width: panel.width - 2 * m, height: TALL_HEADERS[stateId ?? ''] ?? 38 };
}

/** Nome em duas linhas na arte: a faixa branca original é mais alta. */
const TALL_HEADERS: Record<string, number> = { RN: 45 };

/** Texto escuro sobre cores claras (amarelo), claro sobre as demais. */
export function headerTextColor(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? '#13254a' : '#ffffff';
}

function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount));
  const [r, g, b] = [mix((n >> 16) & 255), mix((n >> 8) & 255), mix(n & 255)];
  return `rgb(${r},${g},${b})`;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, size: number, maxWidth: number): number {
  ctx.font = `${weight} ${size}px Arial,sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 5) {
    size -= 0.25;
    ctx.font = `${weight} ${size}px Arial,sans-serif`;
  }
  return size;
}

export function paintOwnerHeader(ctx: CanvasRenderingContext2D, r: PanelRect, abbreviation: string, name: string, color: string) {
  const gradient = ctx.createLinearGradient(0, r.y, 0, r.y + r.height);
  gradient.addColorStop(0, shade(color, 0.28));
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, shade(color, -0.22));
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#edc25e';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.width, r.height, Math.min(6, r.height / 4));
  ctx.fill();
  ctx.stroke();

  const ink = headerTextColor(color);
  const light = ink === '#ffffff';
  const cx = r.x + r.width / 2;
  const maxWidth = r.width * 0.88;
  const big = fitFont(ctx, abbreviation, '900', Math.min(r.height * 0.5, 21), maxWidth);
  const small = fitFont(ctx, name, '700', Math.min(r.height * 0.24, big * 0.5), maxWidth);
  const total = big + small * 1.15;
  const top = r.y + (r.height - total) / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ink;
  if (light) {
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 0.6;
  }
  ctx.font = `900 ${big}px Arial,sans-serif`;
  ctx.fillText(abbreviation, cx, top + big / 2);
  ctx.font = `700 ${small}px Arial,sans-serif`;
  ctx.fillText(name, cx, top + big + small * 0.65);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}
