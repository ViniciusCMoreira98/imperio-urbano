import {describe,it,expect} from 'vitest';
import placements from './rentPlacements.json';
import layout from '../board/reference33/layout.json';
function inside(x:number,y:number,p:number[][]){let odd=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)odd=!odd;}return odd;}
describe('placas de aluguel das 26 propriedades',()=>{
 it('cobre só os estados do percurso, sem duplicar ou incluir casas especiais',()=>{
  expect(placements.placements.map(p=>p.stateId)).toEqual(layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>t.stateId));
  expect(new Set(placements.placements.map(p=>p.stateId)).size).toBe(26);
 });
 it('mantém os quatro cantos de cada plaquinha dentro da casa correspondente',()=>{
  for(const rect of placements.placements){const tile=layout.tiles.find(t=>t.id===rect.stateId)!;
   expect(rect.width).toBeGreaterThan(40);expect(rect.height).toBeGreaterThanOrEqual(18);
   for(const x of[rect.x,rect.x+rect.width])for(const y of[rect.y,rect.y+rect.height])expect(inside(x,y,tile.pixels),rect.stateId).toBe(true);
  }
 });
 it('não deixa as plaquinhas de estados vizinhos se cruzarem',()=>{
  const items=placements.placements;
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];expect(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y).toBe(false);}
 });
});
