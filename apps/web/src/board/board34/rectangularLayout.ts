import base from'./layout.json';
import{PerspectiveCamera,Vector3}from'three';
import{applyFixedCamera}from'../camera/fixedCamera';
/** Native rectangles; every property is exactly one by three world units. No mesh warping. */
export function createRectangularLayout(){
 const result=structuredClone(base),camera=new PerspectiveCamera();applyFixedCamera(camera);
 const project=(p:number[])=>{const v=new Vector3(...p as[number,number,number]).project(camera);return[(v.x+1)*768,(1-v.y)*512]};
 const quad=(x:number,z:number,w:number,d:number,y:number)=>[[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2]];
 const corners:Record<string,[number,number]>={START:[-5.5,-5.5],OLYMPICS:[5.5,-5.5],REST:[5.5,5.5],AIRPORT:[-5.5,5.5]};
 const placements=new Map<string,{x:number;z:number;width:number;depth:number}>();
 for(const side of['north','east','south','west']){
  const horizontal=side==='north'||side==='south';let cursor=-4;
  const tiles=base.tiles.filter(t=>t.side===side&&!corners[t.id]).sort((a,b)=>horizontal?a.anchor.x-b.anchor.x:a.anchor.z-b.anchor.z);
  for(const t of tiles){const width=t.type==='PROPERTY'?1:side==='north'||side==='west'?2:1,along=cursor+width/2;cursor+=width;
   placements.set(t.id,{x:horizontal?along:side==='west'?-5.5:5.5,z:horizontal?(side==='north'?-5.5:5.5):along,width,depth:3});}
 }
 for(const t of result.tiles){const corner=corners[t.id],a=corner?{x:corner[0],z:corner[1],width:3,depth:3}:placements.get(t.id)!;
  const rotation=t.anchor.rotationY,c=Math.cos(rotation),s=Math.sin(rotation),world=(x:number,z:number)=>[a.x+x*c+z*s,.08,a.z-x*s+z*c];
  const localQuad=[world(-a.width/2,-a.depth/2),world(a.width/2,-a.depth/2),world(a.width/2,a.depth/2),world(-a.width/2,a.depth/2)];
  const physicalW=t.side==='east'||t.side==='west'?a.depth:a.width,physicalD=t.side==='east'||t.side==='west'?a.width:a.depth;
  t.polygon=quad(a.x,a.z,physicalW-.04,physicalD-.04,.08);t.pixels=t.polygon.map(project);
  t.anchor={...t.anchor,...a,pawnArea:{x:0,z:0,width:a.width*.72,depth:a.depth*.4},buildingArea:t.type==='PROPERTY'?{x:0,z:-.86,width:.72,depth:.64}:null};
  t.panel={quad:localQuad.map(project),width:a.width*256,height:a.depth*256,horizontal:false,rent:t.type==='PROPERTY'?{x:8,y:616,width:240,height:144}:null,...(t.id==='TAX'?{pool:{x:16,y:616,width:224,height:120}}:{})} as typeof t.panel;
 }
 const center=quad(0,0,8,8,.035),outer=quad(0,0,14.3,14.3,0),inner=quad(0,0,14.12,14.12,.025);
 result.layers.center={...result.layers.center,polygon:center,pixels:center.map(project)};
 result.layers.frame={...result.layers.frame,polygon:outer,pixels:outer.map(project),inner,innerPixels:inner.map(project),top:outer.map(([x,,z])=>[x,.025,z])};
 return result;
}
