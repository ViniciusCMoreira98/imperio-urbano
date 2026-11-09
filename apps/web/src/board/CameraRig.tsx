import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { applyFixedCamera } from './camera/fixedCamera';
import {applyTabletopCamera,tabletopDpr,type BoardFraming,type BoardInsets} from './camera/tabletopViewport';

/** Uma pose calibrada. Seleção, turnos, gestos e stores não participam da câmera. */
export function CameraRig({expanded=false,framing='standard',insets}:{expanded?:boolean;framing?:BoardFraming;insets?:BoardInsets}) {
  const camera=useThree(state=>state.camera);
  const scene=useThree(state=>state.scene);
  const raycaster=useThree(state=>state.raycaster);
  const size=useThree(state=>state.size);
  const setDpr=useThree(state=>state.setDpr);
  const actualDpr=useThree(state=>state.viewport.dpr);
  useLayoutEffect(()=>{
    if(!(camera instanceof PerspectiveCamera))throw new Error('A composição calibrada exige câmera perspectiva.');
    if(expanded){applyTabletopCamera(camera,size.width,size.height,framing,insets);setDpr(tabletopDpr(size.width,size.height,window.devicePixelRatio||1));}else applyFixedCamera(camera);
    if(import.meta.env.DEV){
      const debug=()=>({position:camera.position.toArray(),world:camera.matrixWorld.toArray(),projection:camera.projectionMatrix.toArray(),aspect:camera.aspect});
      const target=window as unknown as {__imperioStaticCamera?:typeof debug};
      target.__imperioStaticCamera=debug;
      const inspect=()=>({camera,scene,raycaster});
      const artTarget=window as unknown as {__imperioArtScene?:typeof inspect};
      artTarget.__imperioArtScene=inspect;
      return()=>{if(target.__imperioStaticCamera===debug)delete target.__imperioStaticCamera;if(artTarget.__imperioArtScene===inspect)delete artTarget.__imperioArtScene;};
    }
  },[camera,scene,raycaster,size.width,size.height,expanded,framing,insets?.top,insets?.bottom,insets?.left,insets?.right,insets?.occlusions,insets?.interior,setDpr,actualDpr]);
  return null;
}
