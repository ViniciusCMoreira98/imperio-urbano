// Prévia 3D do avatar escolhido na sala de espera, balançando sobre um pedestal sem dar as costas.
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import type { AvatarId } from '@imperio/shared-types';
import { AvatarFigure } from './AvatarFigure';

function Turntable({ avatarId, color }: { avatarId: AvatarId; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.9) * 0.7;
  });
  return (
    <group ref={ref}>
      <AvatarFigure avatarId={avatarId} color={color} />
    </group>
  );
}

export function AvatarPreview({ avatarId, color, label }: { avatarId: AvatarId; color: string; label: string }) {
  return (
    <div className="h-40 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-900/60 to-slate-800/80 sm:h-48" role="img" aria-label={`Prévia do avatar ${label}`}>
      <Canvas camera={{ position: [0, 0.45, 2.4], fov: 26 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} castShadow />
        <group position={[0, -0.47, 0]}>
          <Suspense fallback={null}>
            <Turntable avatarId={avatarId} color={color} />
          </Suspense>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.45, 32]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </Canvas>
    </div>
  );
}
