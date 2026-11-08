import{it,expect}from'vitest';
import base from'./layout.json';
import{createSpaciousLayout}from'./spaciousLayout';
const area=(p:number[][])=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[2]-b[0]*a[2]},0))/2;
function overlap(a:number[][],b:number[][]){return[a,b].flatMap(poly=>poly.map((p,i)=>{const q=poly[(i+1)%poly.length];return[-(q[2]-p[2]),q[0]-p[0]]})).every(([x,z])=>{const pa=a.map(p=>p[0]*x+p[2]*z),pb=b.map(p=>p[0]*x+p[2]*z);return Math.max(...pa)>Math.min(...pb)+1e-6&&Math.max(...pb)>Math.min(...pa)+1e-6})}
it('expands every state without overlap, reduces only the centre, and keeps the outside frame and official order',()=>{
 const next=createSpaciousLayout();expect(next.layers.frame).toEqual(base.layers.frame);
 expect(next.tiles.map(t=>t.id)).toEqual(base.tiles.map(t=>t.id));
 expect(area(next.layers.center.polygon)/area(base.layers.center.polygon)).toBeCloseTo(.76**2);
 for(const t of next.tiles){if(t.type==='PROPERTY')expect(area(t.polygon)/area(base.tiles.find(b=>b.id===t.id)!.polygon)).toBeGreaterThan(1.2);expect(overlap(t.polygon,next.layers.center.polygon)).toBe(false);}
 for(let i=0;i<next.tiles.length;i++)for(let j=i+1;j<next.tiles.length;j++)expect(overlap(next.tiles[i].polygon,next.tiles[j].polygon),`${next.tiles[i].id}/${next.tiles[j].id}`).toBe(false);
});
