import{describe,it,expect,vi}from'vitest';
import{readFileSync,statSync}from'node:fs';
import{PerspectiveCamera,Vector3}from'three';
import layout from'./layout.json';
import proposal from'../../special-tiles/proposedBoard34.json';
import{applyFixedCamera}from'../camera/fixedCamera';
// Exercita os helpers reais de peças com o catálogo futuro, sem alterar o catálogo de produção.
vi.mock('@imperio/game-data',async importOriginal=>{
 const original=await importOriginal<typeof import('@imperio/game-data')>();const {default:visual}=await import('./layout.json');
 return{...original,board:{...original.board,tiles:visual.tiles.map(t=>({id:t.id,index:t.index,type:t.type==='AIRPORT'?'NATIONAL_TRAVEL':t.type,stateId:t.stateId}))}};
});
import{tileAnchor,anchorToWorld}from'../layout';
import{pawnSpots,PAWN_RADIUS}from'../pawnLayout';
import{buildingPlacement,ownerStrip}from'../buildingLayout';
function clearance(x:number,z:number,polygon:[number,number][]){let odd=false,nearest=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const[a,b]=polygon[i],[c,d]=polygon[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)odd=!odd;const dx=c-a,dz=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)));nearest=Math.min(nearest,Math.hypot(x-a-t*dx,z-b-t*dz));}return odd?nearest:-nearest;}

describe('tabuleiro físico de 34 casas',()=>{
 it('materializa toda a sequência pedida, com RN antes de AM e Saque na antiga faixa',()=>{
  expect(layout.tiles.map(t=>t.id)).toEqual(proposal.tiles.map(t=>t.id));expect(layout.tiles).toHaveLength(34);expect(layout.tiles.filter(t=>t.type==='PROPERTY')).toHaveLength(26);expect(new Set(layout.tiles.map(t=>t.id)).size).toBe(34);expect(tileAnchor(1).id).toBe('RN');expect(tileAnchor(2).id).toBe('AM');expect(tileAnchor(30).id).toBe('SAQUE');
 });
 it('projeta os polígonos e âncoras reais na câmera calibrada, sem deformação de screenshot',()=>{
  const camera=new PerspectiveCamera();applyFixedCamera(camera);
  for(const tile of layout.tiles){expect(tileAnchor(tile.index).id).toBe(tile.id);for(let i=0;i<tile.polygon.length;i++){const p=new Vector3().fromArray(tile.polygon[i]).project(camera);expect(Math.hypot((p.x+1)*768-tile.pixels[i][0],(1-p.y)*512-tile.pixels[i][1])).toBeLessThan(.001);}}
 });
 it('mantém as bases de um a quatro personagens dentro de todas as novas casas',()=>{
  for(const tile of layout.tiles){const anchor=tileAnchor(tile.index);for(let count=1;count<=4;count++){const pawns=Array.from({length:count},(_,seat)=>({id:`p${seat}`,position:tile.index,seat}));for(const spot of pawnSpots(pawns).values())expect(clearance(spot.x,spot.z,anchor.polygon),`${tile.id}: ${count} jogadores`).toBeGreaterThanOrEqual(PAWN_RADIUS-1e-6);}}
 });
 it('acomoda construções e faixas dos donos nos polígonos reais',()=>{
  for(const tile of layout.tiles.filter(t=>t.type==='PROPERTY')){const anchor=tileAnchor(tile.index);const fits=(x:number,z:number,w:number,d:number)=>{for(const sx of[-1,1])for(const sz of[-1,1]){const point=anchorToWorld(anchor,x+sx*w/2,z+sz*d/2);expect(clearance(point.x,point.z,anchor.polygon),tile.id).toBeGreaterThanOrEqual(-1e-6);}};const strip=ownerStrip(anchor);fits(0,strip.z,strip.width,strip.depth);for(let level=1;level<=5;level++){const b=buildingPlacement(anchor,level);for(const[x,z]of b.houses)fits(x,z,b.houseSize,b.houseSize);if(b.hotel)fits(b.hotel.x,b.hotel.z,b.hotel.width,b.hotel.depth);}}
 });
 it('publica 34 objetos físicos independentes, corpo, centro e moldura no GLB',()=>{
  const path=new URL('../../../public/models/board/board34-v01.glb',import.meta.url),bytes=readFileSync(path),doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  for(const tile of layout.tiles)expect(doc.nodes.filter((n:{name:string})=>n.name===tile.modelNode)).toHaveLength(1);
  for(const name of['BOARD_BODY','CENTER_ART','FRAME_GOLD'])expect(doc.nodes.some((n:{name:string})=>n.name===name)).toBe(true);
  expect(doc.images??[]).toHaveLength(0);expect(statSync(path).size).toBeLessThan(1024*1024);expect(statSync(new URL('../../../public/models/board/board34-atlas-v01.webp',import.meta.url)).size).toBeLessThan(2*1024*1024);
 });
});
