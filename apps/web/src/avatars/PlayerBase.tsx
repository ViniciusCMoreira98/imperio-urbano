// Base iluminada do jogador e indicador de vez, independentes do modelo do personagem
// (contrato em docs/11-contratos-claude-codex.md: props { color, active } fixas; a aparência pode
// ser refinada pela arte).
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, Color, type Group, MeshBasicMaterial } from 'three';

/** Sem pedestal físico: os pés apoiam diretamente na superfície da casa. */
export const BASE_HEIGHT = 0;
const BASE_RADIUS = 0.25;

export function PlayerBase({ color, active, emphasized=false }: { color: string; active: boolean; emphasized?:boolean }) {
  const ring = useMemo(() => new MeshBasicMaterial({ color: new Color(color).multiplyScalar(1.6), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), [color]);
  const halo = useMemo(() => new MeshBasicMaterial({ color, transparent: true, opacity: 0.06, depthWrite: false, blending: AdditiveBlending, toneMapped: false }), [color]);
  useEffect(() => () => { ring.dispose(); halo.dispose(); }, [ring, halo]);

  // Na vez do jogador, a base pulsa; fora dela, fica com brilho fraco e fixo.
  useFrame(({ clock }) => {
    if (active) {
      const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4);
      ring.opacity = (emphasized?0.8:0.6) + pulse * (emphasized?0.2:0.4);
      halo.opacity = 0.06 + pulse * 0.12;
    } else {
      ring.opacity = emphasized?0.95:0.55;
      halo.opacity = 0.06;
    }
  });

  return (
    <group name={emphasized?'PAWN_BASE':'PLAYER_BASE'}>
      {emphasized&&<><mesh position={[0,.0015,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[BASE_RADIUS*.95,32]}/><meshBasicMaterial color="#08263c" transparent opacity={.78} depthWrite={false} toneMapped={false}/></mesh><mesh position={[0,.003,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[BASE_RADIUS*.96,BASE_RADIUS,48]}/><meshBasicMaterial color="#fff5d9" transparent opacity={.95} depthWrite={false} toneMapped={false}/></mesh></>}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={halo}>
        <ringGeometry args={[BASE_RADIUS * 0.78, BASE_RADIUS, 48]} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ring}>
        <ringGeometry args={[BASE_RADIUS * (emphasized ? .70 : .90), BASE_RADIUS * .96, 48]} />
      </mesh>
    </group>
  );
}

/** Seta na cor do jogador flutuando sobre a cabeça de quem está na vez. */
export function ActiveMarker({ color, height, amplitude=.06, renderOrder=0 }: { color: string; height: number; amplitude?:number; renderOrder?:number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = height + amplitude * Math.sin(clock.elapsedTime * 3);
    ref.current.rotation.y = clock.elapsedTime * 1.5;
  });
  return (
    <group ref={ref} position={[0, height, 0]}>
      <mesh rotation={[Math.PI, 0, 0]} renderOrder={renderOrder}>
        <coneGeometry args={[0.09, 0.16, 4]} />
        <meshBasicMaterial color={new Color(color).multiplyScalar(1.4)} toneMapped={false} />
      </mesh>
    </group>
  );
}
