import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import { INNER_RATIO, REFERENCE_OUTLINE, outlineAt, referenceStyleCells } from './referenceStyleLayout';

const area=(points:number[][])=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0))/2;
describe('reference-style native polygon board',()=>{
  it('preserves all official spaces once, in traversal order, without using the concept as catalog',()=>{
    const cells=referenceStyleCells();
    expect(cells.map(c=>c.id)).toEqual(board.tiles.map(t=>t.id));
    expect(cells.filter(c=>c.id==='PR')).toHaveLength(1);
    expect(new Set(cells.map(c=>c.id)).size).toBe(34);
    expect(cells.filter(c=>c.id.startsWith('EVENT'))).toHaveLength(2);
  });
  it('builds planar surfaces in an orthonormal basis, without bilinear texture stretching',()=>{
    const cells=referenceStyleCells();
    for(const cell of cells){
      expect(area(cell.polygon)).toBeGreaterThan(.5);
      expect(cell.u[0]**2+cell.u[1]**2).toBeCloseTo(1,10);
      expect(cell.v[0]**2+cell.v[1]**2).toBeCloseTo(1,10);
      expect(cell.u[0]*cell.v[0]+cell.u[1]*cell.v[1]).toBeCloseTo(0,10);
      for(const [x,z]of cell.polygon){const a=x*cell.u[0]+z*cell.u[1],b=x*cell.v[0]+z*cell.v[1];expect(a*cell.u[0]+b*cell.v[0]).toBeCloseTo(x,10);expect(a*cell.u[1]+b*cell.v[1]).toBeCloseTo(z,10)}
    }
    const ringArea=area(REFERENCE_OUTLINE)*(1-INNER_RATIO**2),painted=cells.reduce((sum,c)=>sum+area(c.polygon),0);
    expect(painted).toBeGreaterThan(ringArea*.90);expect(painted).toBeLessThan(ringArea);
  });
  it('intersects every angle with the same physical outline and keeps each band outside the center',()=>{
    for(let angle=-90;angle<=360;angle+=3){const outer=outlineAt(angle),inner=outlineAt(angle,INNER_RATIO);expect(inner[0]).toBeCloseTo(outer[0]*INNER_RATIO,10);expect(inner[1]).toBeCloseTo(outer[1]*INNER_RATIO,10)}
    for(const cell of referenceStyleCells()){const [x,z]=cell.center;const radius=Math.hypot(x,z),inside=outlineAt(cell.angle,INNER_RATIO),outside=outlineAt(cell.angle);expect(radius).toBeGreaterThan(Math.hypot(...inside));expect(radius).toBeLessThan(Math.hypot(...outside))}
  });
});
