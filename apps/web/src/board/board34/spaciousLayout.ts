import base from'./layout.json';
import{PerspectiveCamera,Vector3}from'three';
import{applyFixedCamera}from'../camera/fixedCamera';
type Point=[number,number,number];
const bounds=(points:number[][])=>({left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),back:Math.min(...points.map(p=>p[2])),front:Math.max(...points.map(p=>p[2]))});
const old=bounds(base.layers.center.polygon),cx=(old.left+old.right)/2,cz=(old.back+old.front)/2;
export const CENTER_SCALE=.76;
const innerX=(x:number)=>cx+(x-cx)*CENTER_SCALE,innerZ=(z:number)=>cz+(z-cz)*CENTER_SCALE;
const boxQuad=(p:number[][]):Point[]=>{const b=bounds(p),y=p[0][1];return[[b.left,y,b.back],[b.right,y,b.back],[b.right,y,b.front],[b.left,y,b.front]]};
export function spaciousQuad(tile:typeof base.tiles[number]):Point[]{
 const q=boxQuad(tile.polygon),corner=['START','OLYMPICS','REST','AIRPORT'].includes(tile.id);
 const selected=corner?[{START:2,OLYMPICS:3,REST:0,AIRPORT:1}[tile.id]!]:tile.side==='north'?[2,3]:tile.side==='south'?[0,1]:tile.side==='west'?[1,2]:[0,3];
 for(const i of selected){const p=q[i];if(corner){p[0]=innerX(p[0]);p[2]=innerZ(p[2]);}else if(tile.side==='north'||tile.side==='south'){p[0]=innerX(p[0]);p[2]+=tile.side==='north'?innerZ(old.back)-old.back:innerZ(old.front)-old.front;}else{p[0]+=tile.side==='west'?innerX(old.left)-old.left:innerX(old.right)-old.right;p[2]=innerZ(p[2]);}}
 return q;
}
/** Bilinear warp keeps adjacent borders aligned while extending each side towards the smaller centre. */
export function spaciousPoint(id:string,p:Point):Point{
 if(id==='CENTER_ART')return[innerX(p[0]),p[1],innerZ(p[2])];
 const tile=base.tiles.find(t=>t.id===id);if(!tile)return p;
 const b=bounds(tile.polygon),q=spaciousQuad(tile),u=(p[0]-b.left)/(b.right-b.left),v=(p[2]-b.back)/(b.front-b.back);
 const mix=(axis:number)=>(1-u)*(1-v)*q[0][axis]+u*(1-v)*q[1][axis]+u*v*q[2][axis]+(1-u)*v*q[3][axis];
 return[mix(0),p[1],mix(2)];
}
export function createSpaciousLayout(){
 const result=structuredClone(base),camera=new PerspectiveCamera();applyFixedCamera(camera);
 const project=(p:number[])=>{const v=new Vector3(...p as Point).project(camera);return[(v.x+1)*768,(1-v.y)*512]};
 const length=(a:number[],b:number[])=>Math.hypot(a[0]-b[0],a[2]-b[2]);
 for(const tile of result.tiles){
  const original=base.tiles.find(t=>t.id===tile.id)!,q=spaciousQuad(original),before=tile.panel;
  tile.polygon=original.polygon.map(p=>spaciousPoint(tile.id,p as Point));tile.pixels=tile.polygon.map(project);
  const quad=q.map(project),width=(Math.hypot(...[quad[1][0]-quad[0][0],quad[1][1]-quad[0][1]])+Math.hypot(quad[2][0]-quad[3][0],quad[2][1]-quad[3][1]))/2,height=(Math.hypot(quad[3][0]-quad[0][0],quad[3][1]-quad[0][1])+Math.hypot(quad[2][0]-quad[1][0],quad[2][1]-quad[1][1]))/2;
  const resize=(r:{x:number;y:number;width:number;height:number})=>({x:r.x*width/before.width,y:r.y*height/before.height,width:r.width*width/before.width,height:r.height*height/before.height});
  tile.panel={...before,quad,width,height,rent:before.rent?resize(before.rent):null,...(before.pool?{pool:resize(before.pool)}:{})} as typeof tile.panel;
  const horizontal=before.horizontal,w=horizontal?Math.min(length(q[0],q[3]),length(q[1],q[2])):Math.min(length(q[0],q[1]),length(q[3],q[2])),depth=horizontal?(length(q[0],q[1])+length(q[3],q[2]))/2:(length(q[0],q[3])+length(q[1],q[2]))/2;
  tile.anchor={...tile.anchor,x:q.reduce((n,p)=>n+p[0]/4,0),z:q.reduce((n,p)=>n+p[2]/4,0),width:w,depth,pawnArea:{x:0,z:tile.type==='PROPERTY'?depth*.1:0,width:w*.76,depth:depth*.52},buildingArea:tile.type==='PROPERTY'?{x:0,z:-depth*.31,width:w*.76,depth:depth*.2}:null};
 }
 result.layers.center.polygon=base.layers.center.polygon.map(p=>spaciousPoint('CENTER_ART',p as Point));result.layers.center.pixels=result.layers.center.polygon.map(project);
 return result;
}
