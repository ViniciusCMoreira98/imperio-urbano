// Centro do tabuleiro: área do mapa do Brasil (arte final na E27) e espaços reservados
// para o baralho de eventos, as informações da partida e o painel olímpico, longe do mapa.
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

const SLOT_HEIGHT = 0.05;

interface BoardCenterProps {
  size: number;
}

export function BoardCenter({ size }: BoardCenterProps) {
  const mapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 720);
    gradient.addColorStop(0, '#6fbf8f');
    gradient.addColorStop(1, '#2f7f9f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'center';
    ctx.font = '800 120px system-ui, sans-serif';
    ctx.fillText('BRASIL', 512, 540);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => mapTexture.dispose(), [mapTexture]);

  const s = size / 2;
  const slots = [
    { label: 'Eventos', x: -s + 1.1, z: -s + 0.8, w: 1.4, d: 1 },
    { label: 'Olimpíadas', x: s - 1.1, z: -s + 0.8, w: 1.4, d: 1 },
    { label: 'Partida', x: 0, z: s - 0.65, w: 3, d: 0.8 },
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={mapTexture} />
      </mesh>
      {slots.map((slot) => (
        <mesh key={slot.label} position={[slot.x, SLOT_HEIGHT / 2, slot.z]} castShadow receiveShadow>
          <boxGeometry args={[slot.w, SLOT_HEIGHT, slot.d]} />
          <meshStandardMaterial color="#f4ecd8" transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}
