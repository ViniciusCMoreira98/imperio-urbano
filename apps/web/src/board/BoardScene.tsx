/** Referência histórica de geometria de 36 casas; não montar na partida atual.
 * A cena ativa é GameBoard → ReferenceBoardScene. Utilitários compartilhados ainda
 * têm consumidores ativos; conferir C4 em docs/ORIENTACOES-CODEX.md antes de remover.
 */
import { Canvas } from '@react-three/fiber';
import { board, states } from '@imperio/game-data';
import { Buildings, Pawns } from './Pieces';
import { BoardCenter } from './BoardCenter';
import { CameraRig } from './CameraRig';
import { CORNER_SIZE, LEGACY_TILES_PER_SIDE, boardLength, tilePlacement } from './layout';
import { WoodenTableScene } from './WoodenTableScene';
import { Tile } from './Tile';
import { FixedBoardViewport } from './camera/FixedBoardViewport';
import { FIXED_CAMERA } from './camera/fixedCamera';

const LENGTH = boardLength(LEGACY_TILES_PER_SIDE);
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
    placement: tilePlacement(tile.index, LEGACY_TILES_PER_SIDE),
  };
});

// Bordas elevadas: duas barras ao longo de x e duas ao longo de z, cada uma com uma faixa de neon.
const frameBars = [
  { position: [0, 0, (LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH], neon: '#ffcd40' },
  { position: [0, 0, -(LENGTH + FRAME_WIDTH) / 2], size: [OUTER, FRAME_WIDTH], neon: '#facc15' },
  { position: [(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH], neon: '#ffcd40' },
  { position: [-(LENGTH + FRAME_WIDTH) / 2, 0, 0], size: [FRAME_WIDTH, LENGTH], neon: '#ffcd40' },
] as const;
const NEON_WIDTH = 0.07;

export function BoardScene() {
  return (
    <FixedBoardViewport><Canvas shadows camera={{ position: FIXED_CAMERA.position as [number,number,number], fov: FIXED_CAMERA.fov, far: FIXED_CAMERA.far }} dpr={[1, 2]}>
      <color attach="background" args={['#492a1d']} />
      <hemisphereLight args={['#fff4df', '#533023', 1.1]} />
      <WoodenTableScene />
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
        <meshStandardMaterial color="#422719" roughness={.5} />
      </mesh>

      {frameBars.map(({ position, size, neon }, i) => {
        const alongX = size[0] > size[1];
        return (
          <group key={i} position={[position[0], 0, position[2]]}>
            <mesh position={[0, FRAME_HEIGHT / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[size[0], FRAME_HEIGHT, size[1]]} />
              <meshStandardMaterial color="#713b1f" metalness={0.25} roughness={0.45} />
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

      <Buildings />
      <Pawns />

      <CameraRig />
    </Canvas></FixedBoardViewport>
  );
}
