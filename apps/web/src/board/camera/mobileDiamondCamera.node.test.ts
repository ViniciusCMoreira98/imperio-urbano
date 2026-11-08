import{it,expect}from'vitest';
import{PerspectiveCamera,Vector3}from'three';
import{applyMobileDiamondCamera,intersectsBoardPolygon}from'./mobileDiamondCamera';
import{applyTabletopCamera}from'./tabletopViewport';
import{applyFixedCamera}from'./fixedCamera';
import layout from'../board34/layout.json';

it('uses the empty corners for players while keeping property tiles clear of the central action',()=>{
 for(const[w,h]of[[667,280],[800,360],[932,430]]){
  const camera=new PerspectiveCamera(),pw=Math.min(132,Math.max(100,w*.15));
  const occlusions=[{left:6,top:h-75,right:6+pw,bottom:h-6},{left:w-6-pw,top:h-75,right:w-6,bottom:h-6},{left:w-40,top:4,right:w-4,bottom:120}];
  const aw=h<=320?125:197,interior={left:(w-aw)/2,top:h/2-37,right:(w+aw)/2,bottom:h/2+21};
  const b=applyMobileDiamondCamera(camera,w,h,{top:18,bottom:8,left:6,right:6,occlusions,interior});
  expect((b.right-b.left)/w).toBeGreaterThan(.65);expect((b.bottom-b.top)/h).toBeGreaterThan(.85);
  const project=(p:number[])=>{const v=new Vector3(...p as[number,number,number]).project(camera);return[(v.x+1)*w/2,(1-v.y)*h/2]as[number,number]};
  const frame=layout.layers.frame.polygon.map(project);
  for(const r of occlusions)expect(intersectsBoardPolygon(frame,r)).toBe(false);
  for(const tile of layout.tiles)expect(intersectsBoardPolygon(tile.polygon.map(project),interior,2)).toBe(false);
  const reference=new PerspectiveCamera();applyFixedCamera(reference);applyTabletopCamera(camera,1280,720,'standard');
  expect(camera.zoom).toBe(1);expect(camera.matrixWorld.toArray()).toEqual(reference.matrixWorld.toArray());
 }
});
