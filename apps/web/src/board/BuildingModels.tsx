// Miniaturas das construções (E24): casinha com telhado e prédio de hotel, na cor do dono.
// Formas procedurais low-poly; a base fica no chão (y = 0) e a frente virada para +z.
import { useMemo } from 'react';
import { Color } from 'three';

const WINDOW = '#fff3c4';
const TRIM = '#f8f4ea';

function shade(hex: string, factor: number): string {
  return `#${new Color(hex).multiplyScalar(factor).getHexString()}`;
}

/** Casinha: paredes na cor do dono, telhado de duas águas mais escuro, porta e janela claras. */
export function HouseModel({ color, size = 0.19 }: { color: string; size?: number }) {
  const roof = useMemo(() => shade(color, 0.62), [color]);
  const wall = size * 0.75;
  return (
    <group>
      <mesh position={[0, wall / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, wall, size]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Prisma triangular deitado: cilindro de 3 lados girado. */}
      <mesh position={[0, wall + size * 0.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.12]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 1.12, 3]} />
        <meshStandardMaterial color={roof} flatShading />
      </mesh>
      <mesh position={[0, wall * 0.3, size / 2 + 0.001]}>
        <planeGeometry args={[size * 0.28, wall * 0.6]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[size * 0.28, wall * 0.6, size / 2 + 0.001]}>
        <planeGeometry args={[size * 0.2, size * 0.2]} />
        <meshStandardMaterial color={WINDOW} emissive={WINDOW} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

/** Hotel: prédio na cor do dono com fileiras de janelas, marquise e topo claro. */
export function HotelModel({ color, width = 0.5, height = 0.42, depth = 0.26 }: { color: string; width?: number; height?: number; depth?: number }) {
  const base = useMemo(() => shade(color, 0.7), [color]);
  const floors = 4;
  const columns = 5;
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height + 0.02, 0]} castShadow>
        <boxGeometry args={[width * 1.06, 0.04, depth * 1.08]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[width * 1.04, 0.08, depth * 1.04]} />
        <meshStandardMaterial color={base} />
      </mesh>
      {/* Marquise sobre a entrada. */}
      <mesh position={[0, 0.11, depth / 2 + 0.03]}>
        <boxGeometry args={[width * 0.4, 0.015, 0.06]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: columns }, (_, c) => (
          <mesh
            key={`${f}-${c}`}
            position={[(c - (columns - 1) / 2) * (width / columns), 0.15 + f * ((height - 0.2) / floors) + 0.04, depth / 2 + 0.001]}
          >
            <planeGeometry args={[width / columns * 0.55, 0.045]} />
            <meshStandardMaterial color={WINDOW} emissive={WINDOW} emissiveIntensity={0.3} />
          </mesh>
        )),
      )}
    </group>
  );
}
