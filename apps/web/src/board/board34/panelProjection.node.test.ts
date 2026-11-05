import{describe,it,expect}from'vitest';
import{PerspectiveCamera,Vector3}from'three';
import{applyFixedCamera}from'../camera/fixedCamera';
import{panelPoint}from'./panelProjection';
import layout from'./layout.json';
describe('diagramação na perspectiva das casas',()=>{
 it('alinha arte e valores à projeção física, inclusive entre os cantos',()=>{
  const camera=new PerspectiveCamera();applyFixedCamera(camera);
  for(const tile of layout.tiles){
   const xs=tile.polygon.map(p=>p[0]),zs=tile.polygon.map(p=>p[2]),left=Math.min(...xs),right=Math.max(...xs),back=Math.min(...zs),front=Math.max(...zs);
   for(const[u,v]of[[0,0],[1,1],[.5,.5],[.2,.75],[.9,.3]]){const projected=new Vector3(left+(right-left)*u,.08,back+(front-back)*v).project(camera),p=panelPoint(tile.panel,u,v);expect(Math.hypot(p[0]-(projected.x+1)*768,p[1]-(1-projected.y)*512),tile.id).toBeLessThan(.001);}
  }
 });
 it('mantém uma grade regular em cada lado e reserva as margens dos valores',()=>{
  for(const side of['north','south','east','west']){
   const tiles=layout.tiles.filter(t=>t.side===side&&!['START','OLYMPICS','REST','AIRPORT'].includes(t.id));const widths=tiles.map(t=>t.anchor.width);expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(.001);
  }
  for(const t of layout.tiles){const r=t.panel.rent;if(!r)continue;expect(r.x).toBeGreaterThan(5);expect(r.y).toBeGreaterThan(5);expect(r.x+r.width).toBeLessThan(t.panel.width-5);expect(r.y+r.height).toBeLessThan(t.panel.height-4);}
 });
});
