// Arte das casas em canvas: ilustração recortada da arte do tabuleiro (boardArt.ts) + nome, sigla e
// valores do catálogo. O topo do canvas corresponde ao lado interno da casa, onde fica a faixa de cor.
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { ColorGroup, StateDefinition, TileDefinition, TileType } from '@imperio/shared-types';
import { STATE_ART, SPECIAL_ART, drawArtwork, projectArtwork, type Quad } from './illustratedBoard';
import { board } from '@imperio/game-data';
import { drawCompleteStateArtwork, loadedStateArtwork, type StateArtworkFit } from './art/stateArtwork';

const PX_PER_UNIT = 256;
const INK = '#1f2a3a';
const PORTRAIT_SOURCE=new Set(['AM','RR','AP','PA','RO','PB','PE','SC','RS','SP','PR','RJ']);
const RIGHT_SOURCE=new Set(['AC','MT','MS','GO','DF','MG','ES']);

/** Janela somente da paisagem; os nomes são redesenhados com a proporção correta do catálogo. */
function landscapeQuad(id: string): Quad {
  const quad=STATE_ART[id];
  if(id==='TO')return quad;
  const [left,top,right,bottom]=PORTRAIT_SOURCE.has(id)?[.04,.39,.96,.93]:RIGHT_SOURCE.has(id)?[.04,.07,.53,.9]:[.42,.07,.97,.9];
  return [projectArtwork(quad,left,top),projectArtwork(quad,right,top),projectArtwork(quad,right,bottom),projectArtwork(quad,left,bottom)];
}

/** Cores de fundo e texto como na arte; o ícone em texto só aparece enquanto a imagem carrega. */
const SPECIAL_STYLE: Record<Exclude<TileType, 'PROPERTY'>, { bg: string; ink: string; icon: string; caption?: string }> = {
  START: { bg: '#1f7a3a', ink: '#ffffff', icon: '➜', caption: '+200 ao passar' },
  REST: { bg: '#16304f', ink: '#ffffff', icon: '☾', caption: 'Perde a próxima jogada' },
  TAX: { bg: '#f3d9a4', ink: INK, icon: '$', caption: 'Pague ao banco' },
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
  let stateArtworkFit:StateArtworkFit|undefined;

  const side=Math.floor(tile.index/board.tilesPerSide);
  const pw=side%2?h:w,ph=side%2?w:h;
  ctx.translate(w/2,h/2);ctx.rotate([0,-Math.PI/2,Math.PI,Math.PI/2][side]);ctx.translate(-pw/2,-ph/2);
  ctx.fillStyle = '#7c431d';
  ctx.fillRect(0, 0, pw, ph);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (tile.type === 'PROPERTY' && state && group) {
    const atlas=loadedStateArtwork();
    if(atlas){
      ctx.fillStyle='#72411f';ctx.fillRect(0,0,pw,ph);
      const padding=Math.max(14,Math.min(pw,ph)*.055);
      const bottom=ph*(owned?.76:.92);
      stateArtworkFit=drawCompleteStateArtwork(ctx,atlas,state.id,{x:padding,y:padding,width:pw-2*padding,height:bottom-padding});
    }else{
    ctx.fillStyle='#eefaff';ctx.fillRect(0,0,pw,ph);
    const horizontal=pw>ph;
    const ix=horizontal?pw*.38:pw*.025,iy=horizontal?ph*.035:ph*.35;
    const iw=horizontal?pw*.595:pw*.95,ih=horizontal?ph*.9:ph*.6;
    if(art&&STATE_ART[state.id])drawArtwork(ctx,art,landscapeQuad(state.id),ix,iy,iw,ih);
    const header=ctx.createLinearGradient(0,0,horizontal?pw*.39:0,horizontal?0:ph*.37);header.addColorStop(0,group.color+'85');header.addColorStop(.8,'#ffffff');
    ctx.fillStyle=header;ctx.fillRect(pw*.025,ph*.025,horizontal?pw*.365:pw*.95,horizontal?ph*.91:ph*.33);
    ctx.fillStyle='#11121a';
    const hx=horizontal?pw*.205:pw/2;
    ctx.font=`950 ${Math.min(pw,ph)*(horizontal?.23:.205)}px system-ui,sans-serif`;ctx.fillText(state.abbreviation,hx,ph*(horizontal?.31:.12));
    drawWrapped(ctx,state.name,hx,ph*(horizontal?.58:.245),pw*(horizontal?.34:.88),Math.min(pw,ph)*(horizontal?.105:.09),850);
    }
    // Discreta faixa do grupo oficial; não deriva grupos das cores arbitrárias da imagem.
    ctx.fillStyle=group.color;ctx.fillRect(pw*.06,ph*.94,pw*.88,ph*.035);
    // Estado livre não mostra valor; comprado mostra o aluguel numa faixa na cor do dono.
    if (owned) {
      ctx.fillStyle = owned.ownerColor;
      ctx.fillRect(pw*.04, ph * 0.79, pw*.92, ph * 0.15);
      ctx.fillStyle = readableOn(owned.ownerColor);
      ctx.font = `800 ${Math.min(pw,ph) * 0.16}px system-ui, sans-serif`;
      ctx.fillText(`$ ${owned.rent}`, pw / 2, ph * 0.865, pw * 0.87);
    }
  } else {
    const type = tile.type as Exclude<TileType, 'PROPERTY'>;
    const style = SPECIAL_STYLE[type];
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, pw, ph);
    const base = Math.min(pw, ph);
    if (art&&SPECIAL_ART[type]) {
      drawArtwork(ctx,art,SPECIAL_ART[type],0,0,pw,ph);
    } else {
      ctx.fillStyle = style.ink;
      ctx.font = `700 ${base * 0.4}px system-ui, sans-serif`;
      ctx.fillText(style.icon, pw / 2, ph * 0.34);
    }
    if(!art||type==='NATIONAL_TRAVEL'||type==='TAX'){
      ctx.fillStyle='#073b60';ctx.fillRect(pw*.035,ph*.63,pw*.93,ph*.33);
      ctx.fillStyle = '#ffffff';
      drawWrapped(ctx, (tile.name ?? '').toUpperCase(), pw / 2, ph * 0.75, pw * 0.86, base * 0.12, 900);
      if (style.caption) {
        ctx.font = `600 ${base * 0.068}px system-ui, sans-serif`;
        ctx.fillText(style.caption, pw / 2, ph * 0.9, pw * 0.86);
      }
    }
  }

  ctx.beginPath();ctx.roundRect(6,6,pw-12,ph-12,Math.min(pw,ph)*.06);
  ctx.strokeStyle='#8f490d';ctx.lineWidth=12;ctx.stroke();
  ctx.strokeStyle='#ffcb35';ctx.lineWidth=7;ctx.stroke();
  ctx.strokeStyle='#fff3bd';ctx.lineWidth=1.5;ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if(stateArtworkFit)texture.userData.stateArtworkFit=stateArtworkFit;
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
