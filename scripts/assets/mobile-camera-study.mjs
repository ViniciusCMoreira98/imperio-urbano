import {readFile,writeFile,mkdir} from 'node:fs/promises';import{PerspectiveCamera,Vector3}from'three';
const root=new URL('../../',import.meta.url),layout=JSON.parse(await readFile(new URL('apps/web/src/board/board34/layout.json',root))),fixed=JSON.parse(await readFile(new URL('apps/web/src/board/camera/fixedCamera.json',root)));
const points=layout.layers.frame.polygon,tiles=layout.tiles.filter(t=>t.type==='PROPERTY');
const width=800,height=330,insets={top:18,bottom:6,left:120,right:120};
const bounds=ps=>({left:Math.min(...ps.map(p=>p[0])),right:Math.max(...ps.map(p=>p[0])),top:Math.min(...ps.map(p=>p[1])),bottom:Math.max(...ps.map(p=>p[1]))});
const projection=(camera,ps)=>ps.map(p=>{const v=new Vector3(...p).project(camera);return[(v.x+1)*width/2,(1-v.y)*height/2]});
const area=ps=>Math.abs(ps.reduce((sum,p,i)=>{const n=ps[(i+1)%ps.length];return sum+p[0]*n[1]-n[0]*p[1]},0)/2);
const records=[];
{
 const c=new PerspectiveCamera(fixed.fov,fixed.aspect,fixed.near,fixed.far);c.position.fromArray(fixed.position);c.up.fromArray(fixed.up);c.lookAt(...fixed.target);const scale=Math.min((width-insets.left-insets.right)/1482,(height-insets.top-insets.bottom)/906),x=insets.left+(width-insets.left-insets.right-1482*scale)/2-18*scale,y=insets.top+(height-insets.top-insets.bottom-906*scale)/2-34*scale;c.setViewOffset(fixed.reference.width,fixed.reference.height,fixed.viewOffset[0]-x/scale,fixed.viewOffset[1]-y/scale,width/scale,height/scale);c.updateMatrixWorld();const b=bounds(projection(c,points)),sizes=tiles.map(t=>area(projection(c,t.polygon)));records.push({kind:'current',width:+(b.right-b.left).toFixed(1),height:+(b.bottom-b.top).toFixed(1),boardArea:Math.round(area(projection(c,points))),smallestProperty:Math.round(Math.min(...sizes)),largestProperty:Math.round(Math.max(...sizes))});
}
for(const yaw of[0,25,45])for(const elevation of[35,43,50,60]){
 const c=new PerspectiveCamera(20,width/height,.1,250),a=yaw*Math.PI/180,e=elevation*Math.PI/180,d=90;c.position.set(Math.sin(a)*Math.cos(e)*d,Math.sin(e)*d,Math.cos(a)*Math.cos(e)*d);c.lookAt(0,0,0);c.updateMatrixWorld();
 let b=bounds(projection(c,points));c.zoom=Math.min((width-insets.left-insets.right)/(b.right-b.left),(height-insets.top-insets.bottom)/(b.bottom-b.top));c.updateProjectionMatrix();b=bounds(projection(c,points));const ox=(b.left+b.right)/2-(insets.left+(width-insets.left-insets.right)/2),oy=(b.top+b.bottom)/2-(insets.top+(height-insets.top-insets.bottom)/2);c.setViewOffset(width,height,ox,oy,width,height);c.updateProjectionMatrix();
 b=bounds(projection(c,points));const sizes=tiles.map(t=>area(projection(c,t.polygon)));records.push({yaw,elevation,width:+(b.right-b.left).toFixed(1),height:+(b.bottom-b.top).toFixed(1),boardArea:Math.round(area(projection(c,points))),smallestProperty:Math.round(Math.min(...sizes)),largestProperty:Math.round(Math.max(...sizes))});
}
console.log(JSON.stringify(records,null,2));await mkdir(new URL('assets/3d/reviews/mobile-framing/',root),{recursive:true});await writeFile(new URL('assets/3d/reviews/mobile-framing/study.json',root),JSON.stringify({width,height,insets,records},null,2)+'\n');
