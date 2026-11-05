import{readFile,writeFile,mkdir}from'node:fs/promises';
import{PerspectiveCamera,Vector3}from'three';
const root=new URL('../../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const old=await read('apps/web/src/board/reference33/layout.json');
const proposal=await read('apps/web/src/special-tiles/proposedBoard34.json');
const calibration=await read('apps/web/src/board/camera/fixedCamera.json');
const camera=new PerspectiveCamera(calibration.fov,calibration.aspect,calibration.near,calibration.far);camera.position.fromArray(calibration.position);camera.up.fromArray(calibration.up);camera.lookAt(...calibration.target);camera.setViewOffset(1536,1024,...calibration.viewOffset,1536,1024);camera.updateMatrixWorld(true);
const project=p=>{const v=new Vector3(...p).project(camera);return[(v.x+1)*768,(1-v.y)*512];};
const sides={north:['RN','AM','RR','EVENT_NORTH','AP','PA','RO'],east:['AC','MT','MS','GO','EVENT_EAST','DF','MG','ES'],south:['PB','PE','SC','RS','TAX','SP','PR','RJ'],west:['MA','PI','CE','SAQUE','AL','SE','BA']};
const boxes=new Map();const gap=.045;
const scaleBox=b=>({...b,left:-.125+(b.left+.125)*.94,right:-.125+(b.right+.125)*.94});
for(const[side,ids]of Object.entries(sides))ids.forEach((id,i)=>{
 if(side==='north'||side==='south'){const step=8.2/ids.length,left=-4.2+step*i+gap/2,right=-4.2+step*(i+1)-gap/2;boxes.set(id,{side,left,right,back:side==='north'?-6.25:3.94,front:side==='north'?-3.94:5.5});}
 else{const step=7.8/ids.length;boxes.set(id,{side,left:side==='west'?-6.25:4.04,right:side==='west'?-4.24:6,back:-3.9+step*i+gap/2,front:-3.9+step*(i+1)-gap/2});}
});
for(const[id,side,left,right,back,front]of[['START','north',-6.25,-4.24,-6.25,-3.94],['OLYMPICS','north',4.04,6,-6.25,-3.94],['REST','south',4.04,6,3.94,5.5],['AIRPORT','south',-6.25,-4.24,3.94,5.5]])boxes.set(id,{side,left,right,back,front});
function rounded({left,right,back,front},radius,height){
 const p=[];for(const[cx,cz,a]of[[right-radius,back+radius,-Math.PI/2],[right-radius,front-radius,0],[left+radius,front-radius,Math.PI/2],[left+radius,back+radius,Math.PI]])for(let i=0;i<=4;i++){const angle=a+i*Math.PI/8;p.push([cx+Math.cos(angle)*radius,height,cz+Math.sin(angle)*radius]);}return p;
}
const rectOf=points=>{const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return{x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};};
function globalRect(panel,r){const[a,b,,d]=panel.quad;return rectOf([[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.height],[r.x,r.y+r.height]].map(([x,y])=>[a[0]+(b[0]-a[0])*x/panel.width+(d[0]-a[0])*y/panel.height,a[1]+(b[1]-a[1])*x/panel.width+(d[1]-a[1])*y/panel.height]));}
const tiles=proposal.tiles.map(({id,index})=>{
 const previous=old.tiles.find(t=>t.id===(id==='SAQUE'?'RN':id)),box=scaleBox(boxes.get(id));const type=id==='SAQUE'?'SAQUE':previous.type;
 const polygon=rounded(box,type==='PROPERTY'?.07:.15,.08),quad=[[box.left,.08,box.back],[box.right,.08,box.back],[box.right,.08,box.front],[box.left,.08,box.front]].map(project);
 const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);const width=(length(quad[0],quad[1])+length(quad[2],quad[3]))/2,height=(length(quad[0],quad[3])+length(quad[1],quad[2]))/2;
 const horizontal=box.side==='east'||box.side==='west';
 const rent=type==='PROPERTY'?horizontal?{x:width*.49,y:height-21,width:width*.45,height:16}:{x:width*.12,y:height-24,width:width*.76,height:18}:null;
 const panel={quad,width,height,horizontal,rent};const rotationY={north:Math.PI,east:Math.PI/2,south:0,west:-Math.PI/2}[box.side];
 const w=horizontal?box.front-box.back:box.right-box.left,depth=horizontal?box.right-box.left:box.front-box.back;
 const anchor={x:(box.left+box.right)/2,z:(box.back+box.front)/2,surfaceY:.08,rotationY,width:w,depth,selectedLift:0,pawnArea:{x:0,z:type==='PROPERTY'?depth*.10:0,width:w*.76,depth:depth*.52},buildingArea:type==='PROPERTY'?{x:0,z:-depth*.31,width:w*.76,depth:depth*.20}:null};
 return{...previous,id,index,type,stateId:type==='PROPERTY'?id:null,label:id==='SAQUE'?'Saque':previous.label,side:box.side,pixels:polygon.map(project),polygon,anchor,modelNode:'TILE_'+id,panel,rentRect:rent?globalRect(panel,rent):null};
});
const frameBox=scaleBox({left:-6.52,right:6.27,back:-6.52,front:5.77}),innerBox=scaleBox({left:-6.36,right:6.11,back:-6.36,front:5.61});
const outer=rounded(frameBox,.4,0),frame={pixels:outer.map(project),polygon:outer,innerPixels:rounded(innerBox,.28,.025).map(project),surfaceY:.025,inner:rounded(innerBox,.28,.025),top:rounded(frameBox,.4,.025)};
const centerPolygon=rounded(scaleBox({left:-4.20,right:4,back:-3.9,front:3.9}),.05,.035),center={pixels:centerPolygon.map(project),polygon:centerPolygon,surfaceY:.035};
const tax=tiles.find(t=>t.id==='TAX'),taxPanel=tax.panel;taxPanel.pool={x:taxPanel.width*.12,y:taxPanel.height-40,width:taxPanel.width*.76,height:30};
const out={schemaVersion:2,id:'board34-v03',tileCount:34,model:'/models/board/board34-v01.glb',atlas:'/models/board/board34-atlas-v01.webp',nativeReference:{width:1536,height:1024},tileHeight:.08,tiles,layers:{frame,center},dice:old.dice,diceRoll:old.diceRoll,taxPoolRect:globalRect(taxPanel,taxPanel.pool),integration:{catalogRequired:34,cameraLocked:true,rulesIncluded:false,sourcePhotoPixelsUsed:false,anchorsRevision:3},paidMeshyCredits:50};
await mkdir(new URL('apps/web/src/board/board34/',root),{recursive:true});await writeFile(new URL('apps/web/src/board/board34/layout.json',root),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({tiles:tiles.length,uniformSideSpacing:true,states:tiles.filter(t=>t.type==='PROPERTY').length}));
