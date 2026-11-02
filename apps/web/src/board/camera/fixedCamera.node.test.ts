import {describe,it,expect} from 'vitest';
import {PerspectiveCamera,Vector3} from 'three';
import {applyFixedCamera,FIXED_CAMERA} from './fixedCamera';

describe('Câmera fixa calibrada',()=>{
  it('reproduz no Three os pontos calibrados no Blender em até 3 px',()=>{
    const camera=new PerspectiveCamera();applyFixedCamera(camera);
    const {width,height}=FIXED_CAMERA.reference;
    FIXED_CAMERA.landmarks.worldPoints.forEach((point,i)=>{
      const ndc=new Vector3().fromArray(point).project(camera);
      const pixel=[(ndc.x+1)*width/2,(1-ndc.y)*height/2];
      const expected=FIXED_CAMERA.landmarks.referencePixels[i];
      expect(Math.hypot(pixel[0]-expected[0],pixel[1]-expected[1])).toBeLessThan(3);
    });
  });
  it('restaura a mesma projeção após resize, sem mudar pose ou campo de visão',()=>{
    const camera=new PerspectiveCamera();applyFixedCamera(camera);
    const world=camera.matrixWorld.toArray(),projection=camera.projectionMatrix.toArray();
    camera.aspect=390/844;camera.updateProjectionMatrix();applyFixedCamera(camera);
    expect(camera.matrixWorld.toArray()).toEqual(world);expect(camera.projectionMatrix.toArray()).toEqual(projection);
  });
});
