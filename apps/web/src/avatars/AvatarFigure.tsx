// Avatares: personagens humanos low-poly do pacote "Mini Characters" (Kenney, CC0; ver
// public/models/characters/LICENSE-kenney.txt), sobre uma base na cor do peão do jogador.
import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { Box3, type Group } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AvatarId } from '@imperio/shared-types';

const MODELS: Record<AvatarId, string> = {
  'avatar-1': 'character-female-a',
  'avatar-2': 'character-male-a',
  'avatar-3': 'character-female-b',
  'avatar-4': 'character-male-d',
  'avatar-5': 'character-male-b',
};

const urlOf = (avatarId: AvatarId) => `/models/characters/${MODELS[avatarId]}.glb`;

/** Altura do personagem (sem a base), parecida com a do peão antigo. */
const FIGURE_HEIGHT = 0.8;
const BASE_HEIGHT = 0.06;

export type AvatarMotion = 'idle' | 'walk';

/** Peça com a base no chão (y = 0) e o rosto virado para +z. */
export function AvatarFigure({ avatarId, color, motion = 'idle' }: { avatarId: AvatarId; color: string; motion?: AvatarMotion }) {
  const { scene, animations } = useGLTF(urlOf(avatarId));
  // Cada peão precisa da própria cópia do esqueleto para animar sozinho.
  const model = useMemo(() => {
    const copy = clone(scene);
    copy.traverse((child) => {
      child.castShadow = true;
    });
    return copy;
  }, [scene]);
  const scale = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    return FIGURE_HEIGHT / Math.max(0.001, box.max.y - box.min.y);
  }, [scene]);

  const root = useRef<Group>(null);
  const { actions } = useAnimations(animations, root);
  useEffect(() => {
    const action = actions[motion] ?? actions.idle;
    action?.reset().fadeIn(0.15).play();
    return () => {
      action?.fadeOut(0.15);
    };
  }, [actions, motion]);

  return (
    <group>
      <mesh position={[0, BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.25, BASE_HEIGHT, 28]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, BASE_HEIGHT + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 28]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <group ref={root} position={[0, BASE_HEIGHT, 0]} scale={scale}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/** Baixa os modelos logo no início, para não piscar quando a partida ou a sala abrirem. */
export function preloadAvatars() {
  (Object.keys(MODELS) as AvatarId[]).forEach((id) => useGLTF.preload(urlOf(id)));
}
