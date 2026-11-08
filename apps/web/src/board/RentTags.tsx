// Valor do aluguel por cima das construções (pedido do usuário, 06/11/2026). As construções têm o mesmo
// tamanho em todos os estados; nas laterais, um prédio alto passa na frente da placa da casa de trás.
// Cada etiqueta repete, no mesmo lugar, a placa pintada na arte do tabuleiro, mas é desenhada depois
// das construções e sem teste de profundidade. Personagens são desenhados depois da etiqueta.
import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, LinearFilter, MeshBasicMaterial, SRGBColorSpace } from 'three';
import layout from './board34/visualLayout';
import type { BoardRentLabel } from './board34/Board34Scene';
import { type ZoneTile, rentPlaqueWorld } from './board34/buildingZone';
import { paintRentalPlaque } from './board34/rentalPlaque';
import {RENT_TAG_RENDER_ORDER} from './renderOrder';
import {MobileRentTag} from './MobileRentTag';
import {mobileCleanLayout} from './board34/mobileCleanLayout';

/** Pixels da etiqueta por pixel da arte: nítida mesmo de perto. */
const SHARPNESS = 8;
type PlaqueTile = ZoneTile & { id: string; stateId?: string | null };
const tiles = (layout.tiles as unknown as PlaqueTile[]).filter((t) => t.stateId && t.panel?.rent);
const byState = new Map(tiles.map((t) => [t.stateId!, t]));

/** Mesma placa e mesmo texto que a arte pinta (Board34Scene), num canvas só da placa. */
function tagTexture(tile: PlaqueTile, label: string,clean=false) {
  const rect = tile.panel.rent!;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(rect.width * SHARPNESS);
  canvas.height = Math.ceil(rect.height * SHARPNESS);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(canvas.width / rect.width, canvas.height / rect.height);
  ctx.translate(-rect.x, -rect.y);
  if(clean){
    ctx.fillStyle='#e4e8e1';ctx.fillRect(rect.x,rect.y,rect.width,rect.height);
    ctx.translate(rect.x+rect.width/2,rect.y+rect.height/2);
    if(tile.panel.horizontal)ctx.rotate(Math.PI/2);
    const value=label.replace(/^R\$\s*/,''),maxWidth=(tile.panel.horizontal?rect.height:rect.width)*.9;
    let font=(tile.panel.horizontal?rect.width:rect.height)*.76;ctx.font=`700 ${font}px Arial,sans-serif`;
    while(ctx.measureText(value).width>maxWidth&&font>8){font-=.25;ctx.font=`700 ${font}px Arial,sans-serif`;}
    ctx.fillStyle='#172e36';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,0,.3);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.minFilter=texture.magFilter=LinearFilter;return texture;
  }
  paintRentalPlaque(ctx, rect);
  let font = rect.height * 0.66;
  ctx.font = `900 ${font}px Arial,sans-serif`;
  while (ctx.measureText(label).width > rect.width * 0.83 && font > 7) {
    font -= 0.25;
    ctx.font = `900 ${font}px Arial,sans-serif`;
  }
  ctx.fillStyle = '#fff5d3';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2 + 0.3);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

/** Quadrilátero da placa no mundo, na superfície da casa. */
function tagGeometry(tile: PlaqueTile) {
  const y = tile.polygon[0][1] + 0.002;
  const quad = rentPlaqueWorld(tile);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(quad.flatMap(([x, z]) => [x, y, z])), 3));
  // Cantos na ordem do retângulo da arte: topo-esquerdo, topo-direito, base-direita, base-esquerda.
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return geometry;
}

function RentTag({ tile:source, label,clean=false }: { tile: PlaqueTile; label: string;clean?:boolean }) {
  const tile=useMemo(()=>clean?{...source,panel:{...source.panel,rent:mobileCleanLayout(source).rent}}:source,[source,clean]);
  const geometry = useMemo(() => tagGeometry(tile), [tile]);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: tagTexture(tile, label,clean),
        // Opaque queue + alpha cutout lets opaque character meshes draw after the label.
        transparent: false,
        alphaTest: .05,
        depthTest: false,
        depthWrite: false,
        side: DoubleSide,
        toneMapped: false,
      }),
    [tile, label,clean],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );
  // Só mostra; o toque segue indo para a casa embaixo.
  return <mesh name={`RENT_TAG_${tile.id}`} geometry={geometry} material={material} renderOrder={RENT_TAG_RENDER_ORDER} raycast={() => null} />;
}

export function RentTags({ labels,mobile=false,clean=false }: { labels: BoardRentLabel[];mobile?:boolean;clean?:boolean }) {
  return (
    <>
      {labels.map(({ stateId, rentLabel }) => {
        const tile = byState.get(stateId);
        return tile ? clean&&mobile?<RentTag key={stateId} tile={tile} label={rentLabel} clean/>:mobile?<MobileRentTag key={stateId} tile={tile} label={rentLabel}/>:<RentTag key={stateId} tile={tile} label={rentLabel} /> : null;
      })}
    </>
  );
}
