import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import asset from './diceAsset.json';
import { diceFaceRotation, type DiceFace } from './diceOrientation';

/** Dado visual com pivô central. Não sorteia, não anima e não lê o estado da partida. */
export function DiceVisual({ face = 1, size = asset.suggestedSize }: { face?: DiceFace; size?: number }) {
  const { scene } = useGLTF(asset.file);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse(child => { child.castShadow = true; child.receiveShadow = true; });
    return copy;
  }, [scene]);
  if (!(size > 0) || !Number.isFinite(size)) throw new Error('O tamanho do dado deve ser positivo e finito.');
  return <group scale={size} rotation={diceFaceRotation(face)}><primitive object={model} /></group>;
}

/** A engenharia escolhe quando pré-carregar; importar o componente não dispara download. */
export function preloadDiceVisual() {
  useGLTF.preload(asset.file);
}
