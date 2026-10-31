// Peão com o personagem do jogador. Recebe a casa final vinda do servidor e anima até ela: anda casa a
// casa num lance de dados (virado para onde vai); num salto só quando é viagem, carta ou ida ao Descanso.
// Parado, fica de frente para a câmera.
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { board } from '@imperio/game-data';
import type { AvatarId } from '@imperio/shared-types';
import { AvatarFigure } from '../avatars/AvatarFigure';
import { tilePlacement } from './layout';
import { movePath } from './movement';
import { TILE_HEIGHT } from './Tile';

const TILE_COUNT = board.tiles.length;
const HOP_DURATION = 0.2;
/** Passinho ao andar; o salto longo (viagem, carta) sobe bem mais. */
const HOP_HEIGHT = 0.12;
const JUMP_HEIGHT = 1.2;
/** Velocidade com que o personagem gira para a nova direção. */
const TURN_SPEED = 10;
/** Acima disso não foi um lance de dados (2d6 anda no máximo 12). */
const MAX_WALK_STEPS = 12;

interface PawnProps {
  position: number;
  avatarId: AvatarId;
  color: string;
  /** Deslocamento dentro da casa, para vários peões caberem lado a lado. */
  offset: [number, number];
  onArrive?: (position: number) => void;
}

function spotOn(index: number, offset: [number, number]) {
  const p = tilePlacement(index, board.tilesPerSide);
  return { x: p.x + offset[0], z: p.z + offset[1] };
}

export function Pawn({ position, avatarId, color, offset, onArrive }: PawnProps) {
  const groupRef = useRef<Group>(null);
  const faceRef = useRef<Group>(null);
  const shownAt = useRef(position);
  const [walking, setWalking] = useState(false);
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
    setWalking(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        shownAt.current = position;
        setWalking(false);
        onArriveRef.current?.(position);
      },
    });
    path.forEach((index, i) => {
      const { x, z } = spotOn(index, offset);
      const at = i * hop;
      const height = path.length === 1 ? JUMP_HEIGHT : HOP_HEIGHT;
      timeline
        .to(group.position, { x, z, duration: hop, ease: 'power1.inOut' }, at)
        .to(group.position, { y: TILE_HEIGHT + height, duration: hop / 2, ease: 'power2.out' }, at)
        .to(group.position, { y: TILE_HEIGHT, duration: hop / 2, ease: 'power2.in' }, at + hop / 2);
    });

    return () => {
      // Movimento interrompido (nova posição chegou antes do fim): volta a parado; o próximo recomeça.
      timeline.kill();
      setWalking(false);
    };
  }, [position, offset]);

  // Andando: olha para onde vai. Parado: vira para a câmera. Sempre só no eixo vertical, girando suave.
  const last = useRef<[number, number] | null>(null);
  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    const face = faceRef.current;
    if (!group || !face) return;
    const { x, z } = group.position;
    const previous = last.current;
    last.current = [x, z];
    let target = Math.atan2(camera.position.x - x, camera.position.z - z);
    if (walking && previous) {
      const dx = x - previous[0];
      const dz = z - previous[1];
      if (dx * dx + dz * dz < 1e-8) return;
      target = Math.atan2(dx, dz);
    }
    const diff = Math.atan2(Math.sin(target - face.rotation.y), Math.cos(target - face.rotation.y));
    face.rotation.y += diff * Math.min(1, delta * TURN_SPEED);
  });

  return (
    <group ref={groupRef} scale={0.95}>
      <group ref={faceRef}>
        <Suspense fallback={null}>
          <AvatarFigure avatarId={avatarId} color={color} motion={walking ? 'walk' : 'idle'} />
        </Suspense>
      </group>
    </group>
  );
}
