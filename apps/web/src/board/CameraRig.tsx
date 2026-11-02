import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';
import { applyFixedCamera } from './camera/fixedCamera';

/** Uma pose calibrada. Seleção, turnos, gestos e stores não participam da câmera. */
export function CameraRig() {
  const camera=useThree(state=>state.camera);
  const scene=useThree(state=>state.scene);
  const size=useThree(state=>state.size);
  useLayoutEffect(()=>{
    if(!(camera instanceof PerspectiveCamera))throw new Error('A composição calibrada exige câmera perspectiva.');
    applyFixedCamera(camera);
    if(import.meta.env.DEV){
      const debug=()=>({position:camera.position.toArray(),world:camera.matrixWorld.toArray(),projection:camera.projectionMatrix.toArray(),aspect:camera.aspect});
      const target=window as unknown as {__imperioStaticCamera?:typeof debug};
      target.__imperioStaticCamera=debug;
      const inspect=()=>({camera,scene});
      const artTarget=window as unknown as {__imperioArtScene?:typeof inspect};
      artTarget.__imperioArtScene=inspect;
      return()=>{if(target.__imperioStaticCamera===debug)delete target.__imperioStaticCamera;if(artTarget.__imperioArtScene===inspect)delete artTarget.__imperioArtScene;};
    }
  },[camera,scene,size.width,size.height]);
  return null;
}
