// Personagem do jogador carregado do manifesto (characters.json; contrato em
// docs/11-contratos-claude-codex.md); a base colorida é outro componente (PlayerBase). Esqueleto e animações são
// opcionais: modelos estáticos (ex.: Meshy sem rig) funcionam igual. Um modelo ausente ou com erro
// cai no personagem reserva, com aviso no console.
import { useAnimations, useGLTF } from '@react-three/drei';
import { Component, type ReactNode, Suspense, useEffect, useMemo, useRef } from 'react';
import { Box3, type Group, type Object3D } from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AvatarId } from '@imperio/shared-types';
import { type CharacterAsset, characterFiles, characterFor, fallbackCharacter } from './characterManifest';
import { normalizePlacement } from './normalize';

export type AvatarMotion = 'idle' | 'walk';

function hasSkin(root: Object3D): boolean {
  let skinned = false;
  root.traverse((child) => {
    if ((child as { isSkinnedMesh?: boolean }).isSkinnedMesh) skinned = true;
  });
  return skinned;
}

/** Modelo normalizado; animação só se o clip existir no arquivo. */
function CharacterModel({ asset, motion }: { asset: CharacterAsset; motion: AvatarMotion }) {
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
    const action = actions[motion] ?? (asset.idleClip ? actions[asset.idleClip] : undefined);
    action?.reset().fadeIn(0.15).play();
    return () => {
      action?.fadeOut(0.15);
    };
  }, [actions, motion, asset.idleClip]);

  return (
    <group rotation={[0, asset.rotationY, 0]}>
      <group ref={root} position={placement.position} scale={placement.scale}>
        <primitive object={model} />
      </group>
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
export function AvatarFigure({ avatarId, motion = 'idle' }: { avatarId: AvatarId; motion?: AvatarMotion }) {
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
              <CharacterModel asset={reserve} motion={motion} />
            </Suspense>
          </ModelFallback>
        )
      }
    >
      <Suspense fallback={null}>
        <CharacterModel asset={asset} motion={motion} />
      </Suspense>
    </ModelFallback>
  );
}

/** Baixa cada modelo uma vez logo no início, para não piscar quando a partida ou a sala abrirem. */
export function preloadAvatars() {
  characterFiles().forEach((file) => useGLTF.preload(file));
}
