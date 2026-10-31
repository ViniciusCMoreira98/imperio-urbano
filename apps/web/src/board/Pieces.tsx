// Peões, construções e marcadores desenhados a partir do snapshot do servidor.
import { useMemo } from 'react';
import { board } from '@imperio/game-data';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { tilePlacement } from './layout';
import { HotelModel, HouseModel } from './BuildingModels';
import { OlympicHost } from './OlympicHost';
import { Pawn } from './Pawn';
import { TILE_HEIGHT } from './Tile';

/** Cantos da casa para até 4 peões, conforme o assento. */
const SEAT_OFFSETS: [number, number][] = [
  [-0.22, -0.22],
  [0.22, -0.22],
  [-0.22, 0.22],
  [0.22, 0.22],
];

export function Pawns() {
  const players = useGameStore((s) => s.snapshot?.players);
  if (!players) return null;
  return (
    <>
      {players
        .filter((p) => !p.bankrupt)
        .map((p) => (
          <Pawn
            key={p.id}
            position={p.position}
            avatarId={p.avatarId}
            color={PAWN_COLORS[p.pawnColor].hex}
            offset={SEAT_OFFSETS[p.seat % SEAT_OFFSETS.length]}
          />
        ))}
    </>
  );
}

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
