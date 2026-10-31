import { useEffect, useMemo, useState } from 'react';
import { MeshStandardMaterial } from 'three';
import type { ColorGroup, StateDefinition, TileDefinition } from '@imperio/shared-types';
import { useViewStore } from '../store/viewStore';
import type { TilePlacement } from './layout';
import { createTileTexture } from './tileTexture';

export const TILE_HEIGHT = 0.08;
const SELECTED_LIFT = 0.06;

interface TileProps {
  tile: TileDefinition;
  placement: TilePlacement;
  state?: StateDefinition;
  group?: ColorGroup;
}

export function Tile({ tile, placement, state, group }: TileProps) {
  const selectTile = useViewStore((s) => s.selectTile);
  const focusTile = useViewStore((s) => s.focusTile);
  const selected = useViewStore((s) => s.selectedTile === tile.index);
  const [hovered, setHovered] = useState(false);
  const materials = useMemo(() => {
    const side = new MeshStandardMaterial({ color: '#d9cba8' });
    const top = new MeshStandardMaterial({
      map: createTileTexture({ tile, state, group, width: placement.width, depth: placement.depth }),
    });
    // Ordem das faces do BoxGeometry: +x, -x, +y (topo), -y, +z, -z.
    return [side, side, top, side, side, side];
  }, [tile, state, group, placement.width, placement.depth]);

  useEffect(
    () => () => {
      materials[2].map?.dispose();
      materials[2].dispose();
      materials[0].dispose();
    },
    [materials],
  );

  useEffect(() => {
    const top = materials[2];
    top.emissive.set(selected ? '#ffc23d' : '#ffffff');
    top.emissiveIntensity = selected ? 0.3 : hovered ? 0.12 : 0;
  }, [materials, selected, hovered]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  return (
    <mesh
      position={[placement.x, TILE_HEIGHT / 2 + (selected ? SELECTED_LIFT : 0), placement.z]}
      rotation={[0, placement.rotationY, 0]}
      material={materials}
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        // Ignora o clique que encerra um arrasto de rotação.
        if (e.delta > 4) return;
        e.stopPropagation();
        selectTile(tile.index);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        focusTile(tile.index);
      }}
    >
      <boxGeometry args={[placement.width * 0.98, TILE_HEIGHT, placement.depth * 0.98]} />
    </mesh>
  );
}
