// Centro ilustrado da imagem fornecida pelo usuário, com a perspectiva original retificada.
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { CENTER_ART, drawArtwork, useIllustratedBoardArt } from './illustratedBoard';

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

const TEXTURE_SIZE = 1536;

export function BoardCenter({ size }: { size: number }) {
  const art = useIllustratedBoardArt();
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle='#176f8d';ctx.fillRect(0,0,TEXTURE_SIZE,TEXTURE_SIZE);
    if(art) drawArtwork(ctx,art,CENTER_ART,0,0,TEXTURE_SIZE,TEXTURE_SIZE,24);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 8;
    return result;
  }, [art]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
  );
}
