// Uniforme na cor do jogador (contrato 4 em docs/11-contratos-claude-codex.md, método
// "masked-luminance-v1"): recolore só onde a máscara UV manda (casaco e mangas da Luana), mantendo o
// sombreado do tecido original. Cada personagem ganha os próprios materiais e a própria cor; texturas
// (albedo e máscara) são compartilhadas e o material em cache do GLB não é alterado.
import { ClampToEdgeWrapping, Color, LinearFilter, type Material, type Mesh, NoColorSpace, type Object3D, type Texture, Vector2 } from 'three';
import type { CharacterUniform } from './characterManifest';

/** Ajusta a textura da máscara como o contrato pede (canal R linear, sem mipmaps, sem inverter). */
export function prepareUniformMask(mask: Texture): Texture {
  if (mask.userData.uniformMaskReady) return mask;
  mask.colorSpace = NoColorSpace;
  mask.flipY = false;
  mask.generateMipmaps = false;
  mask.minFilter = LinearFilter;
  mask.magFilter = LinearFilter;
  mask.wrapS = ClampToEdgeWrapping;
  mask.wrapT = ClampToEdgeWrapping;
  mask.userData.uniformMaskReady = true;
  mask.needsUpdate = true;
  return mask;
}

/** Sem faixa de altura no manifesto, a proteção não corta nada. */
const NO_GUARD: [number, number] = [-1e9, 1e9];

/** Trechos injetados no shader (exportados para os testes conferirem a fórmula do contrato). */
export const UNIFORM_VERTEX = {
  header: 'varying float uniformLocalY;\n',
  // Logo depois de begin_vertex, position ainda é a geometria original: antes de morph/skinning e
  // da normalização do manifesto (que é feita por transformações de grupo).
  afterBeginVertex: '#include <begin_vertex>\nuniformLocalY = position.y;',
};

export const UNIFORM_FRAGMENT = {
  header:
    'uniform sampler2D uniformMask;\nuniform vec3 uniformPlayerColor;\nuniform float uniformReference;\nuniform vec2 uniformLocalYRange;\nvarying float uniformLocalY;\n',
  afterMap: [
    '#include <map_fragment>',
    'float uniformWeight = texture2D(uniformMask, vMapUv).r * step(uniformLocalYRange.x, uniformLocalY) * step(uniformLocalY, uniformLocalYRange.y);',
    'float uniformShade = clamp(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) / uniformReference, 0.15, 2.0);',
    'diffuseColor.rgb = mix(diffuseColor.rgb, uniformPlayerColor * uniformShade, uniformWeight);',
  ].join('\n'),
};

export interface UniformTint {
  /** Troca a cor sem recompilar o shader (só o valor do uniforme muda). */
  setColor(hex: string): void;
  /** Libera só os materiais criados para este personagem; texturas compartilhadas ficam. */
  dispose(): void;
  readonly materials: Material[];
}

/**
 * Aplica o uniforme a uma cópia do personagem (o `model` já deve ser uma cópia própria; os materiais
 * dele ainda são os do cache e são trocados por clones aqui).
 */
export function applyUniformTint(model: Object3D, mask: Texture, uniform: CharacterUniform, hex: string): UniformTint {
  // A cor da instância, em espaço linear (Color converte o hexadecimal sRGB no espaço de trabalho).
  const playerColor = { value: new Color(hex) };
  const range = uniform.localYRange ?? NO_GUARD;
  const materials: Material[] = [];

  model.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    const tint = (original: Material): Material => {
      const material = original.clone();
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uniformMask = { value: mask };
        shader.uniforms.uniformPlayerColor = playerColor;
        shader.uniforms.uniformReference = { value: uniform.referenceLuminance };
        shader.uniforms.uniformLocalYRange = { value: new Vector2(range[0], range[1]) };
        shader.vertexShader = UNIFORM_VERTEX.header + shader.vertexShader.replace('#include <begin_vertex>', UNIFORM_VERTEX.afterBeginVertex);
        shader.fragmentShader = UNIFORM_FRAGMENT.header + shader.fragmentShader.replace('#include <map_fragment>', UNIFORM_FRAGMENT.afterMap);
      };
      // Todas as cópias dividem o mesmo programa compilado; só os valores dos uniformes mudam.
      material.customProgramCacheKey = () => 'imperio-uniform-masked-luminance-v1';
      materials.push(material);
      return material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint(mesh.material);
  });

  return {
    materials,
    setColor(next: string) {
      playerColor.value.set(next);
    },
    dispose() {
      materials.forEach((material) => material.dispose());
    },
  };
}
