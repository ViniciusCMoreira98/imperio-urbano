import {describe, expect, it} from 'vitest';
import board from '../reference33/layout.json';
import {boardPixelToViewport, surroundingsLayout, surroundingsManifest, type ScreenRect} from './surroundingsLayout';

const viewports=[[1920,1080],[1536,1024],[1366,768],[1024,768],[844,390],[390,844],[768,1024],[320,568]];
const overlaps=(a:ScreenRect,b:ScreenRect)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;

describe('áreas livres ao redor da câmera fixa',()=>{
 for(const [width,height] of viewports)it(`separa tabuleiro, moldura e HUD em ${width}×${height}`,()=>{
  const layout=surroundingsLayout(width,height);
  const areas=[layout.boardViewport,...Object.values(layout.hudSafeAreas)];
  for(const area of areas){
   expect(area.width).toBeGreaterThan(0);expect(area.height).toBeGreaterThan(0);
   expect(area.x).toBeGreaterThanOrEqual(0);expect(area.y).toBeGreaterThanOrEqual(0);
   expect(area.x+area.width).toBeLessThanOrEqual(width+1e-6);expect(area.y+area.height).toBeLessThanOrEqual(height+1e-6);
  }
  for(let i=0;i<areas.length;i++)for(let j=i+1;j<areas.length;j++)expect(overlaps(areas[i],areas[j])).toBe(false);
  expect(layout.boardViewport.width/layout.boardViewport.height).toBeCloseTo(1.5,8);
  for(const pixels of [...board.tiles.map(t=>t.pixels),board.layers.frame.pixels])for(const pixel of pixels){
   const[x,y]=boardPixelToViewport(layout,pixel);
   expect(x).toBeGreaterThanOrEqual(layout.boardViewport.x);expect(y).toBeGreaterThanOrEqual(layout.boardViewport.y);
   expect(x).toBeLessThanOrEqual(layout.boardViewport.x+layout.boardViewport.width);expect(y).toBeLessThanOrEqual(layout.boardViewport.y+layout.boardViewport.height);
   for(const safe of Object.values(layout.hudSafeAreas))expect(x>safe.x&&x<safe.x+safe.width&&y>safe.y&&y<safe.y+safe.height).toBe(false);
  }
  if(layout.orientation==='portrait')expect(layout.hudSafeAreas.side.height).toBeLessThanOrEqual(height*.45);
 });
 it('respeita os retângulos publicados no manifesto de referência',()=>{
  for(const reference of surroundingsManifest.referenceLayouts)expect(surroundingsLayout(reference.viewport.width,reference.viewport.height)).toEqual(reference);
 });
 it('recusa dimensões inválidas antes de publicar coordenadas',()=>{
  for(const size of[0,-1,NaN,Infinity])expect(()=>surroundingsLayout(size,844)).toThrow();
 });
});
