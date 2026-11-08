import{it,expect}from'vitest';
import{createRectangularLayout}from'./rectangularLayout';
it('keeps all 26 properties rectangular, equal-sized and separate from the centre and neighbouring cells',()=>{
 const layout=createRectangularLayout(),properties=layout.tiles.filter(t=>t.type==='PROPERTY');expect(properties).toHaveLength(26);
 const bounds=(p:number[][])=>({left:Math.min(...p.map(v=>v[0])),right:Math.max(...p.map(v=>v[0])),top:Math.min(...p.map(v=>v[2])),bottom:Math.max(...p.map(v=>v[2]))});
 const overlap=(a:ReturnType<typeof bounds>,b:ReturnType<typeof bounds>)=>a.left<b.right-1e-5&&a.right>b.left+1e-5&&a.top<b.bottom-1e-5&&a.bottom>b.top+1e-5;
 for(const t of properties){expect(t.anchor.width).toBe(1);expect(t.anchor.depth).toBe(3);for(let i=0;i<4;i++){const a=t.polygon[i],b=t.polygon[(i+1)%4],c=t.polygon[(i+2)%4];expect((b[0]-a[0])*(c[0]-b[0])+(b[2]-a[2])*(c[2]-b[2])).toBeCloseTo(0,10)}}
 for(let i=0;i<layout.tiles.length;i++){expect(overlap(bounds(layout.tiles[i].polygon),bounds(layout.layers.center.polygon))).toBe(false);for(let j=i+1;j<layout.tiles.length;j++)expect(overlap(bounds(layout.tiles[i].polygon),bounds(layout.tiles[j].polygon))).toBe(false);}
});
