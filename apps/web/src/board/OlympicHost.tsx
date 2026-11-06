// Destaque do estado-sede das Olimpíadas, no próprio território (não no centro da mesa):
// moldura dourada pulsando e tocha. O multiplicador já entra no aluguel mostrado na placa; o valor
// dele aparece ao tocar na casa.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import type { TilePlacement } from './layout';

const GOLD = '#f5b301';
const FRAME = 0.06;

export function OlympicHost({ placement }: { placement: TilePlacement }) {
  // Um material para a moldura inteira e outro para a chama: o pulso muda os dois de uma vez.
  const frame = useMemo(() => new MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 0.8 }), []);
  const flame = useMemo(() => new MeshStandardMaterial({ color: '#fb923c', emissive: '#f97316', emissiveIntensity: 1.2 }), []);
  useEffect(
    () => () => {
      frame.dispose();
      flame.dispose();
    },
    [frame, flame],
  );

  // Pulso suave para chamar atenção sem poluir a tela.
  useFrame(({ clock }) => {
    const pulse = 0.55 + 0.45 * Math.sin(clock.elapsedTime * 3);
    frame.emissiveIntensity = 0.4 + pulse * 0.8;
    flame.emissiveIntensity = 0.8 + pulse;
  });

  const { width, depth } = placement;
  const bars: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, 0, depth / 2 - FRAME / 2], size: [width, 0.05, FRAME] },
    { position: [0, 0, -depth / 2 + FRAME / 2], size: [width, 0.05, FRAME] },
    { position: [width / 2 - FRAME / 2, 0, 0], size: [FRAME, 0.05, depth] },
    { position: [-width / 2 + FRAME / 2, 0, 0], size: [FRAME, 0.05, depth] },
  ];

  return (
    <group>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position} material={frame}>
          <boxGeometry args={bar.size} />
        </mesh>
      ))}

      {/* Tocha no canto externo da casa. */}
      <group position={[width / 2 - 0.16, 0, depth / 2 - 0.2]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.045, 0.32, 10]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.36, 0]} material={flame}>
          <coneGeometry args={[0.07, 0.18, 12]} />
        </mesh>
      </group>

    </group>
  );
}
