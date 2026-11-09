import{it,expect}from'vitest';
import{board}from'@imperio/game-data';
import{approvedCompositionCells,approvedCompositionFit,COMPOSITION}from'./approvedCompositionLayout';
function intersects(a:{x:number;y:number;width:number;height:number},b:typeof a){return a.x<b.x+b.width-.01&&a.x+a.width>b.x+.01&&a.y<b.y+b.height-.01&&a.y+a.height>b.y+.01}
it('preserves all 34 official IDs in traversal order with no overlapping cells or centre',()=>{
 const cells=approvedCompositionCells();expect(cells.map(c=>c.id)).toEqual(board.tiles.map(t=>t.id));expect(cells.filter(c=>c.id==='PR')).toHaveLength(1);
 for(let i=0;i<cells.length;i++){expect(intersects(cells[i],{x:COMPOSITION.innerLeft,y:COMPOSITION.innerTop,width:COMPOSITION.innerWidth,height:COMPOSITION.innerHeight})).toBe(false);for(let j=i+1;j<cells.length;j++)expect(intersects(cells[i],cells[j]),`${cells[i].id}/${cells[j].id}`).toBe(false)}
 for(const tile of board.tiles.filter(t=>t.type==='PROPERTY')){const c=cells.find(c=>c.id===tile.id)!;expect(c.width/c.height).toBeCloseTo(c.orientation==='portrait'?.75:3)}
});
it('keeps the full board clear of all four player panels and right controls at phone and desktop sizes',()=>{
 for(const[width,height]of[[667,280],[800,360],[932,430],[1360,768],[1360,900]]){const f=approvedCompositionFit(width,height),b={x:(width-COMPOSITION.width*f.scale)/2,y:(height-COMPOSITION.height*f.scale)/2,width:COMPOSITION.width*f.scale,height:COMPOSITION.height*f.scale};
  expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);
  for(const x of[f.margin,width-f.margin-f.playerWidth])for(const y of[f.margin,height-f.margin-f.playerHeight])expect(intersects(b,{x,y,width:f.playerWidth,height:f.playerHeight})).toBe(false);
  expect(b.x+b.width).toBeLessThan(width-f.margin-f.controlSize);
 }
});
