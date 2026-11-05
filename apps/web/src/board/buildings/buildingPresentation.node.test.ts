import{describe,it,expect}from'vitest';import{readFileSync,statSync}from'node:fs';import{createHash}from'node:crypto';
import assets from'./buildings.json';import old from'../reference33/layout.json';import current from'../board34/layout.json';import{buildingAsset,propertyBuildingPlacement}from'./buildingPresentation';
function inside(x:number,z:number,points:number[][]){let result=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const[a,,b]=points[i],[c,,d]=points[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)result=!result;}return result;}
describe('construções coerentes com o modal',()=>{
 it('carrega terreno e cinco construções diferentes, apoiados no chão e com a paleta do proprietário separada',()=>{
  const hashes=new Set();let bytes=0;
  for(const asset of assets.models){const path=new URL(`../../../public${asset.model}`,import.meta.url),buffer=readFileSync(path),doc=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());hashes.add(createHash('sha256').update(buffer).digest('hex'));bytes+=statSync(path).size;
   expect(doc.nodes.some((n:{name:string})=>n.name===`PROPERTY_LEVEL_${asset.level}`)).toBe(true);expect(doc.materials.some((m:{name:string})=>m.name==='OWNER_ACCENT')).toBe(true);expect((doc.images??[]).length).toBeGreaterThan(0);expect((doc.images??[]).length).toBeLessThanOrEqual(4);
   const primitive=doc.meshes.flatMap((m:{primitives:any[]})=>m.primitives),position=primitive.map((p:{attributes:{POSITION:number}})=>doc.accessors[p.attributes.POSITION]);
   expect(Math.min(...position.map((a:{min:number[]})=>a.min[1]))).toBeGreaterThanOrEqual(-1e-6);expect(Math.max(...position.map((a:{max:number[]})=>a.max[1]))).toBeCloseTo(asset.height,4);expect(doc.materials.some((m:{pbrMetallicRoughness?:{baseColorTexture?:unknown}})=>m.pbrMetallicRoughness?.baseColorTexture!==undefined)).toBe(true);
   expect(asset.triangles).toBeLessThan(15000);expect(buffer.length).toBeLessThan(2*1024*1024);expect(doc.materials.length).toBeLessThanOrEqual(6);
  }
  expect(hashes.size).toBe(6);expect(bytes).toBeLessThan(12*1024*1024);expect(assets.models.map(a=>a.referenceArtwork)).toEqual(['terrain-v2.png','house-1-v2.png','house-2-v2.png','house-3-v2.png','house-4-v2.png','hotel-v2.png']);
 });
 it('encaixa a família inteira nos tabuleiros de 33 e 34 casas, sem deformar os modelos',()=>{
  for(const layout of[old,current])for(const tile of layout.tiles.filter(t=>t.type==='PROPERTY'))for(let level=0;level<=5;level++){
   const a=tile.anchor,p=propertyBuildingPlacement(a.buildingArea,level)!,asset=buildingAsset(level)!;expect(p.width/asset.width).toBeCloseTo(p.depth/asset.depth,8);expect(p.height/asset.height).toBeCloseTo(p.scale,8);
   for(const sx of[-1,1])for(const sz of[-1,1]){const lx=p.x+sx*p.width/2,lz=p.z+sz*p.depth/2,x=a.x+lx*Math.cos(a.rotationY)+lz*Math.sin(a.rotationY),z=a.z-lx*Math.sin(a.rotationY)+lz*Math.cos(a.rotationY);expect(inside(x,z,tile.polygon),`${layout.id}: ${tile.id}, ${level}`).toBe(true);}
  }
 });
 it('terreno possui arte própria e casas especiais não recebem modelos',()=>{expect(buildingAsset(0)?.referenceArtwork).toBe('terrain-v2.png');expect(propertyBuildingPlacement(null,0)).toBeNull();expect(propertyBuildingPlacement(null,5)).toBeNull();expect(buildingAsset(-1)).toBeNull();expect(buildingAsset(6)).toBeNull();});
});
