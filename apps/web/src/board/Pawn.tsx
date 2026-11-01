// Peão com o personagem do jogador. Recebe a casa final vinda do servidor e anima até ela: anda casa a
// casa num lance de dados (virado para onde vai); num salto só quando é viagem, carta ou ida ao Descanso.
// Parado, fica de frente para a câmera. A base colorida fica sempre na superfície da casa; só o
// personagem (e a seta de vez) sobe no salto.
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useLayoutEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { board } from '@imperio/game-data';
import type { AvatarId } from '@imperio/shared-types';
import { AvatarFigure } from '../avatars/AvatarFigure';
import { characterFor } from '../avatars/characterManifest';
import { ActiveMarker, BASE_HEIGHT, PlayerBase } from '../avatars/PlayerBase';
import { tileAnchor } from './layout';
import { movePath } from './movement';
import type { PawnSpot } from './pawnLayout';

const TILE_COUNT = board.tiles.length;
const HOP_DURATION = 0.2;
/** Passinho ao andar; o salto longo (viagem, carta) sobe bem mais. */
const HOP_HEIGHT = 0.12;
const JUMP_HEIGHT = 1.2;
/** Velocidade com que o personagem gira para a nova direção. */
const TURN_SPEED = 10;
/** Acima disso não foi um lance de dados (2d6 anda no máximo 12). */
const MAX_WALK_STEPS = 12;
/** Deslize até o novo lugar dentro da mesma casa (alguém entrou ou saiu dela). */
const SHIFT_DURATION = 0.3;

interface PawnProps {
  position: number;
  /** Lugar oficial dentro da casa (pawnLayout), derivado do snapshot. */
  spot: PawnSpot;
  avatarId: AvatarId;
  color: string;
  /** É a vez deste jogador: base pulsando e seta sobre a cabeça. */
  active: boolean;
  onArrive?: (position: number) => void;
}

export function Pawn({ position, spot, avatarId, color, active, onArrive }: PawnProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const faceRef = useRef<Group>(null);
  const placed = useRef(false);
  const shownAt = useRef(position);
  const [walking, setWalking] = useState(false);
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  useLayoutEffect(() => {
    const group = groupRef.current;
    const body = bodyRef.current;
    if (!group || !body) return;

    const from = shownAt.current;
    const steps = (position - from + TILE_COUNT) % TILE_COUNT;
    if (steps === 0) {
      body.position.y = BASE_HEIGHT;
      if (!placed.current) {
        // Primeira vez (entrou na partida ou reconectou): já no lugar, sem animar.
        group.position.set(spot.x, spot.y, spot.z);
        placed.current = true;
        return;
      }
      const shift = gsap.to(group.position, { x: spot.x, y: spot.y, z: spot.z, duration: SHIFT_DURATION, ease: 'power2.out' });
      return () => {
        shift.kill();
      };
    }
    placed.current = true;

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
      // Casas do caminho: pelo centro; a última: o lugar oficial dentro dela.
      const target = i === path.length - 1 ? spot : { ...tileAnchor(index), y: tileAnchor(index).surfaceY };
      const at = i * hop;
      const height = path.length === 1 ? JUMP_HEIGHT : HOP_HEIGHT;
      timeline
        .to(group.position, { x: target.x, y: target.y, z: target.z, duration: hop, ease: 'power1.inOut' }, at)
        .to(body.position, { y: BASE_HEIGHT + height, duration: hop / 2, ease: 'power2.out' }, at)
        .to(body.position, { y: BASE_HEIGHT, duration: hop / 2, ease: 'power2.in' }, at + hop / 2);
    });

    return () => {
      // Movimento interrompido (nova posição chegou antes do fim): volta a parado; o próximo recomeça.
      timeline.kill();
      body.position.y = BASE_HEIGHT;
      setWalking(false);
    };
  }, [position, spot.x, spot.y, spot.z]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <PlayerBase color={color} active={active} />
      <group ref={bodyRef} position={[0, BASE_HEIGHT, 0]}>
        <group ref={faceRef}>
          <Suspense fallback={null}>
            <AvatarFigure avatarId={avatarId} motion={walking ? 'walk' : 'idle'} />
          </Suspense>
        </group>
        {active && <ActiveMarker color={color} height={characterFor(avatarId).height + 0.25} />}
      </group>
    </group>
  );
}
