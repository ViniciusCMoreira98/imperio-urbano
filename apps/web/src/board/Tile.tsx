import { useEffect, useMemo, useState } from 'react';
import { MeshStandardMaterial } from 'three';
import type { ColorGroup, StateDefinition, TileDefinition } from '@imperio/shared-types';
import { PAWN_COLORS } from '../game/presentation';
import { currentRent } from '../game/rules';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { useBoardArt } from './boardArt';
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
  // Valores primitivos: a casa só redesenha quando o aluguel ou o dono dela mudam.
  const rent = useGameStore((s) => (s.snapshot && state ? currentRent(s.snapshot, state) : 0));
  const ownerColor = useGameStore((s) => {
    const ownerId = s.snapshot?.properties.find((p) => p.stateId === state?.id)?.ownerId;
    const owner = s.snapshot?.players.find((p) => p.id === ownerId);
    return owner ? PAWN_COLORS[owner.pawnColor].hex : null;
  });
  const art = useBoardArt();
  const materials = useMemo(() => {
    const side = new MeshStandardMaterial({ color: '#d9cba8' });
    const owned = ownerColor ? { rent, ownerColor } : undefined;
    const top = new MeshStandardMaterial({
      map: createTileTexture({ tile, state, group, width: placement.width, depth: placement.depth, owned, art }),
    });
    // Ordem das faces do BoxGeometry: +x, -x, +y (topo), -y, +z, -z.
    return [side, side, top, side, side, side];
  }, [tile, state, group, placement.width, placement.depth, rent, ownerColor, art]);

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
