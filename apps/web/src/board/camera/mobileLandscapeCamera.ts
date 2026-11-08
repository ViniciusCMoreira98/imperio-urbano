import {PerspectiveCamera,Vector3} from 'three';
import layout from '../board34/layout.json';
import type {BoardInsets} from './tabletopViewport';

const frame=layout.layers.frame.polygon;
const points=frame.flatMap(([x,y,z])=>[new Vector3(x,y,z),new Vector3(x,y-.25,z)]);
function projectedBounds(camera:PerspectiveCamera,width:number,height:number){
 const ps=points.map(p=>p.clone().project(camera));
 return{left:Math.min(...ps.map(p=>(p.x+1)*width/2)),right:Math.max(...ps.map(p=>(p.x+1)*width/2)),top:Math.min(...ps.map(p=>(1-p.y)*height/2)),bottom:Math.max(...ps.map(p=>(1-p.y)*height/2))};
}
/** Long focal distance reduces far-side shrinkage; fit the actual frame between measured HUD edges. */
export function applyMobileLandscapeCamera(camera:PerspectiveCamera,width:number,height:number,insets?:BoardInsets){
 const left=insets?.left??12,right=insets?.right??12,top=insets?.top??18,bottom=insets?.bottom??6;
 const freeWidth=Math.max(1,width-left-right),freeHeight=Math.max(1,height-top-bottom);
 const elevation=Math.asin(Math.min(.83,Math.max(.56,1.03/(freeWidth/freeHeight))));
 camera.clearViewOffset();camera.zoom=1;camera.fov=20;camera.aspect=width/height;camera.near=.1;camera.far=250;
 camera.up.set(0,1,0);camera.position.set(0,Math.sin(elevation)*90,Math.cos(elevation)*90);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 let bounds=projectedBounds(camera,width,height);
 camera.zoom=Math.min(freeWidth/(bounds.right-bounds.left),freeHeight/(bounds.bottom-bounds.top))*.985;camera.updateProjectionMatrix();
 bounds=projectedBounds(camera,width,height);
 camera.setViewOffset(width,height,(bounds.left+bounds.right)/2-(left+freeWidth/2),(bounds.top+bounds.bottom)/2-(top+freeHeight/2),width,height);
 camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 return{...projectedBounds(camera,width,height),elevation:elevation*180/Math.PI};
}
