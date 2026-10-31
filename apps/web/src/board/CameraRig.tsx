// Câmera isométrica: vista geral girável em passos de 90°, foco suave em uma casa,
// rotação e zoom do usuário dentro de limites (sem deslocamento lateral).
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { board } from '@imperio/game-data';
import { useViewStore } from '../store/viewStore';
import { fitDistance, nearestAngle, overviewPose, tilePose } from './cameraPose';
import { tilePlacement } from './layout';

const { ACTION } = CameraControlsImpl;

interface CameraRigProps {
  /** Raio da esfera que precisa caber na tela na vista geral. */
  fitRadius: number;
}

export function CameraRig({ fitRadius }: CameraRigProps) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const animate = useRef(false);
  const focusedTile = useViewStore((s) => s.focusedTile);
  const quarterTurns = useViewStore((s) => s.quarterTurns);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const fov = useThree((s) => ('fov' in s.camera ? (s.camera.fov as number) : 35));

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.mouseButtons.left = ACTION.ROTATE;
    controls.mouseButtons.middle = ACTION.DOLLY;
    controls.mouseButtons.right = ACTION.NONE;
    controls.mouseButtons.wheel = ACTION.DOLLY;
    controls.touches.one = ACTION.TOUCH_ROTATE;
    controls.touches.two = ACTION.TOUCH_DOLLY;
    controls.touches.three = ACTION.NONE;
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const pose =
      focusedTile === null
        ? overviewPose(quarterTurns)
        : tilePose(tilePlacement(focusedTile, board.tilesPerSide));
    const smooth = animate.current;
    animate.current = true;

    void controls.moveTo(...pose.target, smooth);
    void controls.rotateTo(nearestAngle(controls.azimuthAngle, pose.azimuth), pose.polar, smooth);
    void controls.dollyTo(pose.distance ?? fitDistance(fitRadius, fov, aspect), smooth);
  }, [focusedTile, quarterTurns, fitRadius, aspect, fov]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={0.35}
      minPolarAngle={0.35}
      maxPolarAngle={1.15}
      minDistance={4}
      maxDistance={70}
    />
  );
}
