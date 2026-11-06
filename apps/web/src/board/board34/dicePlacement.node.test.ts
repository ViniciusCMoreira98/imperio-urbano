import{describe,it,expect}from'vitest';
import{PerspectiveCamera,Vector3}from'three';
import layout from'./layout.json';
import{applyTabletopCamera}from'../camera/tabletopViewport';
import{applyFixedCamera}from'../camera/fixedCamera';
import{rollPlan}from'../../dice/rollPlan';
import{tileAnchor,anchorToWorld}from'../layout';
import{pawnSpots}from'../pawnLayout';
import{propertyBuildingPlacement}from'../buildings/buildingPresentation';

function clearance(x:number,z:number,polygon:number[][]){let inside=false,distance=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const[a,,b]=polygon[i],[c,,d]=polygon[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;const dx=c-a,dz=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(z-b)*dz)/(dx*dx+dz*dz)));distance=Math.min(distance,Math.hypot(x-a-t*dx,z-b-t*dz));}return inside?distance:-distance;}
const sphere=(size:number)=>Math.sqrt(3)*size/2;
const sizes=[[1280,720],[1536,1024],[1280,800],[2560,1080],[2560,1440],[3840,2160],[2000,740],[844,390]];
function boxPoints(min:number[],max:number[]){const points:Vector3[]=[];for(const x of[min[0],max[0]])for(const y of[min[1],max[1]])for(const z of[min[2],max[2]])points.push(new Vector3(x,y,z));return points;}
function screenBox(points:Vector3[],camera:PerspectiveCamera){const projected=points.map(p=>p.project(camera));return{left:Math.min(...projected.map(p=>p.x)),right:Math.max(...projected.map(p=>p.x)),bottom:Math.min(...projected.map(p=>p.y)),top:Math.max(...projected.map(p=>p.y))};}
function overlaps(a:ReturnType<typeof screenBox>,b:ReturnType<typeof screenBox>){return a.left<b.right&&a.right>b.left&&a.bottom<b.top&&a.top>b.bottom;}
describe('C9 — dados apoiados no miolo e livres para girar',()=>{
 it('apoia os dois dados na superfície correta e mantém seus pixels calibrados',()=>{
  const camera=new PerspectiveCamera();applyFixedCamera(camera);
  expect(layout.diceRoll.supportY).toBe(layout.layers.center.surfaceY);
  for(const die of layout.dice){expect(die.position[1]-die.size/2).toBeCloseTo(layout.layers.center.surfaceY,10);const p=new Vector3(...die.position as[number,number,number]).project(camera);expect((p.x+1)*768).toBeCloseTo(die.pixel[0],6);expect((1-p.y)*512).toBeCloseTo(die.pixel[1],6);}
 });
 it('mantém a esfera de giro inteira no miolo, acima do piso e separada do outro dado',()=>{
  const boxes=layout.diceRoll.centerBounds;
  layout.dice.forEach((die,i)=>{const r=sphere(die.size),b=boxes[i];expect(b.min[1]-r).toBeGreaterThan(layout.diceRoll.supportY);
   for(const x of[b.min[0],b.max[0]])for(const z of[b.min[2],b.max[2]])expect(clearance(x,z,layout.layers.center.polygon)).toBeGreaterThan(r);
   expect(clearance(die.position[0],die.position[2],layout.layers.center.polygon)).toBeGreaterThan(r);
  });
  expect(boxes[1].min[0]-boxes[0].max[0]).toBeGreaterThan(sphere(layout.dice[0].size)+sphere(layout.dice[1].size));
  expect(layout.diceRoll.horizontalTravel).toBeGreaterThan(.3);expect(layout.diceRoll.bounceHeight).toBeGreaterThan(.3);
 });
 it('não deixa nenhuma extremidade do envelope sair da tela nas proporções do C8',()=>{
  for(const[w,h]of sizes){const camera=new PerspectiveCamera();applyTabletopCamera(camera,w,h);
   layout.dice.forEach((die,i)=>{const b=layout.diceRoll.centerBounds[i],r=sphere(die.size);
    for(const x of[b.min[0]-r,b.max[0]+r])for(const y of[b.min[1]-r,b.max[1]+r])for(const z of[b.min[2]-r,b.max[2]+r]){const p=new Vector3(x,y,z).project(camera);expect(Math.abs(p.x)).toBeLessThan(1);expect(Math.abs(p.y)).toBeLessThan(1);}
    const p=new Vector3(...die.position as[number,number,number]),a=p.clone().add(new Vector3(-die.size/2,0,0)).project(camera),c=p.clone().add(new Vector3(die.size/2,0,0)).project(camera);expect(Math.abs(c.x-a.x)*w/2).toBeGreaterThan(w===844?20:35);
   });
  }
 });
 it('os planos da animação existente respeitam o envelope novo, inclusive sorteios extremos',()=>{
  for(const value of[0,.01,.5,.99,.999999])layout.dice.forEach((die,i)=>{const p=rollPlan(i,die,layout.diceRoll,()=>value),b=layout.diceRoll.centerBounds[i];for(const point of p.air)point.forEach((v,axis)=>{expect(v).toBeGreaterThanOrEqual(b.min[axis]);expect(v).toBeLessThanOrEqual(b.max[axis]);});});
 });
 it('a projeção de peões e construções deixa os dois dados de repouso inteiramente visíveis',()=>{
  const camera=new PerspectiveCamera();applyFixedCamera(camera);
  // Testa o volume desenhado em repouso. A caixa do envelope contém também espaço vazio:
  // sua projeção pode se cruzar com peças distantes sem que um dado seja encoberto.
  const swept=layout.dice.map(die=>{const half=die.size/2;return screenBox(boxPoints([-half,-half,-half],[half,half,half]).map(p=>{p.applyAxisAngle(new Vector3(0,1,0),die.yaw);return p.add(new Vector3(...die.position as[number,number,number]));}),camera);});
  for(const tile of layout.tiles){const a=tileAnchor(tile.index),pawns=Array.from({length:4},(_,seat)=>({id:`p${seat}`,position:tile.index,seat}));
   for(const p of pawnSpots(pawns).values()){const box=screenBox(boxPoints([p.x-.30,p.y,p.z-.30],[p.x+.30,p.y+1.05,p.z+.30]),camera);for(const die of swept)expect(overlaps(box,die),`${tile.id}: peão ${JSON.stringify({box,die})}`).toBe(false);}
   if(!a.buildingArea)continue;
   for(let level=0;level<=5;level++){const b=propertyBuildingPlacement(a.buildingArea,level)!;const points=boxPoints([-b.width/2,0,-b.depth/2],[b.width/2,b.height,b.depth/2]).map(p=>{const w=anchorToWorld(a,b.x+p.x,b.z+p.z);return new Vector3(w.x,a.surfaceY+p.y,w.z);});const box=screenBox(points,camera);for(const die of swept)expect(overlaps(box,die),`${tile.id}: construção ${level}`).toBe(false);}
  }
 });
});
