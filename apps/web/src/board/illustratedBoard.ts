import artUrl from '../../../../assets/board/tabuleiro-brasil-alvo.png?url';
import { useEffect, useState } from 'react';
import { loadStateArtwork } from './art/stateArtwork';
export { artUrl as illustratedBoardUrl };
export type Point = readonly [number,number];
export type Quad = readonly [Point,Point,Point,Point];
/** Ordem: superior esquerdo, superior direito, inferior direito, inferior esquerdo. */
export const CENTER_ART: Quad = [[391,177],[1159,177],[1242,738],[294,738]];
export const STATE_ART: Record<string,Quad> = {
  AM:[[395,64],[507,57],[526,166],[402,175]],
  RR:[[511,54],[676,47],[711,152],[530,166]],
  AP:[[852,50],[953,57],[934,164],[819,155]],
  PA:[[960,57],[1060,63],[1040,169],[940,165]],
  RO:[[1066,66],[1165,74],[1160,178],[1046,172]],
  MA:[[190,179],[385,181],[374,240],[175,236]],
  PI:[[175,240],[375,243],[360,295],[163,290]],
  CE:[[160,294],[359,299],[349,352],[148,346]],
  RN:[[147,351],[348,356],[336,413],[136,407]],
  AL:[[135,412],[335,419],[322,491],[119,486]],
  SE:[[117,490],[322,498],[307,588],[97,580]],
  BA:[[95,584],[306,596],[289,699],[62,689]],
  AC:[[1171,183],[1360,185],[1371,235],[1181,237]],
  MT:[[1183,240],[1370,240],[1384,291],[1194,293]],
  MS:[[1196,298],[1384,297],[1395,350],[1206,352]],
  GO:[[1208,356],[1398,356],[1411,413],[1219,416]],
  DF:[[1235,501],[1429,498],[1443,559],[1244,560]],
  MG:[[1248,566],[1444,565],[1459,631],[1255,628]],
  ES:[[1257,633],[1461,635],[1476,698],[1270,700]],
  PB:[[254,745],[362,750],[343,885],[231,878]],
  PE:[[369,750],[476,754],[464,891],[350,886]],
  SC:[[480,754],[589,758],[583,893],[469,891]],
  RS:[[595,758],[706,762],[695,894],[587,893]],
  SP:[[845,755],[991,750],[1004,891],[845,896]],
  PR:[[997,749],[1133,746],[1156,891],[1010,891]],
  RJ:[[1140,744],[1267,739],[1300,887],[1162,890]],
  TO:[[400,206],[573,199],[566,286],[380,287]],
};
export const SPECIAL_ART: Record<string,Quad> = {
  START:[[249,48],[377,49],[393,165],[183,176]],
  OLYMPICS:[[1186,55],[1328,54],[1375,164],[1164,177]],
  REST:[[1303,713],[1454,712],[1520,876],[1320,890]],
  EVENT:[[705,39],[827,39],[818,145],[717,145]],
  NATIONAL_TRAVEL:[[57,718],[231,716],[219,873],[13,873]],
  VISIT:[[506,642],[670,640],[686,737],[475,730]],
};

let loading: Promise<HTMLImageElement> | null = null;
export function useIllustratedBoardArt(): HTMLImageElement | null {
  const [art,setArt]=useState<HTMLImageElement|null>(null);
  useEffect(()=>{
    let active=true;
    loading??=Promise.all([new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=artUrl;}),loadStateArtwork().catch(()=>null)]).then(([image])=>image);
    loading.then(image=>{if(active)setArt(image);},()=>undefined);
    return()=>{active=false;};
  },[]);
  return art;
}

/** Homografia da janela unitária para os quatro pontos da imagem original. */
export function projectArtwork(quad: Quad, u: number, v: number): [number,number] {
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=quad;
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
  const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const denominator=dx1*dy2-dx2*dy1;
  if(Math.abs(denominator)<1e-8) throw new Error('Janela de arte degenerada.');
  const g=(dx3*dy2-dx2*dy3)/denominator,h=(dx1*dy3-dx3*dy1)/denominator;
  const divisor=g*u+h*v+1;
  return [((x1-x0+g*x1)*u+(x3-x0+h*x3)*v+x0)/divisor,((y1-y0+g*y1)*u+(y3-y0+h*y3)*v+y0)/divisor];
}

/** Renderização nativa em canvas; mantém o arquivo-fonte intacto e evita nova geração de imagem. */
export function drawArtwork(ctx: CanvasRenderingContext2D,image: HTMLImageElement,quad: Quad,x: number,y: number,w: number,h: number,steps=10) {
  const triangle=(source: Point[],target: Point[])=>{
    const [[sx,sy],[sx1,sy1],[sx2,sy2]]=source;
    const [[tx,ty],[tx1,ty1],[tx2,ty2]]=target;
    const d=(sx1-sx)*(sy2-sy)-(sx2-sx)*(sy1-sy);
    if(Math.abs(d)<1e-8)return;
    const a=((tx1-tx)*(sy2-sy)-(tx2-tx)*(sy1-sy))/d;
    const c=((sx1-sx)*(tx2-tx)-(sx2-sx)*(tx1-tx))/d;
    const b=((ty1-ty)*(sy2-sy)-(ty2-ty)*(sy1-sy))/d;
    const e=((sx1-sx)*(ty2-ty)-(sx2-sx)*(ty1-ty))/d;
    ctx.save();ctx.beginPath();
    const cx=(tx+tx1+tx2)/3,cy=(ty+ty1+ty2)/3;
    target.forEach(([px,py],i)=>{const radius=Math.hypot(px-cx,py-cy);const factor=radius?1+.65/radius:1;const ax=cx+(px-cx)*factor,ay=cy+(py-cy)*factor;i?ctx.lineTo(ax,ay):ctx.moveTo(ax,ay);});
    ctx.closePath();ctx.clip();ctx.transform(a,b,c,e,tx-a*sx-c*sy,ty-b*sx-e*sy);ctx.drawImage(image,0,0);ctx.restore();
  };
  for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){
    const uv:Point[]=[[i/steps,j/steps],[(i+1)/steps,j/steps],[(i+1)/steps,(j+1)/steps],[i/steps,(j+1)/steps]];
    const s=uv.map(([u,v])=>projectArtwork(quad,u,v)),t=uv.map(([u,v])=>[x+u*w,y+v*h] as Point);
    triangle([s[0],s[1],s[2]],[t[0],t[1],t[2]]);triangle([s[0],s[2],s[3]],[t[0],t[2],t[3]]);
  }
}
