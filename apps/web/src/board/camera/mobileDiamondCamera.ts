import {PerspectiveCamera,Vector3} from 'three';
import layout from '../board34/visualLayout';
import {anchorToWorld,tileAnchor} from '../layout';
import type {BoardInsets,BoardOcclusion} from './tabletopViewport';
import{mobileRectangularStudy}from'../mobileStudy';
type Point=[number,number];
const frame=layout.layers.frame.polygon.map(p=>new Vector3(...p as[number,number,number]));
const heads=layout.tiles.flatMap(t=>{const a=tileAnchor(t.index),p=anchorToWorld(a,a.pawnArea.x,a.pawnArea.z);return[-.25,.25].flatMap(x=>[-.25,.25].map(z=>new Vector3(p.x+x,a.surfaceY+1.22,p.z+z)));});
const tiles=layout.tiles.map(t=>t.polygon.map(p=>new Vector3(...p as[number,number,number])));
function bounds(ps:Point[]){return{left:Math.min(...ps.map(p=>p[0])),right:Math.max(...ps.map(p=>p[0])),top:Math.min(...ps.map(p=>p[1])),bottom:Math.max(...ps.map(p=>p[1]))};}
/** SAT keeps controls outside the actual diamond rather than reserving entire side columns. */
export function intersectsBoardPolygon(poly:Point[],r:BoardOcclusion,gap=4){
 const rect:Point[]=[[r.left-gap,r.top-gap],[r.right+gap,r.top-gap],[r.right+gap,r.bottom+gap],[r.left-gap,r.bottom+gap]];
 const axes:Point[]=[[1,0],[0,1],...poly.map((a,i)=>{const b=poly[(i+1)%poly.length];return[-(b[1]-a[1]),b[0]-a[0]] as Point;})];
 return axes.every(([x,y])=>{const a=poly.map(p=>p[0]*x+p[1]*y),b=rect.map(p=>p[0]*x+p[1]*y);return Math.max(...a)>Math.min(...b)&&Math.max(...b)>Math.min(...a);});
}
export function applyMobileDiamondCamera(camera:PerspectiveCamera,width:number,height:number,insets?:BoardInsets){
 const top=insets?.top??18,bottom=insets?.bottom??8,left=insets?.left??6,right=insets?.right??6;
 const elevation=Math.asin(Math.max(.5,Math.min(.65,(height-top-bottom)/(width*.72)))),yaw=-Math.PI/4,distance=100;
 camera.clearViewOffset();camera.zoom=1;camera.fov=20;camera.aspect=width/height;camera.near=mobileRectangularStudy?5:.1;camera.far=250;camera.up.set(0,1,0);
 camera.position.set(Math.sin(yaw)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(yaw)*Math.cos(elevation)*distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const project=(p:Vector3):Point=>{const v=p.clone().project(camera);return[(v.x+1)*width/2,(1-v.y)*height/2];};
 const original=frame.map(project),headPoints=heads.map(project),propertyPoints=tiles.map(poly=>poly.map(project)),b=bounds(original),cx=(b.left+b.right)/2,cy=(b.top+b.bottom)/2;
 const baseZoom=Math.min((width-left-right)/(b.right-b.left),(height-top-bottom)/(b.bottom-b.top));
 const target:Point=[left+(width-left-right)/2,top+(height-top-bottom)/2];
 const shifts=[0,-.04,.04,-.08,.08,-.12,.12,-.16,.16];let chosen={zoom:baseZoom*.6,dx:0,dy:0};
 search:for(let shrink=1;shrink>=.599;shrink-=.02)for(const dx of shifts)for(const dy of[0,-.015,.015]){
  const zoom=baseZoom*shrink,move=(p:Point):Point=>[target[0]+dx*width+(p[0]-cx)*zoom,target[1]+dy*height+(p[1]-cy)*zoom],poly=original.map(move),box=bounds(poly),head=bounds(headPoints.map(move));
  if(box.left<left||box.right>width-right||box.top<top-1||box.bottom>height-bottom+1||head.top<2||head.left<2||head.right>width-2)continue;
  if((insets?.occlusions??[]).some(r=>intersectsBoardPolygon(poly,r)))continue;
  if(insets?.interior&&propertyPoints.some(p=>intersectsBoardPolygon(p.map(move),insets.interior!,2)))continue;
  chosen={zoom,dx:dx*width,dy:dy*height};break search;
 }
 camera.zoom=chosen.zoom;camera.updateProjectionMatrix();
 const scaledCenter:Point=[width/2+(cx-width/2)*camera.zoom,height/2+(cy-height/2)*camera.zoom];
 camera.setViewOffset(width,height,scaledCenter[0]-target[0]-chosen.dx,scaledCenter[1]-target[1]-chosen.dy,width,height);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 return{...bounds(frame.map(project)),elevation:elevation*180/Math.PI};
}
