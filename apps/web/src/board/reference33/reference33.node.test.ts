import{describe,it,expect}from'vitest';import{readFileSync}from'node:fs';import{PerspectiveCamera,Vector3}from'three';import{applyFixedCamera}from'../camera/fixedCamera';import layout from'./layout.json';
describe('33 casas na posição da imagem aprovada',()=>{
 it('preserva a sequência visual, 26 UFs e dois Eventos, sem TO',()=>{
  expect(layout.tiles.map(t=>t.id)).toEqual(['START','AM','RR','EVENT_NORTH','AP','PA','RO','OLYMPICS','AC','MT','MS','GO','EVENT_EAST','DF','MG','ES','REST','RJ','PR','SP','TAX','RS','SC','PE','PB','AIRPORT','BA','SE','AL','RN','CE','PI','MA']);
  const states=layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>t.stateId);expect(states).toHaveLength(26);expect(new Set(states).size).toBe(26);expect(states).not.toContain('TO');expect(layout.tiles.filter(t=>t.type==='EVENT')).toHaveLength(2);
 });
 it('projeta todos os vértices das casas de volta aos pixels originais, sem escala arbitrária',()=>{
  const camera=new PerspectiveCamera();applyFixedCamera(camera);
  for(const tile of layout.tiles){expect(tile.anchor.surfaceY).toBe(.08);expect(tile.anchor.width).toBeGreaterThan(0);expect(tile.anchor.depth).toBeGreaterThan(0);
   tile.polygon.forEach((point,i)=>{const p=new Vector3().fromArray(point).project(camera);expect(Math.hypot((p.x+1)*768-tile.pixels[i][0],(1-p.y)*512-tile.pixels[i][1])).toBeLessThan(.001);});
  }
 });
 it('publica 33 objetos de casa independentes no GLB do Blender',()=>{
  const bytes=readFileSync(new URL('../../../public/models/board/reference33-v01.glb',import.meta.url));
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
  for(const tile of layout.tiles)expect(json.nodes.filter((node:{name:string})=>node.name===tile.modelNode)).toHaveLength(1);
  expect(json.materials.some((m:{name:string})=>m.name==='GoldSides')).toBe(true);expect(json.materials.some((m:{name:string})=>m.name==='PrintedArtwork')).toBe(true);
 });
});
