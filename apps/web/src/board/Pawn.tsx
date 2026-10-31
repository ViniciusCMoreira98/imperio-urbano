// Peão provisório (cilindro + esfera). Recebe a casa final e anima o percurso casa a casa,
// sempre para a frente, a partir da casa onde está sendo exibido.
import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import type { Group } from 'three';
import { board } from '@imperio/game-data';
import { tilePlacement } from './layout';
import { movePath } from './movement';
import { TILE_HEIGHT } from './Tile';

const TILE_COUNT = board.tiles.length;
const HOP_DURATION = 0.2;
const HOP_HEIGHT = 0.45;

interface PawnProps {
  position: number;
  color: string;
  /** Chamado quando o peão termina de chegar em `position`. */
  onArrive?: (position: number) => void;
}

function tileCenter(index: number) {
  const p = tilePlacement(index, board.tilesPerSide);
  return { x: p.x, z: p.z };
}

export function Pawn({ position, color, onArrive }: PawnProps) {
  const groupRef = useRef<Group>(null);
  const shownAt = useRef(position);
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const from = shownAt.current;
    const steps = (position - from + TILE_COUNT) % TILE_COUNT;
    if (steps === 0) {
      const { x, z } = tileCenter(position);
      group.position.set(x, TILE_HEIGHT, z);
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        shownAt.current = position;
        onArriveRef.current?.(position);
      },
    });
    movePath(from, steps, TILE_COUNT).forEach((index, i) => {
      const { x, z } = tileCenter(index);
      const at = i * HOP_DURATION;
      timeline
        .to(group.position, { x, z, duration: HOP_DURATION, ease: 'power1.inOut' }, at)
        .to(group.position, { y: TILE_HEIGHT + HOP_HEIGHT, duration: HOP_DURATION / 2, ease: 'power2.out' }, at)
        .to(group.position, { y: TILE_HEIGHT, duration: HOP_DURATION / 2, ease: 'power2.in' }, at + HOP_DURATION / 2);
    });

    return () => {
      timeline.kill();
    };
  }, [position]);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.12, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.17, 0.4, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
