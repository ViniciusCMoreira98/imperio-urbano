import {Vector3} from 'three';
import layout from '../../apps/web/src/board/reference33/layout.json';

function clearance(x:number,z:number,polygon:number[][]){
 let inside=false,nearest=Infinity;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [a,,b]=polygon[i],[c,,d]=polygon[j];
  if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;
  const dx=c-a,dz=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)));
  nearest=Math.min(nearest,Math.hypot(x-a-t*dx,z-b-t*dz));
 }
 return inside?nearest:-nearest;
}

/** QA apenas: mede vértices reais em repouso; não muda a cena nem o snapshot. */
export function inspectOccupancy(tileId:string){
 const {scene,camera}=(window as any).__imperioArtScene();
 const tile=layout.tiles.find(t=>t.id===tileId)!;
 const rect=document.querySelector('.board-composition')!.getBoundingClientRect();
 scene.updateMatrixWorld(true);
 const pawns:any[]=[],buildings:any[]=[];
 scene.traverse((mesh:any)=>{
  // Halo de raio 0,25 identifica a raiz real de Pawn, independentemente do avatar.
  if(mesh.geometry?.type==='RingGeometry'&&mesh.geometry.parameters.outerRadius===.25){
   const root=mesh.parent.parent;
   const pixels=[Infinity,Infinity,-Infinity,-Infinity];
   let minClearance=Infinity,vertices=0,minY=Infinity,maxY=-Infinity;
   root.traverse((body:any)=>{
    if(!body.isMesh||body.geometry.type!=='BufferGeometry')return;
    body.skeleton?.update();
    for(let i=0;i<body.geometry.attributes.position.count;i++){
     const point=body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld);
     minClearance=Math.min(minClearance,clearance(point.x,point.z,tile.polygon));
     minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);
     point.project(camera);const x=(point.x+1)*rect.width/2,y=(1-point.y)*rect.height/2;
     pixels[0]=Math.min(pixels[0],x);pixels[1]=Math.min(pixels[1],y);pixels[2]=Math.max(pixels[2],x);pixels[3]=Math.max(pixels[3],y);vertices++;
    }
   });
   pawns.push({vertices,minClearance,heightWorld:maxY-minY,heightPixels:pixels[3]-pixels[1],widthPixels:pixels[2]-pixels[0],pixels});
  }
  // La faixa de dono identifica o grupo de uma propriedade; mede os modelos, sem a faixa.
  if(mesh.geometry?.type==='BoxGeometry'&&mesh.geometry.parameters.height===.012){
   const group=mesh.parent;
   if(Math.hypot(group.position.x-tile.anchor.x,group.position.z-tile.anchor.z)>.001)return;
   for(const child of group.children){
    if(child===mesh)continue;
    let minClearance=Infinity,vertices=0;
    child.traverse((body:any)=>{
     if(!body.isMesh)return;
     for(let i=0;i<body.geometry.attributes.position.count;i++){
      const point=body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld);
      minClearance=Math.min(minClearance,clearance(point.x,point.z,tile.polygon));vertices++;
     }
    });
    if(vertices)buildings.push({vertices,minClearance});
   }
  }
 });
 return {tileId,composition:{width:rect.width,height:rect.height},pawns,buildings};
}
