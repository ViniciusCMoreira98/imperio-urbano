import atlasUrl from '../../../../../assets/board/estados-brasileiros-atlas.png?url';
import manifest from '../../../../../assets/board/board-art-manifest.json';

let loading:Promise<HTMLImageElement>|null=null;
let loaded:HTMLImageElement|null=null;
export function loadStateArtwork():Promise<HTMLImageElement> {
  loading??=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{loaded=image;resolve(image);};image.onerror=reject;image.src=atlasUrl;});
  return loading;
}
export function loadedStateArtwork(){return loaded;}

export interface StateArtworkFit {
  stateId:string;
  sourceRect:number[];
  destination:{x:number;y:number;width:number;height:number};
  canvasCorners:[number,number][];
  canvasSize:[number,number];
}

/** A janela completa da UF, incluindo nome, paisagem e borda, sempre em contain. */
export function drawCompleteStateArtwork(ctx:CanvasRenderingContext2D,image:HTMLImageElement,stateId:string,box:{x:number;y:number;width:number;height:number}):StateArtworkFit {
  const entry=manifest.states[stateId as keyof typeof manifest.states];
  if(!entry)throw new Error(`Não há arte individual para ${stateId}.`);
  const [sx,sy,sw,sh]=entry.rect;
  const scale=Math.min(box.width/sw,box.height/sh);
  const width=sw*scale,height=sh*scale,x=box.x+(box.width-width)/2,y=box.y+(box.height-height)/2;
  ctx.drawImage(image,sx,sy,sw,sh,x,y,width,height);
  const t=ctx.getTransform();
  const canvasCorners=([[x,y],[x+width,y],[x+width,y+height],[x,y+height]] as [number,number][]).map(([px,py])=>[t.a*px+t.c*py+t.e,t.b*px+t.d*py+t.f] as [number,number]);
  return {stateId,sourceRect:entry.rect,destination:{x,y,width,height},canvasCorners,canvasSize:[ctx.canvas.width,ctx.canvas.height]};
}
