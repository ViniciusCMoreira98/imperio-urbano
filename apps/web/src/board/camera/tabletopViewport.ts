import {PerspectiveCamera} from 'three';
import {applyFixedCamera,FIXED_CAMERA} from './fixedCamera';

/** Amplia a janela sobre a mesa; pose, escala entre eixos e calibração do tabuleiro são preservadas. */
export function tabletopViewport(width:number,height:number){
 const compact=height<700,top=compact?48:76,bottom=compact?58:90;
 const scale=Math.max(.001,Math.min(Math.max(1,width-24)/1482,Math.max(1,height-top-bottom)/906));
 const x=(width-FIXED_CAMERA.reference.width*scale)/2;
 const y=top+(Math.max(1,height-top-bottom)-906*scale)/2-34*scale;
 return{width,height,scale,x,y,top,bottom};
}
export function applyTabletopCamera(camera:PerspectiveCamera,width:number,height:number){
 applyFixedCamera(camera);const fit=tabletopViewport(width,height),{reference,viewOffset}=FIXED_CAMERA;
 camera.setViewOffset(reference.width,reference.height,viewOffset[0]-fit.x/fit.scale,viewOffset[1]-fit.y/fit.scale,width/fit.scale,height/fit.scale);
 camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return fit;
}
/** Até 8,4 milhões de pixels: 4K a DPR 1; telas menores podem usar DPR 2. */
export function tabletopDpr(width:number,height:number,deviceDpr:number){return Math.min(deviceDpr,2,Math.sqrt(8_388_608/Math.max(1,width*height)));}
