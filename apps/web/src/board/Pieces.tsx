// Construções e marcadores desenhados a partir do snapshot do servidor (arte: Codex).
// Os personagens moram em Pawns.tsx (engenharia); a reexportação mantém o import da cena.
import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { board } from '@imperio/game-data';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { PropertyBuildingModel } from './BuildingModels';
import { propertyBuildingPlacement } from './buildings/buildingPresentation';
import { tileAnchor } from './layout';
import { OlympicHost } from './OlympicHost';

export { Pawns } from './Pawns';

export function Buildings() {
  const snapshot = useGameStore((s) => s.snapshot);
  const items = useMemo(() => {
    if (!snapshot) return [];
    const colorOf = new Map(snapshot.players.map((p) => [p.id, PAWN_COLORS[p.pawnColor].hex]));
    return snapshot.properties.map((property) => {
      const tile = board.tiles.find((t) => t.stateId === property.stateId)!;
      const anchor = tileAnchor(tile.index);
      return {
        property,
        anchor,
        building: property.ownerId ? propertyBuildingPlacement(anchor.buildingArea, property.buildingLevel) : null,
        // Contorno real da casa, um pouco acima da superfície para não piscar com ela.
        outline: [...anchor.polygon, anchor.polygon[0]].map(([x, z]) => [x, anchor.surfaceY + 0.004, z] as [number, number, number]),
        ownerColor: colorOf.get(property.ownerId ?? '') ?? '#ffffff',
        hostMultiplier: snapshot.olympics.hostStateId === property.stateId ? snapshot.olympics.multiplier : null,
      };
    });
  }, [snapshot]);

  return (
    <>
      {items.map(({ property, anchor, building, outline, ownerColor, hostMultiplier }) => (
        <group key={property.stateId}>
          {/* Dono marcado pelo contorno da casa na cor dele, sem cobrir o nome nem a arte do estado. */}
          {property.ownerId && <Line points={outline} color={ownerColor} lineWidth={3.5} />}
          <group position={[anchor.x, anchor.surfaceY, anchor.z]} rotation={[0, anchor.rotationY, 0]}>
            {/* Construções na faixa interna da casa (buildingArea), de frente para fora. */}
            {building && (
              <group position={[building.x, 0, building.z]}>
                <PropertyBuildingModel level={building.level} color={ownerColor} scale={building.scale}/>
              </group>
            )}
            {hostMultiplier !== null && (
              <OlympicHost
                placement={{ index: anchor.index, x: anchor.x, z: anchor.z, rotationY: anchor.rotationY, width: anchor.width, depth: anchor.depth, isCorner: false }}
                multiplier={hostMultiplier}
              />
            )}
          </group>
        </group>
      ))}
    </>
  );
}
