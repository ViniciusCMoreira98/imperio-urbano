import{describe,it,expect}from'vitest';
import{PerspectiveCamera,Vector3}from'three';
import{applyFixedCamera,FIXED_CAMERA}from'./fixedCamera';
import{applyTabletopCamera,tabletopDpr,tabletopViewport}from'./tabletopViewport';
import layout from '../board34/layout.json';

describe('mesa contínua em toda a janela',()=>{
 it('encaixa a câmera móvel entre as reservas do HUD e restaura a calibração ao voltar ao computador',()=>{
  const reference=new PerspectiveCamera();applyFixedCamera(reference);
  for(const[w,h]of[[667,300],[800,280],[800,330],[915,412]]){
   const camera=new PerspectiveCamera(),insets={left:125,right:125,top:20,bottom:6};applyTabletopCamera(camera,w,h,'mobile-landscape',insets);
   for(const p of layout.layers.frame.polygon){const v=new Vector3(...p as[number,number,number]).project(camera),x=(v.x+1)*w/2,y=(1-v.y)*h/2;expect(x).toBeGreaterThanOrEqual(insets.left);expect(x).toBeLessThanOrEqual(w-insets.right);expect(y).toBeGreaterThanOrEqual(insets.top);expect(y).toBeLessThanOrEqual(h-insets.bottom);}
   applyTabletopCamera(camera,1280,720,'standard');expect(camera.zoom).toBe(1);expect(camera.matrixWorld.toArray()).toEqual(reference.matrixWorld.toArray());
  }
 });
 it('amplia a apresentação da praia sem cortar o quadro nem mudar a pose',()=>{
  const original=new PerspectiveCamera();applyFixedCamera(original);
  for(const[w,h]of[[1280,720],[1920,1080],[844,390],[667,375]]){
   const camera=new PerspectiveCamera(),fit=applyTabletopCamera(camera,w,h,'immersive');
   expect(camera.matrixWorld.toArray()).toEqual(original.matrixWorld.toArray());
   expect(fit.scale).toBeGreaterThan(tabletopViewport(w,h-64).scale);
   expect(fit.x+18*fit.scale).toBeGreaterThanOrEqual(0);
   expect(fit.x+1500*fit.scale).toBeLessThanOrEqual(w);
   expect(fit.y+34*fit.scale).toBeGreaterThanOrEqual(fit.top-1e-6);
   expect(fit.y+940*fit.scale).toBeLessThanOrEqual(h-fit.bottom+1e-6);
  }
 });
 it('preserva a pose e projeta a calibração por escala uniforme em todas as proporções',()=>{
  const original=new PerspectiveCamera();applyFixedCamera(original);
  for(const[w,h]of[[1280,720],[1536,1024],[1280,800],[2560,1080],[3840,2160],[2000,740],[844,390]]){
   const camera=new PerspectiveCamera(),fit=applyTabletopCamera(camera,w,h);expect(camera.matrixWorld.toArray()).toEqual(original.matrixWorld.toArray());
   for(const point of[[0,0,0],[-5,.3,-5],[5,.3,5]]){
    const a=new Vector3(...point as[number,number,number]).project(original),b=new Vector3(...point as[number,number,number]).project(camera);
    expect((b.x+1)*w/2).toBeCloseTo(fit.x+(a.x+1)*FIXED_CAMERA.reference.width/2*fit.scale,5);
    expect((1-b.y)*h/2).toBeCloseTo(fit.y+(1-a.y)*FIXED_CAMERA.reference.height/2*fit.scale,5);
   }
   expect(fit.x+18*fit.scale).toBeGreaterThanOrEqual(0);expect(fit.x+1500*fit.scale).toBeLessThanOrEqual(w);
   expect(fit.y+34*fit.scale).toBeGreaterThanOrEqual(fit.top-1e-6);expect(fit.y+940*fit.scale).toBeLessThanOrEqual(h-fit.bottom+1e-6);
  }
 });
 it('limita o custo de desenho em 4K mantendo supersampling nas telas menores',()=>{
  expect(tabletopDpr(3840,2160,2)).toBeCloseTo(1.00566,4);expect(tabletopDpr(1280,720,2)).toBe(2);expect(tabletopDpr(800,360,3)).toBe(3);
  for(const[w,h]of[[1280,800],[2560,1440],[3840,2160]])expect(w*h*tabletopDpr(w,h,2)**2).toBeLessThanOrEqual(8_388_609);
 });
});
