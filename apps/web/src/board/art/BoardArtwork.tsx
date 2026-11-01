import manifest from '../../../../../assets/board/board-art-manifest.json';
import atlasUrl from '../../../../../assets/board/estados-brasileiros-atlas.png?url';
import centerUrl from '../../../../../assets/board/rio-em-cores.png?url';

export type BoardArtworkId = keyof typeof manifest.states | keyof typeof manifest.specials | 'LOGO';
export { manifest as boardArtManifest, atlasUrl as boardAtlasUrl, centerUrl as boardCenterUrl };

/** Prancha original vista por uma janela SVG. Sem reamostrar, esticar ou apagar os detalhes. */
export function BoardArtworkSprite({ artId, className }: { artId: BoardArtworkId; className?: string }) {
  const entry = artId==='LOGO' ? manifest.logo : manifest.states[artId as keyof typeof manifest.states] ?? manifest.specials[artId as keyof typeof manifest.specials];
  if(!entry)throw new Error(`Arte de casa desconhecida: ${artId}`);
  const [x,y,w,h]=entry.rect;
  return <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Arte: ${artId}`} style={{display:'block',width:'100%',height:'auto',aspectRatio:`${w}/${h}`,overflow:'hidden'}}>
    <image href={atlasUrl} width={manifest.sources.atlas.width} height={manifest.sources.atlas.height}/>
  </svg>;
}

/** Centro completo, sempre na proporção original 3:2. A engenharia dimensiona o suporte 3D. */
export function BoardCenterArtwork({className}:{className?:string}) {
  return <img className={className} src={centerUrl} alt="Império Urbano — Edição Brasil, paisagem ilustrada do Rio de Janeiro" width={manifest.sources.center.width} height={manifest.sources.center.height} style={{display:'block',width:'100%',height:'auto',objectFit:'contain'}}/>;
}
