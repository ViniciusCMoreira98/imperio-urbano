// Peão provisório (cilindro + esfera). Recebe a casa final vinda do servidor e anima até ela:
// casa a casa num lance de dados; num salto só quando é viagem, carta ou ida ao Descanso.
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
/** Acima disso não foi um lance de dados (2d6 anda no máximo 12). */
const MAX_WALK_STEPS = 12;

interface PawnProps {
  position: number;
  color: string;
  /** Deslocamento dentro da casa, para vários peões caberem lado a lado. */
  offset: [number, number];
  onArrive?: (position: number) => void;
}

function spotOn(index: number, offset: [number, number]) {
  const p = tilePlacement(index, board.tilesPerSide);
  return { x: p.x + offset[0], z: p.z + offset[1] };
}

export function Pawn({ position, color, offset, onArrive }: PawnProps) {
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
      const { x, z } = spotOn(position, offset);
      group.position.set(x, TILE_HEIGHT, z);
      return;
    }

    const path = steps <= MAX_WALK_STEPS ? movePath(from, steps, TILE_COUNT) : [position];
    const hop = path.length === 1 ? HOP_DURATION * 3 : HOP_DURATION;
    const timeline = gsap.timeline({
      onComplete: () => {
        shownAt.current = position;
        onArriveRef.current?.(position);
      },
    });
    path.forEach((index, i) => {
      const { x, z } = spotOn(index, offset);
      const at = i * hop;
      const height = path.length === 1 ? HOP_HEIGHT * 3 : HOP_HEIGHT;
      timeline
        .to(group.position, { x, z, duration: hop, ease: 'power1.inOut' }, at)
        .to(group.position, { y: TILE_HEIGHT + height, duration: hop / 2, ease: 'power2.out' }, at)
        .to(group.position, { y: TILE_HEIGHT, duration: hop / 2, ease: 'power2.in' }, at + hop / 2);
    });

    return () => {
      timeline.kill();
    };
  }, [position, offset]);

  return (
    <group ref={groupRef} scale={0.75}>
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
