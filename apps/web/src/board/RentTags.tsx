// Valor do aluguel por cima das construções (pedido do usuário, 06/11/2026). As construções têm o mesmo
// tamanho em todos os estados; nas laterais, um prédio alto passa na frente da placa da casa de trás.
// Cada etiqueta repete, no mesmo lugar, a placa pintada na arte do tabuleiro, mas é desenhada depois
// de tudo e sem teste de profundidade: nenhuma construção a esconde.
import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, LinearFilter, MeshBasicMaterial, SRGBColorSpace } from 'three';
import layout from './board34/layout.json';
import type { BoardRentLabel } from './board34/Board34Scene';
import { type ZoneTile, rentPlaqueWorld } from './board34/buildingZone';
import { paintRentalPlaque } from './board34/rentalPlaque';

/** Pixels da etiqueta por pixel da arte: nítida mesmo de perto. */
const SHARPNESS = 8;
/** Depois das construções, dos personagens e dos destaques. */
const RENDER_ORDER = 20;

type PlaqueTile = ZoneTile & { id: string; stateId?: string | null };
const tiles = (layout.tiles as unknown as PlaqueTile[]).filter((t) => t.stateId && t.panel?.rent);
const byState = new Map(tiles.map((t) => [t.stateId!, t]));

/**
 * Celular (08/11/2026): o tabuleiro fica pequeno e o aluguel é o que mais importa ler. A placa cresce na
 * largura até quase a da carta e na altura para cima (a base continua no lugar), com o texto junto.
 */
const LARGE = { width: 1.25, height: 1.6, margin: 3 };
const enlargedCache = new Map<PlaqueTile, PlaqueTile>();
/** Sempre o mesmo objeto por casa: a textura e a geometria da placa não são refeitas a cada render. */
function enlarged(tile: PlaqueTile): PlaqueTile {
  let big = enlargedCache.get(tile);
  if (!big) enlargedCache.set(tile, (big = enlargeTile(tile)));
  return big;
}
function enlargeTile(tile: PlaqueTile): PlaqueTile {
  const rent = tile.panel.rent!;
  const width = Math.min(tile.panel.width - 2 * LARGE.margin, rent.width * LARGE.width);
  const height = rent.height * LARGE.height;
  const big = { x: rent.x + rent.width / 2 - width / 2, y: rent.y + rent.height - height, width, height };
  return { ...tile, panel: { ...tile.panel, rent: big } };
}

/** Mesma placa e mesmo texto que a arte pinta (Board34Scene), num canvas só da placa. */
function tagTexture(tile: PlaqueTile, label: string) {
  const rect = tile.panel.rent!;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(rect.width * SHARPNESS);
  canvas.height = Math.ceil(rect.height * SHARPNESS);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(canvas.width / rect.width, canvas.height / rect.height);
  ctx.translate(-rect.x, -rect.y);
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

function RentTag({ tile, label }: { tile: PlaqueTile; label: string }) {
  const geometry = useMemo(() => tagGeometry(tile), [tile]);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: tagTexture(tile, label),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: DoubleSide,
        toneMapped: false,
      }),
    [tile, label],
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
  return <mesh geometry={geometry} material={material} renderOrder={RENDER_ORDER} raycast={() => null} />;
}

export function RentTags({ labels, large = false }: { labels: BoardRentLabel[]; large?: boolean }) {
  return (
    <>
      {labels.map(({ stateId, rentLabel }) => {
        const tile = byState.get(stateId);
        return tile ? <RentTag key={stateId} tile={large ? enlarged(tile) : tile} label={rentLabel} /> : null;
      })}
    </>
  );
}
