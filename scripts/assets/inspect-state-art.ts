import {Raycaster,Vector3,Mesh,PerspectiveCamera,Scene,MeshStandardMaterial,BoxGeometry} from 'three';
import type {StateArtworkFit} from '../../apps/web/src/board/art/stateArtwork';

/** Confere os cantos da arte na malha real, incluindo oclusão pela moldura 3D. */
export function inspectStateArtwork(){
  const hook=(window as unknown as {__imperioArtScene?:()=>{camera:PerspectiveCamera;scene:Scene}}).__imperioArtScene;
  if(!hook)throw new Error('Cena de inspeção não disponível.');
  const {camera,scene}=hook();scene.updateMatrixWorld(true);
  const states:unknown[]=[];
  scene.traverse(object=>{
    if(!(object instanceof Mesh)||!(object.geometry instanceof BoxGeometry))return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    const top=materials.find(material=>material instanceof MeshStandardMaterial&&material.map?.userData.stateArtworkFit) as MeshStandardMaterial|undefined;
    const fit=top?.map?.userData.stateArtworkFit as StateArtworkFit|undefined;
    if(!fit)return;
    const {width,height,depth}=object.geometry.parameters;
    const [cw,ch]=fit.canvasSize;
    const corners=fit.canvasCorners.map(([x,y])=>{
      const target=object.localToWorld(new Vector3((x/cw-.5)*width,height/2+.00001,(y/ch-.5)*depth));
      const ray=new Raycaster(camera.position,target.clone().sub(camera.position).normalize());
      const first=ray.intersectObjects(scene.children,true).find(hit=>hit.object.visible);
      const screen=target.clone().project(camera);
      return {insideTexture:x>=0&&x<=cw&&y>=0&&y<=ch,insideFrame:Math.abs(screen.x)<=1&&Math.abs(screen.y)<=1,visible:first?.object===object,occluder:first?.object===object?null:(first?.object as Mesh|undefined)?.geometry?.type??'none'};
    });
    const [, ,sw,sh]=fit.sourceRect;
    states.push({stateId:fit.stateId,sourceRect:fit.sourceRect,ratioPreserved:Math.abs(fit.destination.width/fit.destination.height-sw/sh)<1e-8,corners});
  });
  return states;
}
