import {describe,it,expect} from 'vitest';
import {Matrix4,PerspectiveCamera,Plane,Vector3,Vector4} from 'three';
import {applyFixedCamera} from '../camera/fixedCamera';
import layout from './layout.json';

const corners=(min:number[],max:number[])=>[min[0],max[0]].flatMap(x=>[min[1],max[1]].flatMap(y=>[min[2],max[2]].map(z=>new Vector3(x,y,z))));
const camera=new PerspectiveCamera();applyFixedCamera(camera);
const matrix=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
const row=(n:number)=>new Vector4(...[0,1,2,3].map(i=>matrix.elements[i*4+n]) as [number,number,number,number]);
// Planos de uma janela com margem de 8 px, derivados da câmera real.
const planes=[row(3).clone().multiplyScalar(1-16/1536).add(row(0)),row(3).clone().multiplyScalar(1-16/1536).sub(row(0)),row(3).clone().multiplyScalar(1-16/1024).add(row(1)),row(3).clone().multiplyScalar(1-16/1024).sub(row(1))].map(v=>new Plane(new Vector3(v.x,v.y,v.z),v.w).normalize());

describe('espaço de rolagem dos dados na câmera fixa',()=>{
 it('mantém a esfera de qualquer orientação no quadro e após a moldura',()=>{
  const frameZ=Math.max(...layout.layers.frame.polygon.map(p=>p[2]));
  layout.dice.forEach((die,i)=>{
   const radius=die.size*Math.sqrt(3)/2;
   const bounds=layout.diceRoll.centerBounds[i];
   for(const center of corners(bounds.min,bounds.max)){
    for(const plane of planes)expect(plane.distanceToPoint(center)).toBeGreaterThan(radius);
    expect(center.z-radius).toBeGreaterThan(frameZ+.02);
    expect(center.y-radius).toBeGreaterThanOrEqual(layout.diceRoll.supportY-1e-9);
   }
   expect(die.position[1]-die.size/2).toBeCloseTo(layout.diceRoll.supportY,8);
   // Pouso: orientar a face antes de baixar verticalmente, com yaw fixo.
   const halfWidth=die.size/2*(Math.abs(Math.cos(die.yaw))+Math.abs(Math.sin(die.yaw)));
   for(const point of corners([die.position[0]-halfWidth,layout.diceRoll.supportY,die.position[2]-halfWidth],[die.position[0]+halfWidth,die.position[1]+die.size/2,die.position[2]+halfWidth])){
    for(const plane of planes)expect(plane.distanceToPoint(point)).toBeGreaterThan(0);
    expect(point.z).toBeGreaterThan(frameZ+.02);
   }
  });
 });
 it('separa os envelopes dos dois dados mesmo em giro livre simultâneo',()=>{
  const [a,b]=layout.diceRoll.centerBounds;
  const gap=Math.max(0,b.min[0]-a.max[0],a.min[0]-b.max[0]);
  expect(gap).toBeGreaterThan(layout.dice.reduce((sum,d)=>sum+d.size*Math.sqrt(3)/2,0));
 });
 it('mantém o envelope no recorte sem decoração do fundo',()=>{
  const hole=layout.layers.backdrop.worldHoles[1].map(p=>[p[0],p[2]]);
  function inside(x:number,z:number){let odd=false;for(let i=0,j=hole.length-1;i<hole.length;j=i++){const[a,b]=hole[i],[c,d]=hole[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)odd=!odd;}return odd;}
  layout.dice.forEach((die,i)=>{const r=die.size*Math.sqrt(3)/2;const b=layout.diceRoll.centerBounds[i];for(const x of[b.min[0]-r,b.max[0]+r])for(const z of[b.min[2]-r,b.max[2]+r])expect(inside(x,z)).toBe(true);});
 });
});
