import { Canvas } from '@react-three/fiber';
import { board, states } from '@imperio/game-data';
import { DemoPawn } from '../dev/DemoPawn';
import { BoardCenter } from './BoardCenter';
import { CameraRig } from './CameraRig';
import { CORNER_SIZE, boardLength, tilePlacement } from './layout';
import { Tile } from './Tile';

const LENGTH = boardLength(board.tilesPerSide);
const FRAME_WIDTH = 0.35;
const FRAME_HEIGHT = 0.3;
const OUTER = LENGTH + 2 * FRAME_WIDTH;

const statesById = new Map(states.map((s) => [s.id, s]));
const groupsById = new Map(board.colorGroups.map((g) => [g.id, g]));

const tiles = board.tiles.map((tile) => {
  const state = tile.stateId ? statesById.get(tile.stateId) : undefined;
  return {
    tile,
    state,
    group: state ? groupsById.get(state.colorGroup) : undefined,
    placement: tilePlacement(tile.index, board.tilesPerSide),
  };
});

// Bordas elevadas: duas barras ao longo de x e duas ao longo de z.
const frameBars = [
  { position: [0, 0, (LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH] },
  { position: [0, 0, -(LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH] },
  { position: [(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH] },
  { position: [-(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH] },
] as const;

export function BoardScene() {
  return (
    <Canvas shadows camera={{ position: [13, 18, 13], fov: 35 }} dpr={[1, 2]}>
      <color attach="background" args={['#0f1a2b']} />
      <hemisphereLight args={['#fff6e0', '#24344d', 0.7]} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-OUTER / 2}
        shadow-camera-right={OUTER / 2}
        shadow-camera-top={OUTER / 2}
        shadow-camera-bottom={-OUTER / 2}
      />

      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[OUTER, 0.4, OUTER]} />
        <meshStandardMaterial color="#c8b48a" />
      </mesh>

      {frameBars.map(({ position, size }, i) => (
        <mesh key={i} position={[position[0], FRAME_HEIGHT / 2, position[2]]} castShadow receiveShadow>
          <boxGeometry args={[size[0], FRAME_HEIGHT, size[1]]} />
          <meshStandardMaterial color="#8a5a3b" />
        </mesh>
      ))}

      {tiles.map((t) => (
        <Tile key={t.tile.index} {...t} />
      ))}

      <BoardCenter size={LENGTH - 2 * CORNER_SIZE} />

      <DemoPawn />

      <CameraRig fitRadius={OUTER * 0.6} />
    </Canvas>
  );
}
