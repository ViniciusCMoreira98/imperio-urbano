// Construções e marcadores desenhados a partir do snapshot do servidor (arte: Codex).
// Os personagens moram em Pawns.tsx (engenharia); a reexportação mantém o import do BoardScene.
import { useMemo } from 'react';
import { board } from '@imperio/game-data';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { tilePlacement } from './layout';
import { HotelModel, HouseModel } from './BuildingModels';
import { OlympicHost } from './OlympicHost';
import { TILE_HEIGHT } from './Tile';

export { Pawns } from './Pawns';

export function Buildings() {
  const snapshot = useGameStore((s) => s.snapshot);
  const items = useMemo(() => {
    if (!snapshot) return [];
    const colorOf = new Map(snapshot.players.map((p) => [p.id, PAWN_COLORS[p.pawnColor].hex]));
    return snapshot.properties.map((property) => {
      const tile = board.tiles.find((t) => t.stateId === property.stateId)!;
      return {
        property,
        placement: tilePlacement(tile.index, board.tilesPerSide),
        ownerColor: colorOf.get(property.ownerId ?? '') ?? '#ffffff',
        hostMultiplier: snapshot.olympics.hostStateId === property.stateId ? snapshot.olympics.multiplier : null,
      };
    });
  }, [snapshot]);

  return (
    <>
      {items.map(({ property, placement, ownerColor, hostMultiplier }) => (
        <group
          key={property.stateId}
          position={[placement.x, TILE_HEIGHT, placement.z]}
          rotation={[0, placement.rotationY, 0]}
        >
          {/* Faixa do dono na borda externa; casas e hotel também levam a cor do peão do dono. */}
          <mesh position={[0, 0.006, placement.depth / 2 - 0.08]}>
            <boxGeometry args={[placement.width * 0.9, 0.012, 0.1]} />
            <meshStandardMaterial color={ownerColor} />
          </mesh>
          {/* Construções na faixa interna da casa, de frente para fora (onde fica a câmera). */}
          {property.buildingLevel === 5 ? (
            <group position={[0, 0, -placement.depth / 2 + 0.5]}>
              <HotelModel color={ownerColor} />
            </group>
          ) : (
            Array.from({ length: property.buildingLevel }, (_, i) => (
              <group key={i} position={[-0.3 + i * 0.2, 0, -placement.depth / 2 + 0.5]}>
                <HouseModel color={ownerColor} />
              </group>
            ))
          )}
          {hostMultiplier !== null && <OlympicHost placement={placement} multiplier={hostMultiplier} />}
        </group>
      ))}
    </>
  );
}
