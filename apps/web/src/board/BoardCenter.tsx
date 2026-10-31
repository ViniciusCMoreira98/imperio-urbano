// Centro do tabuleiro (alvo visual: docs/referencias/visual-alvo.webp): piso azul-escuro em grade com o
// logotipo e o mapa do Brasil recortados da arte, miniaturas 3D em volta, a pilha 3D de Eventos e o
// painel da partida. O topo da textura fica no lado -z (o fundo, visto da câmera).
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { brazilMap, logo, useBoardArt } from './boardArt';
import { CenterMiniatures } from './CenterMiniatures';

export type CenterSlot = 'Eventos' | 'Partida';

/** Posições relativas (0–1, origem no canto do fundo à esquerda) dos elementos do centro. */
export const CENTER_LAYOUT = {
  logo: { u: 0.5, v: 0.21, width: 0.56 },
  map: { u: 0.5, v: 0.6, width: 0.36 },
  eventsPile: { u: 0.2, v: 0.8 },
  gamePanel: { u: 0.8, v: 0.8 },
};

/** Onde ficam a pilha de Eventos e o painel da partida, nos cantos da frente do centro. */
export function centerSlots(size: number): { label: CenterSlot; x: number; z: number; w: number; d: number }[] {
  const s = size / 2;
  const at = ({ u, v }: { u: number; v: number }) => ({ x: -s + u * size, z: -s + v * size });
  return [
    { label: 'Eventos', ...at(CENTER_LAYOUT.eventsPile), w: size * 0.22, d: size * 0.26 },
    { label: 'Partida', ...at(CENTER_LAYOUT.gamePanel), w: size * 0.29, d: size * 0.22 },
  ];
}

const TEXTURE_SIZE = 1024;

function drawFloor(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(512, 512, 80, 512, 512, 760);
  g.addColorStop(0, '#2c4a86');
  g.addColorStop(1, '#16244a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  // Grade de placas, como o piso da referência.
  ctx.strokeStyle = 'rgba(160, 200, 255, 0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= TEXTURE_SIZE; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, TEXTURE_SIZE);
    ctx.moveTo(0, i);
    ctx.lineTo(TEXTURE_SIZE, i);
    ctx.stroke();
  }
}

/** Desenha a figura centrada em (u, v) com a largura relativa pedida, mantendo a proporção. */
function place(ctx: CanvasRenderingContext2D, figure: HTMLCanvasElement, { u, v, width }: { u: number; v: number; width: number }) {
  const w = width * TEXTURE_SIZE;
  const h = (figure.height / figure.width) * w;
  ctx.drawImage(figure, u * TEXTURE_SIZE - w / 2, v * TEXTURE_SIZE - h / 2, w, h);
}

export function BoardCenter({ size }: { size: number }) {
  const art = useBoardArt();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext('2d')!;
    drawFloor(ctx);
    if (art) {
      // Sombra suave sob o mapa e o logotipo, como se estivessem impressos sobre o piso.
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
      place(ctx, brazilMap(art), CENTER_LAYOUT.map);
      place(ctx, logo(art), CENTER_LAYOUT.logo);
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 8;
    return result;
  }, [art]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <CenterMiniatures size={size} />
    </>
  );
}
