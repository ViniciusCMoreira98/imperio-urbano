// Destaque das casas que o jogador da vez pode escolher tocando no tabuleiro (sede das Olimpíadas ou
// estado de destino da viagem): brilho dourado pulsando no contorno real de cada casa, as demais escurecidas e a
// escolhida clara.
// Só mostra; quem decide quais casas valem é boardChoice, e o servidor confere o comando.
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { DoubleSide, MeshBasicMaterial, Shape, ShapeGeometry, Vector2 } from 'three';
import { boardChoice } from '../game/boardChoice';
import { useAppStore } from '../store/appStore';
import { useTableBusy } from '../store/tableBusy';
import { useGameStore } from '../store/gameStore';
import { useViewStore } from '../store/viewStore';
import { useSaleStore } from '../store/saleStore';
import { board } from '@imperio/game-data';
import { tileAnchor } from './layout';

const GOLD = '#fbbf24';
const PICKED = '#fff7d6';
/** Acima da superfície e do contorno do dono, sem piscar com a casa. */
const LIFT = 0.006;

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function ChoiceHighlights() {
  const myId = useAppStore((s) => s.session?.playerId);
  const snapshot = useGameStore((s) => s.snapshot);
  const selected = useViewStore((s) => s.selectedTile);
  // Venda para pagar dívida: vários estados marcados de uma vez.
  const salePicked = useSaleStore((s) => s.picked);
  // Só depois que o peão chega na casa (Olimpíadas ou Aeroporto), junto com o aviso do meio da tela.
  const tableBusy = useTableBusy();
  const choice = snapshot && myId ? boardChoice(snapshot, myId) : null;
  const tiles = choice?.tiles;
  const key = tiles?.join(',') ?? '';

  // Um material para todas as casas: o pulso muda todas de uma vez.
  const fill = useMemo(() => new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.25, depthWrite: false, side: DoubleSide }), []);
  const picked = useMemo(() => new MeshBasicMaterial({ color: PICKED, transparent: true, opacity: 0.5, depthWrite: false, side: DoubleSide }), []);
  // As casas que não valem ficam na sombra para as escolhíveis saltarem aos olhos.
  const dim = useMemo(() => new MeshBasicMaterial({ color: '#0b0820', transparent: true, opacity: 0.55, depthWrite: false, side: DoubleSide }), []);
  useEffect(
    () => () => {
      fill.dispose();
      picked.dispose();
      dim.dispose();
    },
    [fill, picked, dim],
  );

  const shapes = useMemo(
    () =>
      (tiles ? board.tiles.map((t) => t.index) : []).map((index) => {
        const anchor = tileAnchor(index);
        // ShapeGeometry fica no plano XY; girar -90° em X leva (x, -z) para (x, 0, z).
        const shape = new Shape(anchor.polygon.map(([x, z]) => new Vector2(x, -z)));
        return {
          index,
          candidate: tiles!.includes(index),
          geometry: new ShapeGeometry(shape),
          outline: [...anchor.polygon, anchor.polygon[0]].map(([x, z]) => [x, 0, z] as [number, number, number]),
          y: anchor.surfaceY + LIFT,
          lift: anchor.selectedLift,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  useEffect(() => () => shapes.forEach((s) => s.geometry.dispose()), [shapes]);

  useFrame(({ clock }) => {
    if (reducedMotion()) return;
    fill.opacity = 0.22 + 0.25 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 4));
  });

  if (!choice || tableBusy) return null;
  return (
    <group>
      {shapes.map(({ index, candidate, geometry, outline, y, lift }) => {
        const isPicked = candidate && (choice.kind === 'sale' ? salePicked.includes(index) : index === selected);
        return (
          <group key={index} position={[0, y + (isPicked ? lift : 0), 0]}>
            <mesh geometry={geometry} material={isPicked ? picked : candidate ? fill : dim} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3} />
            {candidate && <Line points={outline} color={isPicked ? PICKED : GOLD} lineWidth={isPicked ? 6 : 4} />}
          </group>
        );
      })}
    </group>
  );
}
