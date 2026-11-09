import { board } from '@imperio/game-data';

export type Point = [number, number];
export interface ReferenceCell { id: string; index: number; side: number; angle: number; polygon: Point[]; center: Point; u: Point; v: Point }
export const REFERENCE_OUTLINE: Point[] = [[0,-6.7],[5.5,-4.55],[8,1.25],[5.15,5],[0,6.7],[-5.15,5],[-8.35,1.25],[-5.5,-4.55]];
export const INNER_RATIO = .70;
/** Ray/polygon intersection: genuine planar geometry, never a warped rectangle. */
export function outlineAt(degrees: number, scale = 1): Point {
  const a=degrees*Math.PI/180, dx=Math.sin(a), dz=-Math.cos(a);
  for(let i=0;i<REFERENCE_OUTLINE.length;i++) {
    const p=REFERENCE_OUTLINE[i], q=REFERENCE_OUTLINE[(i+1)%8], ex=q[0]-p[0], ez=q[1]-p[1];
    const cross=dx*ez-dz*ex;
    if(Math.abs(cross)<1e-9)continue;
    const t=(p[0]*ez-p[1]*ex)/cross, s=(p[0]*dz-p[1]*dx)/cross;
    if(t>0&&s>=-1e-7&&s<=1+1e-7)return[dx*t*scale,dz*t*scale];
  }
  throw new Error(`Ray outside outline: ${degrees}`);
}
export function referenceStyleCells(): ReferenceCell[] {
  const corners=[0,8,17,26], centers=new Map<number,number>(),ranges=new Map<number,[number,number]>();
  corners.forEach((start,side)=>{
    const end=corners[side+1]??34, a=-45+side*90;
    centers.set(start,a);
    ranges.set(start,[a-9,a+9]);
    const step=72/(end-start-1);
    for(let i=start+1;i<end;i++){
      const from=a+9+(i-start-1)*step;
      centers.set(i,from+step/2);ranges.set(i,[from,from+step]);
    }
  });
  return board.tiles.map((tile,index)=>{
    const angle=centers.get(index)!,range=ranges.get(index)!;
    const from=range[0]+.18,to=range[1]-.18;
    // The side tips sit forward of the center. Use actual vertex angles, not multiples of 45°.
    const vertices=REFERENCE_OUTLINE.map(([x,z])=>{const a=Math.atan2(x,-z)*180/Math.PI;return a < -90 ? a+360 : a});
    const angles=[from,...vertices.filter(a=>a>from&&a<to).sort((a,b)=>a-b),to];
    const outer=angles.map(a=>outlineAt(a,.991)), inner=[...angles].reverse().map(a=>outlineAt(a,INNER_RATIO));
    const center=outlineAt(angle,(1+INNER_RATIO)/2), side=corners.filter(i=>index>=i).length-1;
    // Text remains upright. Side cards use the radial width, top/bottom cards the tangent.
    const edge:Point=[outer[outer.length-1][0]-outer[0][0],outer[outer.length-1][1]-outer[0][1]],edgeLength=Math.hypot(...edge);
    const heading=(side===1?from:to)*Math.PI/180;
    let u:Point=side===0||side===2?[edge[0]/edgeLength,edge[1]/edgeLength]:[Math.sin(heading),-Math.cos(heading)];
    if(u[0]<0)u=[-u[0],-u[1]];
    // Corner symbols and titles face the viewer, independently of the diagonal panel.
    if(corners.includes(index)||tile.id==='SAQUE'||tile.id==='EVENT_EAST')u=[1,0];
    const v:Point=[-u[1],u[0]];
    return{id:tile.id,index,side,angle,polygon:[...outer,...inner],center,u,v};
  });
}
