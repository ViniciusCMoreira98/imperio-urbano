// Construções e marcadores desenhados a partir do snapshot do servidor (arte: Codex).
// Os personagens moram em Pawns.tsx (engenharia); a reexportação mantém o import da cena.
import { useMemo } from 'react';
import { board } from '@imperio/game-data';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { ownerStrip } from './buildingLayout';
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
        strip: ownerStrip(anchor),
        ownerColor: colorOf.get(property.ownerId ?? '') ?? '#ffffff',
        hostMultiplier: snapshot.olympics.hostStateId === property.stateId ? snapshot.olympics.multiplier : null,
      };
    });
  }, [snapshot]);

  return (
    <>
      {items.map(({ property, anchor, building, strip, ownerColor, hostMultiplier }) => (
        <group key={property.stateId} position={[anchor.x, anchor.surfaceY, anchor.z]} rotation={[0, anchor.rotationY, 0]}>
          {/* Cor do dono na faixa e na base; fachada mantém a paleta original do modal. */}
          <mesh position={[0, 0.006, strip.z]}>
            <boxGeometry args={[strip.width, 0.012, strip.depth]} />
            <meshStandardMaterial color={ownerColor} />
          </mesh>
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
      ))}
    </>
  );
}
