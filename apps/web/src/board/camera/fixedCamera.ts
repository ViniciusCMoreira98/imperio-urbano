import { PerspectiveCamera } from 'three';
import calibration from './fixedCamera.json';

export { calibration as FIXED_CAMERA };
/** Compatível com a câmera Blender exportada; principal point sem deformar a imagem. */
export function applyFixedCamera(camera:PerspectiveCamera) {
  camera.position.fromArray(calibration.position);
  camera.up.fromArray(calibration.up);
  camera.fov=calibration.fov;
  camera.near=calibration.near;
  camera.far=calibration.far;
  camera.aspect=calibration.aspect;
  camera.lookAt(calibration.target[0],calibration.target[1],calibration.target[2]);
  const {width,height}=calibration.reference;
  camera.setViewOffset(width,height,calibration.viewOffset[0],calibration.viewOffset[1],width,height);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
