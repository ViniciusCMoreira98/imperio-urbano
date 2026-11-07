/** Low-relief ornament: all coordinates stay in a narrow band inside the real tile. */
export type OlympicPoint = readonly [number, number];
export const OLYMPIC_RELIEF = { outerInset: 0.014, goldInnerInset: 0.028, greenOuterInset: 0.014, greenInnerInset: 0.054, leafInset: 0.031, leafLength: 0.052, leafWidth: 0.016, maxHeight: 0.031 } as const;
const cross=(a:OlympicPoint,b:OlympicPoint)=>a[0]*b[1]-a[1]*b[0];

export function olympicLocalContour(anchor:{x:number;z:number;rotationY:number;polygon:readonly OlympicPoint[]}):[number,number][] {
  const c=Math.cos(anchor.rotationY),s=Math.sin(anchor.rotationY);
  return anchor.polygon.map(([x,z])=>[(x-anchor.x)*c-(z-anchor.z)*s,(x-anchor.x)*s+(z-anchor.z)*c]);
}

/** Exact intersection of inward-offset convex edges; no rectangular approximation. */
export function insetOlympicContour(points:readonly OlympicPoint[],distance:number):[number,number][] {
  const area=points.reduce((sum,p,i)=>sum+cross(p,points[(i+1)%points.length]),0),sign=area>=0?1:-1;
  const edge=(i:number)=>{const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);return{p:[a[0]-sign*dz/length*distance,a[1]+sign*dx/length*distance] as OlympicPoint,d:[dx,dz] as OlympicPoint};};
  return points.map((_,i)=>{const a=edge((i+points.length-1)%points.length),b=edge(i),denom=cross(a.d,b.d);if(Math.abs(denom)<1e-9)return[b.p[0],b.p[1]];const t=cross([b.p[0]-a.p[0],b.p[1]-a.p[1]],b.d)/denom;return[a.p[0]+t*a.d[0],a.p[1]+t*a.d[1]];});
}

export function olympicLeaves(points:readonly OlympicPoint[]) {
  const edge=insetOlympicContour(points,OLYMPIC_RELIEF.leafInset);
  return edge.flatMap((a,i)=>{const b=edge[(i+1)%edge.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.18)return[];const count=Math.floor(length/.14),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);return Array.from({length:count},(_,j)=>{const t=(j+.5)/count;return{x:a[0]+t*(b[0]-a[0]),z:a[1]+t*(b[1]-a[1]),angle:angle+(j%2?-.48:.48)};});});
}
