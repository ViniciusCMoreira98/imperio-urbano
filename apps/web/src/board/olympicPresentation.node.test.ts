import{describe,it,expect}from'vitest';
import{tileAnchor,anchorToWorld}from'./layout';
import layout from'./board34/layout.json';
import{insetOlympicContour,olympicLeaves,olympicLocalContour,OLYMPIC_RELIEF,type OlympicPoint}from'./olympicPresentation';

function clearance(p:OlympicPoint,polygon:readonly OlympicPoint[]){let inside=false,min=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[j],b=polygon[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));min=Math.min(min,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz));if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside?min:-min;}
describe('C10: relevo olímpico junto ao contorno real',()=>{
 it('conserva os contornos arredondados nos quatro lados, com as folgas para a casa vizinha',()=>{
  const rotations=new Set<number>();
  for(const tile of layout.tiles.filter(t=>t.type==='PROPERTY')){const anchor=tileAnchor(tile.index),points=olympicLocalContour(anchor);rotations.add(anchor.rotationY);expect(points.length).toBeGreaterThan(4);points.forEach((p,i)=>{const world=anchorToWorld(anchor,...p);expect(world.x).toBeCloseTo(anchor.polygon[i][0],10);expect(world.z).toBeCloseTo(anchor.polygon[i][1],10);});
   for(const inset of[OLYMPIC_RELIEF.outerInset,OLYMPIC_RELIEF.greenInnerInset])for(const p of insetOlympicContour(points,inset))expect(clearance(p,points)).toBeGreaterThanOrEqual(inset-1e-8);
   for(const leaf of olympicLeaves(points))expect(clearance([leaf.x,leaf.z],points)).toBeGreaterThan(OLYMPIC_RELIEF.leafLength/2+.002-1e-8);
  }expect(rotations.size).toBe(4);
 });
 it('fica abaixo dos modelos e fora das áreas de apoio dos personagens e construções',()=>{
  for(const tile of layout.tiles.filter(t=>t.type==='PROPERTY')){const a=tileAnchor(tile.index),points=olympicLocalContour(a);for(const area of[a.pawnArea,a.buildingArea]){if(!area)continue;for(const x of[area.x-area.width/2,area.x+area.width/2])for(const z of[area.z-area.depth/2,area.z+area.depth/2])expect(clearance([x,z],points)).toBeGreaterThan(OLYMPIC_RELIEF.greenInnerInset);}}
  expect(OLYMPIC_RELIEF.maxHeight).toBeLessThan(.04);
 });
});
