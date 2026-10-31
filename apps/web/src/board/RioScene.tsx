// Ambiente em volta do tabuleiro (alvo visual: docs/referencias/visual-alvo.webp): o Rio ao entardecer,
// com prédios de janelas acesas, orla com coqueiros, mar com barcos, Pão de Açúcar e Cristo Redentor.
// Tudo procedural e low-poly (leve no celular). A câmera olha de +x+z: o alto da tela é -x-z, a esquerda
// é -x+z e a direita é +x-z. Cidade à esquerda e ao fundo, mar e morros à direita, como na referência.
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { BackSide, CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from 'three';

/** A cidade fica bem abaixo do tabuleiro, como numa vista aérea (o tabuleiro paira sobre a orla). */
const GROUND_Y = -7;
const SEA_Y = -7.3;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Céu de fim de tarde: roxo no alto, laranja no horizonte. */
function Sky() {
  const texture = useMemo(
    () =>
      canvasTexture(4, 512, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, '#1d1446');
        g.addColorStop(0.3, '#4a2d7c');
        g.addColorStop(0.45, '#b45c8c');
        g.addColorStop(0.5, '#ffb070');
        g.addColorStop(0.53, '#ff8f6b');
        g.addColorStop(0.6, '#24345e');
        g.addColorStop(1, '#101a33');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 4, 512);
      }),
    [],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh>
      <sphereGeometry args={[240, 32, 16]} />
      <meshBasicMaterial map={texture} side={BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
}

/** Fachada com janelas: algumas acesas (amarelo quente), outras apagadas. */
export function windowTexture(seed: number): CanvasTexture {
  const random = seeded(seed);
  const texture = canvasTexture(64, 128, (ctx) => {
    ctx.fillStyle = '#2b3355';
    ctx.fillRect(0, 0, 64, 128);
    for (let y = 4; y < 128; y += 10) {
      for (let x = 4; x < 64; x += 10) {
        const lit = random() < 0.45;
        ctx.fillStyle = lit ? (random() < 0.7 ? '#ffd27a' : '#fff1c4') : '#1a2140';
        ctx.fillRect(x, y, 6, 6);
      }
    }
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

function City({ inner }: { inner: number }) {
  const materials = useMemo(
    () =>
      [11, 23, 37].map((seed, i) => {
        const map = windowTexture(seed);
        map.repeat.set(1, 2 + i);
        return new MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.8 });
      }),
    [],
  );
  useEffect(() => () => materials.forEach((m) => { m.map?.dispose(); m.dispose(); }), [materials]);

  const buildings = useMemo(() => {
    const random = seeded(99);
    const list: { position: [number, number, number]; size: [number, number, number]; material: number; roof: string }[] = [];
    // Setores da cidade: esquerda (-x+z) até o fundo (-x-z).
    for (let i = 0; i < 70; i++) {
      const angle = Math.PI * 0.55 + random() * Math.PI * 0.85;
      const radius = inner + 3 + random() * 20;
      // Topo sempre abaixo do tabuleiro, para nunca cobrir as casas.
      const height = 1.5 + random() * random() * 4.5;
      const w = 0.9 + random() * 1.3;
      const d = 0.9 + random() * 1.3;
      list.push({
        position: [Math.cos(angle) * radius, GROUND_Y + height / 2, Math.sin(angle) * radius],
        size: [w, height, d],
        material: i % materials.length,
        roof: ['#3a3f66', '#4b3b6b', '#2f4a66'][i % 3],
      });
    }
    return list;
  }, [inner, materials.length]);

  return (
    <>
      {/* Chão da cidade (asfalto) no setor dos prédios. Deitado, o ângulo local θ vira o ângulo -θ no mundo. */}
      <mesh position={[0, GROUND_Y - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[inner + 22, 48, -Math.PI * 1.45, Math.PI * 0.95]} />
        <meshStandardMaterial color="#2a2f4a" />
      </mesh>
      {buildings.map(({ position, size, material, roof }, i) => (
        <group key={i} position={position}>
          <mesh material={materials[material]}>
            <boxGeometry args={size} />
          </mesh>
          <mesh position={[0, size[1] / 2 + 0.05, 0]}>
            <boxGeometry args={[size[0] * 1.02, 0.1, size[2] * 1.02]} />
            <meshStandardMaterial color={roof} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Sea() {
  const material = useMemo(
    () => new MeshStandardMaterial({ color: '#2d6fb5', emissive: '#4a3a8a', emissiveIntensity: 0.35, roughness: 0.2, metalness: 0.3 }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock }) => {
    material.emissiveIntensity = 0.32 + Math.sin(clock.elapsedTime * 0.7) * 0.05;
  });
  return (
    <mesh position={[0, SEA_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <circleGeometry args={[230, 48]} />
    </mesh>
  );
}

/** Morro arredondado (Pão de Açúcar, Corcovado, morros da orla). */
function Hill({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

/** Cristo Redentor estilizado, de braços abertos, iluminado. */
function Christ({ position, scale }: { position: [number, number, number]; scale: number }) {
  const stone = '#f3eee6';
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#d9d2c4" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.22, 0.42, 1.8, 10]} />
        <meshStandardMaterial color={stone} emissive="#fff3d6" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.4, 0.22, 0.28]} />
        <meshStandardMaterial color={stone} emissive="#fff3d6" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color={stone} emissive="#fff3d6" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Boat({ position, turn }: { position: [number, number, number]; turn: number }) {
  return (
    <group position={position} rotation={[0, turn, 0]}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0, 0.45, -0.2]}>
        <boxGeometry args={[0.5, 0.3, 0.9]} />
        <meshStandardMaterial color="#dfe7f2" emissive="#ffd27a" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

/** Coqueiro: tronco curvo em gomos e folhas compridas caindo. */
export function Palm({ position, height, lean, turn }: { position: [number, number, number]; height: number; lean: number; turn: number }) {
  const segments = 6;
  const segment = height / segments;
  return (
    <group position={position} rotation={[0, turn, 0]}>
      {Array.from({ length: segments }, (_, i) => {
        const t = (i + 0.5) / segments;
        return (
          <mesh key={i} position={[lean * t * t, segment * (i + 0.5), 0]} rotation={[0, 0, -lean * t * 0.25]}>
            <cylinderGeometry args={[0.11 - t * 0.03, 0.14 - t * 0.03, segment * 1.02, 7]} />
            <meshStandardMaterial color={i % 2 ? '#7a5c3e' : '#8a6a48'} flatShading />
          </mesh>
        );
      })}
      <group position={[lean, height, 0]}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
            <mesh position={[0, -0.22, 0.8]} rotation={[0.55, 0, 0]} scale={[0.28, 0.05, 1.05]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={i % 2 ? '#1f7a4a' : '#2b8f55'} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function RioScene({ boardSize }: { boardSize: number }) {
  const inner = boardSize * 0.85;
  const { palms, boats } = useMemo(() => {
    const random = seeded(5);
    // Orla à direita (+x-z) e à frente, entre a cidade e o mar.
    const palms = Array.from({ length: 10 }, (_, i) => {
      const angle = -Math.PI * 0.45 + (i / 9) * Math.PI * 0.9 + random() * 0.1;
      const radius = inner + 0.6 + random() * 1.4;
      return {
        position: [Math.cos(angle) * radius, GROUND_Y, Math.sin(angle) * radius] as [number, number, number],
        height: 3.2 + random() * 1.6,
        lean: 0.5 + random() * 0.7,
        turn: -angle,
      };
    });
    const boats = Array.from({ length: 6 }, (_, i) => {
      const angle = -Math.PI * 0.4 + i * 0.25 + random() * 0.1;
      const radius = inner + 8 + random() * 14;
      return {
        position: [Math.cos(angle) * radius, SEA_Y, Math.sin(angle) * radius] as [number, number, number],
        turn: random() * Math.PI,
      };
    });
    return { palms, boats };
  }, [inner]);

  return (
    <>
      <Sky />
      <fog attach="fog" args={['#3b2f63', 45, 170]} />
      <Sea />
      <City inner={inner} />

      {/* Orla: faixa de areia entre a cidade e o mar, abaixo do tabuleiro. */}
      <mesh position={[0, GROUND_Y - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner - 0.5, inner + 2.4, 64, 1, -Math.PI * 0.5, Math.PI * 1.05]} />
        <meshStandardMaterial color="#e8cf9a" />
      </mesh>
      {palms.map((palm, i) => (
        <Palm key={i} {...palm} />
      ))}
      {boats.map((boat, i) => (
        <Boat key={i} {...boat} />
      ))}

      {/* Pão de Açúcar e morros no mar, Cristo no Corcovado ao fundo à direita. */}
      <Hill position={[34, SEA_Y, -46]} scale={[6, 14, 6]} color="#3c5a4a" />
      <Hill position={[26, SEA_Y, -40]} scale={[4, 7, 4]} color="#476a52" />
      <Hill position={[2, SEA_Y, -70]} scale={[16, 20, 12]} color="#2f4a42" />
      <Christ position={[2, SEA_Y + 20, -70]} scale={1.6} />
      <Hill position={[60, SEA_Y, -20]} scale={[14, 8, 12]} color="#3a5548" />
    </>
  );
}
