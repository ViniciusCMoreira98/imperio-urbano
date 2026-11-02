// Personagem do jogador carregado do manifesto (characters.json; contrato em
// docs/11-contratos-claude-codex.md); a base colorida é outro componente (PlayerBase). Esqueleto e animações são
// opcionais: modelos estáticos (ex.: Meshy sem rig) funcionam igual. Um modelo ausente ou com erro
// cai no personagem reserva, com aviso no console. Com 'uniform' no manifesto, casaco e mangas seguem
// a cor do jogador (uniformTint.ts); sem ele, o modelo mantém as cores originais.
import { useAnimations, useGLTF } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { Component, type ReactNode, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Box3, type Group, type Material, type Mesh, type Object3D, TextureLoader } from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AvatarId } from '@imperio/shared-types';
import { type CharacterAsset, type CharacterUniform, characterFiles, characterFor, characterManifest, fallbackCharacter } from './characterManifest';
import { normalizePlacement } from './normalize';
import { type UniformTint, applyUniformTint, prepareUniformMask } from './uniformTint';

/** Clips procurados por nome no GLB (contrato 1 em docs/11); todos opcionais. */
export type AvatarMotion = 'idle' | 'walk' | 'celebrate' | 'defeat';

/** Avisa se o modelo tem o clip pedido (sem ele, quem chamou faz a versão procedural). */
export type MotionReport = (motion: AvatarMotion, hasClip: boolean) => void;

function hasSkin(root: Object3D): boolean {
  let skinned = false;
  root.traverse((child) => {
    if ((child as { isSkinnedMesh?: boolean }).isSkinnedMesh) skinned = true;
  });
  return skinned;
}

/**
 * Uniforme na cor do jogador sobre a cópia do modelo: troca os materiais antes de desenhar e, ao sair,
 * devolve os originais e libera só os clones (seguro com a montagem dupla do modo estrito do React).
 */
function UniformLayer({ model, uniform, color }: { model: Object3D; uniform: CharacterUniform; color: string }) {
  const loaded = useLoader(TextureLoader, uniform.mask);
  const mask = useMemo(() => prepareUniformMask(loaded), [loaded]);
  const tint = useRef<UniformTint | null>(null);
  const colorRef = useRef(color);
  colorRef.current = color;

  useLayoutEffect(() => {
    const originals = new Map<Mesh, Material | Material[]>();
    model.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) originals.set(mesh, mesh.material);
    });
    const applied = applyUniformTint(model, mask, uniform, colorRef.current);
    tint.current = applied;
    return () => {
      tint.current = null;
      originals.forEach((material, mesh) => {
        mesh.material = material;
      });
      applied.dispose();
    };
  }, [model, mask, uniform]);

  // Trocar a cor só muda o valor do uniforme desta cópia (sem recompilar, sem afetar outras).
  useEffect(() => {
    tint.current?.setColor(color);
  }, [color]);
  return null;
}

/** Máscara que não carrega: o personagem fica com as cores originais, com aviso no console. */
class MaskBoundary extends Component<{ mask: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[personagens] Máscara do uniforme ${this.props.mask} não carregou; mantendo as cores do modelo.`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Modelo normalizado; animação só se o clip existir no arquivo. */
function CharacterModel({ asset, motion, color, onMotion }: { asset: CharacterAsset; motion: AvatarMotion; color: string; onMotion?: MotionReport }) {
  const { scene, animations } = useGLTF(asset.file);
  // Cada peão precisa da própria cópia; com esqueleto, a cópia precisa religar os ossos.
  const model = useMemo(() => {
    const copy = hasSkin(scene) ? cloneSkinned(scene) : scene.clone(true);
    copy.traverse((child) => {
      child.castShadow = true;
    });
    return copy;
  }, [scene]);
  const placement = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    return normalizePlacement({ min: box.min.toArray(), max: box.max.toArray() }, asset.height, asset.offset);
  }, [scene, asset.height, asset.offset]);

  const root = useRef<Group>(null);
  const { actions } = useAnimations(animations, root);
  useEffect(() => {
    // Clip pedido, senão o de "parado" do manifesto, senão nenhum (modelo estático).
    const own = actions[motion];
    onMotion?.(motion, Boolean(own));
    const action = own ?? (asset.idleClip ? actions[asset.idleClip] : undefined);
    action?.reset().fadeIn(0.15).play();
    return () => {
      action?.fadeOut(0.15);
    };
  }, [actions, motion, asset.idleClip]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group rotation={[0, asset.rotationY, 0]}>
      <group ref={root} position={placement.position} scale={placement.scale}>
        <primitive object={model} />
      </group>
      {asset.uniform && (
        <MaskBoundary mask={asset.uniform.mask}>
          <UniformLayer model={model} uniform={asset.uniform} color={color} />
        </MaskBoundary>
      )}
    </group>
  );
}

/** Troca um modelo que falhou ao carregar pelo personagem reserva, avisando a dependência. */
class ModelFallback extends Component<{ asset: CharacterAsset; children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[personagens] Modelo "${this.props.asset.id}" (${this.props.asset.file}) não carregou; usando o reserva.`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Só o personagem, com os pés em y = 0 e o rosto virado para +z. */
export function AvatarFigure({
  avatarId,
  color,
  motion = 'idle',
  onMotion,
}: {
  avatarId: AvatarId;
  color: string;
  motion?: AvatarMotion;
  onMotion?: MotionReport;
}) {
  const asset = characterFor(avatarId);
  const reserve = fallbackCharacter();
  return (
    <ModelFallback
      key={asset.id}
      asset={asset}
      fallback={
        asset.id === reserve.id ? null : (
          <ModelFallback asset={reserve} fallback={null}>
            <Suspense fallback={null}>
              <CharacterModel asset={reserve} motion={motion} color={color} onMotion={onMotion} />
            </Suspense>
          </ModelFallback>
        )
      }
    >
      <Suspense fallback={null}>
        <CharacterModel asset={asset} motion={motion} color={color} onMotion={onMotion} />
      </Suspense>
    </ModelFallback>
  );
}

/** Baixa cada modelo uma vez logo no início, para não piscar quando a partida ou a sala abrirem. */
export function preloadAvatars() {
  characterFiles().forEach((file) => useGLTF.preload(file));
  characterManifest.characters.forEach((c) => {
    if (c.uniform) useLoader.preload(TextureLoader, c.uniform.mask);
  });
}
