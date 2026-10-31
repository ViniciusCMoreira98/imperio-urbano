// Miniaturas 3D no centro do tabuleiro, como na referência: prédios iluminados, casarios, o Maracanã,
// a Catedral de Brasília e coqueiros. Ficam nas laterais, sem cobrir o mapa, o logotipo, a pilha de
// Eventos e o painel da partida (posições em CENTER_LAYOUT).
import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';
import { Palm, windowTexture } from './RioScene';

function Tower({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const material = useMemo(() => {
    const map = windowTexture(Math.round(position[0] * 100 + position[2] * 7));
    map.repeat.set(1, Math.max(1, Math.round(size[1] * 2)));
    return new MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.6, color: '#c9d6ff' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[2], size[1]]);
  useEffect(() => () => { material.map?.dispose(); material.dispose(); }, [material]);
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} material={material} castShadow>
        <boxGeometry args={size} />
      </mesh>
      <mesh position={[0, size[1] + 0.02, 0]}>
        <boxGeometry args={[size[0] * 1.06, 0.04, size[2] * 1.06]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

/** Casario colonial: paredes claras e telhado de barro. */
function ColonialHouse({ position, turn = 0 }: { position: [number, number, number]; turn?: number }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.5, 0.24, 0.3]} />
        <meshStandardMaterial color="#f6e7c8" />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.1]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.54, 3]} />
        <meshStandardMaterial color="#c2552d" flatShading />
      </mesh>
    </group>
  );
}

/** Maracanã: anel de arquibancada branco com o gramado no meio. */
function Stadium({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.85, 0.28, 32, 1, true]} />
        <meshStandardMaterial color="#eef2f7" side={2} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.82, 32]} />
        <meshStandardMaterial color="#cbd5e1" side={2} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial color="#3f9b4a" />
      </mesh>
    </group>
  );
}

/** Catedral de Brasília: pilares curvos formando uma coroa. */
function Cathedral({ position }: { position: [number, number, number] }) {
  const pillars = 12;
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 24]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {Array.from({ length: pillars }, (_, i) => (
        <group key={i} rotation={[0, (i / pillars) * Math.PI * 2, 0]}>
          <mesh position={[0.22, 0.38, 0]} rotation={[0, 0, 0.32]} castShadow>
            <boxGeometry args={[0.05, 0.8, 0.07]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.55} emissive="#38bdf8" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function CenterMiniatures({ size }: { size: number }) {
  // Coordenadas relativas ao centro (o lado do tabuleiro mede `size`); y = 0 é o piso.
  const s = size / 2;
  const at = (u: number, v: number, y = 0): [number, number, number] => [-s + u * size, y, -s + v * size];
  return (
    <group>
      <Tower position={at(0.08, 0.08)} size={[0.45, 1.2, 0.45]} />
      <Tower position={at(0.15, 0.06)} size={[0.38, 0.8, 0.38]} />
      <Tower position={at(0.08, 0.17)} size={[0.4, 0.95, 0.4]} />
      <Tower position={at(0.92, 0.07)} size={[0.42, 1.35, 0.42]} />
      <Tower position={at(0.86, 0.12)} size={[0.36, 0.7, 0.36]} />
      <ColonialHouse position={at(0.1, 0.32)} turn={0.3} />
      <ColonialHouse position={at(0.12, 0.42)} turn={-0.2} />
      <Stadium position={at(0.88, 0.36)} />
      <Cathedral position={at(0.88, 0.57)} />
      <group scale={0.22}>
        {[at(0.06, 0.55), at(0.13, 0.62), at(0.94, 0.22), at(0.5, 0.92), at(0.07, 0.26)].map((p, i) => (
          <Palm key={i} position={[p[0] / 0.22, 0, p[2] / 0.22]} height={4 + (i % 2)} lean={0.6} turn={i * 1.3} />
        ))}
      </group>
    </group>
  );
}
