import { useEffect, useMemo } from 'react';
import { CanvasTexture, MirroredRepeatWrapping, SRGBColorSpace } from 'three';
import { useIllustratedBoardArt } from './illustratedBoard';

/** Madeira da própria referência; nenhuma segunda imagem do tabuleiro sob o tabuleiro real. */
export function WoodenTableScene() {
  const art=useIllustratedBoardArt();
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#8c4525';ctx.fillRect(0,0,1024,192);
    if(art)ctx.drawImage(art,0,939,560,85,0,0,1024,192);
    const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.wrapS=map.wrapT=MirroredRepeatWrapping;map.repeat.set(12,48);map.anisotropy=8;return map;
  },[art]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <><mesh position={[0,-.405,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[120,120]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh><mesh position={[0,-.404,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[120,120]}/><shadowMaterial transparent opacity={.2}/></mesh></>;
}
