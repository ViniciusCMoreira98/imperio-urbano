import { Canvas } from '@react-three/fiber';
import { board, states } from '@imperio/game-data';
import { Buildings, Pawns } from './Pieces';
import { BoardCenter } from './BoardCenter';
import { CameraRig } from './CameraRig';
import { CenterInfo } from './CenterInfo';
import { CORNER_SIZE, boardLength, tilePlacement } from './layout';
import { RioScene } from './RioScene';
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

// Bordas elevadas: duas barras ao longo de x e duas ao longo de z, cada uma com uma faixa de neon.
const frameBars = [
  { position: [0, 0, (LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH], neon: '#c084fc' },
  { position: [0, 0, -(LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH], neon: '#facc15' },
  { position: [(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH], neon: '#22d3ee' },
  { position: [-(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH], neon: '#f472b6' },
] as const;
const NEON_WIDTH = 0.07;

export function BoardScene() {
  return (
    <Canvas shadows camera={{ position: [13, 18, 13], fov: 35, far: 500 }} dpr={[1, 2]}>
      {/* Tabuleiro sobre a orla do Rio ao entardecer: luz quente do sol baixo e céu arroxeado. */}
      <color attach="background" args={['#2a2350']} />
      <hemisphereLight args={['#d9ccff', '#2a2350', 0.95]} />
      <RioScene boardSize={OUTER} />
      <directionalLight
        position={[10, 16, 6]}
        intensity={1.7}
        color="#ffe4c8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-OUTER * 1.5}
        shadow-camera-right={OUTER * 1.5}
        shadow-camera-top={OUTER * 1.5}
        shadow-camera-bottom={-OUTER * 1.5}
        shadow-camera-far={80}
      />

      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[OUTER, 0.4, OUTER]} />
        <meshStandardMaterial color="#1a2142" />
      </mesh>

      {frameBars.map(({ position, size, neon }, i) => {
        const alongX = size[0] > size[1];
        return (
          <group key={i} position={[position[0], 0, position[2]]}>
            <mesh position={[0, FRAME_HEIGHT / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[size[0], FRAME_HEIGHT, size[1]]} />
              <meshStandardMaterial color="#1f2750" metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[0, FRAME_HEIGHT + 0.005, 0]}>
              <boxGeometry args={alongX ? [size[0], 0.02, NEON_WIDTH] : [NEON_WIDTH, 0.02, size[1]]} />
              <meshBasicMaterial color={neon} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {tiles.map((t) => (
        <Tile key={t.tile.index} {...t} />
      ))}

      <BoardCenter size={LENGTH - 2 * CORNER_SIZE} />
      <CenterInfo size={LENGTH - 2 * CORNER_SIZE} />

      <Buildings />
      <Pawns />

      <CameraRig fitRadius={OUTER * 0.6} />
    </Canvas>
  );
}
