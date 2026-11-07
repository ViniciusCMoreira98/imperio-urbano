// Prévia 3D do avatar escolhido na sala de espera, balançando sem dar as costas, sem pedestal.
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import type { Group } from 'three';
import type { AvatarId } from '@imperio/shared-types';
import { AvatarFigure } from './AvatarFigure';
import { BASE_HEIGHT, PlayerBase } from './PlayerBase';

function Turntable({ avatarId, color }: { avatarId: AvatarId; color: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.9) * 0.7;
  });
  return (
    <group ref={ref}>
      <PlayerBase color={color} active={false} />
      <group position={[0, BASE_HEIGHT, 0]}>
        <AvatarFigure avatarId={avatarId} color={color} />
      </group>
    </group>
  );
}

/** `className` troca o tamanho e o fundo padrão (a sala de espera usa o próprio painel). */
export function AvatarPreview({ avatarId, color, label, className }: { avatarId: AvatarId; color: string; label: string; className?: string }) {
  return (
    <div className={className ?? 'h-40 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-900/60 to-slate-800/80 sm:h-48'} role="img" aria-label={`Prévia do avatar ${label}`}>
      <Canvas camera={{ position: [0, 0.45, 2.4], fov: 26 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={1.1} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} castShadow />
        <group position={[0, -0.47, 0]}>
          <Suspense fallback={null}>
            <Turntable avatarId={avatarId} color={color} />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}
