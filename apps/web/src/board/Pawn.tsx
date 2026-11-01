// Personagem do jogador no tabuleiro. Anda por saltos procedurais (sem animação de esqueleto), um por
// casa, a partir da fila de movimentos oficiais (store/gameStore: moves). Cada salto: giro para a
// próxima casa, preparação, arco e aterrissagem. A animação só representa o estado: ao terminar, ou se
// a sequência se perder (resync), o personagem vai para o lugar oficial do snapshot.
// A base colorida fica sempre na superfície; só o corpo (e a seta de vez) sobe no salto.
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Color, type Group, type Mesh, MeshBasicMaterial } from 'three';
import { board } from '@imperio/game-data';
import type { AvatarId } from '@imperio/shared-types';
import { AvatarFigure } from '../avatars/AvatarFigure';
import { characterFor } from '../avatars/characterManifest';
import { ActiveMarker, BASE_HEIGHT, PlayerBase } from '../avatars/PlayerBase';
import { type PawnMove, hopTiles } from '../game/moves';
import { useGameStore } from '../store/gameStore';
import { tileAnchor } from './layout';
import type { PawnSpot } from './pawnLayout';

const TILE_COUNT = board.tiles.length;

/** Tempos (s) e altura de cada salto: o curto, casa a casa; o longo, direto ao destino. */
const HOP = { turn: 0.12, prepare: 0.06, air: 0.24, land: 0.08, height: 0.22 };
const LEAP = { turn: 0.18, prepare: 0.1, air: 0.7, land: 0.12, height: 1.3 };
/** Agachamento antes de sair e ao pousar (só o grupo do corpo desce; nada estica). */
const CROUCH = 0.03;
/** Fila maior que isso (aba em segundo plano, rede atrasada): pula direto para o último destino. */
const MAX_QUEUED = 2;
/** Deslize até o novo lugar dentro da mesma casa (alguém entrou ou saiu dela). */
const SHIFT_DURATION = 0.3;
/** Giro suave para a câmera quando parado. */
const TURN_SPEED = 8;

interface PawnProps {
  playerId: string;
  /** Casa oficial no snapshot. */
  position: number;
  /** Lugar oficial dentro da casa (pawnLayout), derivado do snapshot. */
  spot: PawnSpot;
  avatarId: AvatarId;
  color: string;
  /** É a vez deste jogador: base pulsando e seta sobre a cabeça. */
  active: boolean;
}

/** Ângulo equivalente a `target` mais próximo de `current` (gira pelo lado mais curto). */
function nearest(current: number, target: number): number {
  return current + Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

function centerOf(tile: number): PawnSpot {
  const anchor = tileAnchor(tile);
  return { x: anchor.x, y: anchor.surfaceY, z: anchor.z };
}

export function Pawn({ playerId, position, spot, avatarId, color, active }: PawnProps) {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const faceRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const ringMaterial = useMemo(
    () => new MeshBasicMaterial({ color: new Color(color).multiplyScalar(1.5), transparent: true, opacity: 0, toneMapped: false }),
    [color],
  );
  useEffect(() => () => ringMaterial.dispose(), [ringMaterial]);

  // Estado oficial mais recente, lido pelas animações quando terminam (nunca uma cópia antiga).
  const latest = useRef({ position, spot });
  latest.current = { position, spot };
  const shownTile = useRef(position);
  const handled = useRef(-1);
  const queue = useRef<PawnMove[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const shift = useRef<gsap.core.Tween | null>(null);

  /** Vai já para o lugar oficial, abandonando animações (reconexão, eventos perdidos, falha). */
  const snap = () => {
    timeline.current?.kill();
    timeline.current = null;
    shift.current?.kill();
    queue.current = [];
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return;
    const { spot: target, position: tile } = latest.current;
    root.position.set(target.x, target.y, target.z);
    body.position.y = BASE_HEIGHT;
    shownTile.current = tile;
  };

  /** Ao fim dos saltos: confere com o oficial e acomoda no lugar certo dentro da casa. */
  const settle = () => {
    const root = rootRef.current;
    if (!root) return;
    const { spot: target, position: tile } = latest.current;
    if (shownTile.current !== tile) {
      snap();
      return;
    }
    shift.current?.kill();
    shift.current = gsap.to(root.position, { x: target.x, y: target.y, z: target.z, duration: SHIFT_DURATION, ease: 'power2.out' });
  };

  const land = () => {
    const ring = ringRef.current;
    if (!ring) return;
    gsap.fromTo(ring.scale, { x: 0.6, y: 0.6, z: 0.6 }, { x: 1.7, y: 1.7, z: 1.7, duration: 0.35, ease: 'power2.out' });
    gsap.fromTo(ringMaterial, { opacity: 0.75 }, { opacity: 0, duration: 0.35, ease: 'power1.out' });
  };

  const runNext = () => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const face = faceRef.current;
    const move = queue.current.shift();
    if (!move || !root || !body || !face) {
      timeline.current = null;
      settle();
      return;
    }
    const tiles = hopTiles(move, TILE_COUNT);
    const style = move.kind === 'jump' ? LEAP : HOP;
    const tl = gsap.timeline({ onComplete: runNext });
    tiles.forEach((tile, i) => {
      // Decidido na hora do salto (o snapshot chega logo depois dos eventos): a última casa do último
      // movimento pendente pousa direto no lugar oficial dentro dela; as outras, no centro.
      const target = () =>
        i === tiles.length - 1 && queue.current.length === 0 && move.to === latest.current.position ? latest.current.spot : centerOf(tile);
      const angle = () => Math.atan2(target().x - root.position.x, target().z - root.position.z);
      const label = `salto${i}`;
      tl.to(face.rotation, { y: () => nearest(face.rotation.y, angle()), duration: style.turn, ease: 'power2.out' })
        .to(body.position, { y: BASE_HEIGHT - CROUCH, duration: style.prepare, ease: 'power1.in' }, '<')
        .addLabel(label)
        .to(root.position, { x: () => target().x, y: () => target().y, z: () => target().z, duration: style.air, ease: 'power1.inOut' }, label)
        .to(body.position, { y: BASE_HEIGHT + style.height, duration: style.air / 2, ease: 'power2.out' }, label)
        .to(body.position, { y: BASE_HEIGHT - CROUCH, duration: style.air / 2, ease: 'power2.in' }, `${label}+=${style.air / 2}`)
        .call(land)
        .to(body.position, { y: BASE_HEIGHT, duration: style.land, ease: 'power2.out' });
    });
    tl.call(() => {
      shownTile.current = move.to;
    });
    timeline.current = tl;
  };

  // Primeira montagem (entrou na partida ou reconectou): já no lugar, ignorando movimentos antigos.
  useLayoutEffect(() => {
    const state = useGameStore.getState();
    handled.current = state.moves.reduce((max, m) => (m.playerId === playerId ? Math.max(max, m.id) : max), -1);
    snap();
    return () => {
      timeline.current?.kill();
      shift.current?.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Novos movimentos oficiais deste jogador entram na fila; ressincronia leva direto ao snapshot.
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (state.resync !== previous.resync) {
          handled.current = state.moves.reduce((max, m) => Math.max(max, m.id), handled.current);
          snap();
          return;
        }
        if (state.moves === previous.moves) return;
        for (const move of state.moves) {
          if (move.playerId !== playerId || move.id <= handled.current) continue;
          handled.current = move.id;
          queue.current.push(move);
        }
        if (queue.current.length > MAX_QUEUED) {
          // Atrasado demais para animar tudo: um salto direto ao último destino.
          const last = queue.current[queue.current.length - 1];
          queue.current = [{ ...last, from: shownTile.current, kind: 'jump' }];
        }
        if (!timeline.current && queue.current.length > 0) {
          shift.current?.kill();
          runNext();
        }
      }),
    [playerId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Snapshot mudou sem salto em andamento: mesma casa → acomoda; casa diferente sem evento → vai direto.
  useEffect(() => {
    if (timeline.current || queue.current.length > 0) return;
    if (shownTile.current === position) settle();
    else snap();
  }, [position, spot.x, spot.y, spot.z]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parado, vira devagar para a câmera (só no eixo vertical). Durante os saltos, o giro é do timeline.
  useFrame(({ camera }, delta) => {
    const root = rootRef.current;
    const face = faceRef.current;
    if (!root || !face || timeline.current) return;
    const target = Math.atan2(camera.position.x - root.position.x, camera.position.z - root.position.z);
    face.rotation.y += (nearest(face.rotation.y, target) - face.rotation.y) * Math.min(1, delta * TURN_SPEED);
  });

  return (
    <group ref={rootRef} scale={0.95}>
      <PlayerBase color={color} active={active} />
      <mesh ref={ringRef} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ringMaterial}>
        <ringGeometry args={[0.22, 0.27, 32]} />
      </mesh>
      <group ref={bodyRef} position={[0, BASE_HEIGHT, 0]}>
        <group ref={faceRef}>
          <Suspense fallback={null}>
            <AvatarFigure avatarId={avatarId} />
          </Suspense>
        </group>
        {active && <ActiveMarker color={color} height={characterFor(avatarId).height + 0.25} />}
      </group>
    </group>
  );
}
