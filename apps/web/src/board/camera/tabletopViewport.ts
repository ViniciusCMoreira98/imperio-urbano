import {PerspectiveCamera} from 'three';
import {applyFixedCamera,FIXED_CAMERA} from './fixedCamera';
import {applyMobileLandscapeCamera} from './mobileLandscapeCamera';

/** Desktop keeps the calibrated pose; the landscape host can select its fitted mobile camera. */
export type BoardFraming='standard'|'immersive'|'mobile-landscape';
/** Reservas medidas pelo host (px livres no topo e na base para o HUD). Sem elas, valem as do enquadramento. */
export interface BoardInsets{top:number;bottom:number;left?:number;right?:number}
export function tabletopViewport(width:number,height:number,framing:BoardFraming='standard',insets?:BoardInsets){
 const compact=height<700,immersive=framing==='immersive';
 const top=insets?.top??(immersive?(compact?32:54):(compact?48:76)),bottom=insets?.bottom??(immersive?(compact?40:64):(compact?58:90));
 // Reservas laterais (celular com painéis nas laterais): o quadro 18–1500 centraliza no espaço entre elas.
 const sides=insets?.left!==undefined||insets?.right!==undefined,left=insets?.left??12,right=insets?.right??12;
 const availableWidth=Math.max(1,width-left-right);
 const scale=Math.max(.001,Math.min(availableWidth/1482,Math.max(1,height-top-bottom)/906));
 const x=sides?left+(availableWidth-1482*scale)/2-18*scale:(width-FIXED_CAMERA.reference.width*scale)/2;
 const y=top+(Math.max(1,height-top-bottom)-906*scale)/2-34*scale;
 return{width,height,scale,x,y,top,bottom};
}
export function applyTabletopCamera(camera:PerspectiveCamera,width:number,height:number,framing:BoardFraming='standard',insets?:BoardInsets){
 camera.zoom=1;
 if(framing==='mobile-landscape'){
  applyMobileLandscapeCamera(camera,width,height,insets);return tabletopViewport(width,height,framing,insets);
 }
 applyFixedCamera(camera);const fit=tabletopViewport(width,height,framing,insets),{reference,viewOffset}=FIXED_CAMERA;
 camera.setViewOffset(reference.width,reference.height,viewOffset[0]-fit.x/fit.scale,viewOffset[1]-fit.y/fit.scale,width/fit.scale,height/fit.scale);
 camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return fit;
}
/** Até 8,4 milhões de pixels: 4K a DPR 1; telas menores podem usar DPR 2. */
export function tabletopDpr(width:number,height:number,deviceDpr:number){return Math.min(deviceDpr,2,Math.sqrt(8_388_608/Math.max(1,width*height)));}
