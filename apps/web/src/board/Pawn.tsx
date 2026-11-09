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
import { type AvatarMotion, AvatarFigure } from '../avatars/AvatarFigure';
import { characterFor } from '../avatars/characterManifest';
import { ActiveMarker, BASE_HEIGHT, PlayerBase } from '../avatars/PlayerBase';
import { type PawnMove, enqueueMoves, hopTiles } from '../game/moves';
import { playSound } from '../audio/audio';
import { useCardStore } from '../store/cardStore';
import { useDiceStore } from '../store/diceStore';
import { usePawnStore } from '../store/pawnStore';
import { useGameStore } from '../store/gameStore';
import { forgetPawn, reportPawn } from './pawnDebug';
import { PAWN_SCALE, type PawnSpot, pawnCenter } from './pawnLayout';
import {PAWN_RENDER_ORDER} from './renderOrder';

const TILE_COUNT = board.tiles.length;

/** Tempos (s) e altura de cada salto: o curto, casa a casa; o longo, direto ao destino. */
const HOP = { turn: 0.12, prepare: 0.06, air: 0.24, land: 0.08, height: 0.22 };
/** Viagem do Aeroporto: casa a casa, mais rápida e baixa (pode passar de 30 casas). */
const TRAVEL = { turn: 0.04, prepare: 0.02, air: 0.11, land: 0.03, height: 0.14 };
const LEAP = { turn: 0.18, prepare: 0.1, air: 0.7, land: 0.12, height: 1.3 };
/** Agachamento antes de sair e ao pousar (só o grupo do corpo desce; nada estica). */
const CROUCH = 0.03;
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
  /** Visual scale of the body only; the base and all official positions remain unchanged. */
  figureScale?:number;
  /** É a vez deste jogador: base pulsando e seta sobre a cabeça. */
  active: boolean;
  /** Faliu: toca a saída (clip defeat, se houver) e some do tabuleiro. */
  leaving: boolean;
  /** Venceu: comemora parado (clip celebrate ou saltinhos procedurais). */
  celebrating: boolean;
}

/** Comemoração procedural (sem clip): saltinho e meia-volta, repetidos. */
const CHEER = { height: 0.3, up: 0.22, down: 0.2, spin: Math.PI };
/** Saída de quem faliu: pausa (ou o clip defeat), depois encolhe e afunda. */
const EXIT = { pause: 0.3, clipPause: 1.2, duration: 0.6, sink: 0.3 };

/** Ângulo equivalente a `target` mais próximo de `current` (gira pelo lado mais curto). */
function nearest(current: number, target: number): number {
  return current + Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

export function Pawn({ playerId, position, spot, avatarId, color, active, leaving, celebrating, figureScale=1 }: PawnProps) {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const faceRef = useRef<Group>(null);
  const figureRef = useRef<Group>(null);
  const initialFigureScale = useRef(figureScale);
  const markerAnchorRef = useRef<Group>(null);
  const desiredFigureScale = useRef(figureScale);
  if (!leaving) desiredFigureScale.current = figureScale;
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
  /** Cancela a espera pelos dados do lance (ressincronia, aba oculta, saída da partida). */
  const stopWaiting = useRef<(() => void) | null>(null);

  /** Vai já para o lugar oficial, abandonando animações (reconexão, eventos perdidos, falha). */
  const snap = () => {
    stopWaiting.current?.();
    stopWaiting.current = null;
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
    reportPawn(playerId, { tile, resting: true });
    // Sem animação, o saldo que esperava o personagem chegar aparece já.
    usePawnStore.getState().setLanded(playerId, handled.current);
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
    shift.current = gsap.to(root.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: SHIFT_DURATION,
      ease: 'power2.out',
      onComplete: () => reportPawn(playerId, { tile, resting: true }),
    });
  };

  /** Pouso de um salto: o agogô alterna duas notas a cada casa, como um ritmo de samba. */
  const land = (hop: number) => {
    playSound('saltoPeao', { rate: hop % 2 === 0 ? 1 : 1.19 });
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
    // Movimento que vem de uma carta (visita às Olimpíadas): parado em Eventos até a carta sumir da tela.
    if (move.cardId !== null && useCardStore.getState().doneId < move.cardId) {
      reportPawn(playerId, { tile: shownTile.current, resting: true });
      const cardId = move.cardId;
      const off = useCardStore.subscribe((cards) => {
        if (cards.doneId < cardId) return;
        off();
        stopWaiting.current = null;
        queue.current.unshift(move);
        runNext();
      });
      stopWaiting.current = off;
      timeline.current = gsap.timeline({ paused: true }); // marca a fila como ocupada
      return;
    }
    const tiles = hopTiles(move, TILE_COUNT);
    const style = move.kind === 'jump' ? LEAP : move.kind === 'travel' ? TRAVEL : HOP;
    reportPawn(playerId, { tile: move.to, resting: false });
    // Movimento que vem de um lance: o primeiro salto espera esses dados pararem na mesa.
    if (move.rollId !== null && useDiceStore.getState().shownRollId < move.rollId) {
      usePawnStore.getState().setWaiting(playerId, true);
      const rollId = move.rollId;
      const off = useDiceStore.subscribe((dice) => {
        if (dice.shownRollId < rollId) return;
        off();
        stopWaiting.current = null;
        usePawnStore.getState().setWaiting(playerId, false);
        queue.current.unshift(move);
        runNext();
      });
      stopWaiting.current = () => {
        off();
        usePawnStore.getState().setWaiting(playerId, false);
      };
      timeline.current = gsap.timeline({ paused: true }); // marca a fila como ocupada
      return;
    }
    const tl = gsap.timeline({ onComplete: runNext });
    tiles.forEach((tile, i) => {
      // Decidido na hora do salto (o snapshot chega logo depois dos eventos): a última casa do último
      // movimento pendente pousa direto no lugar oficial dentro dela; as outras, no centro.
      const target = () =>
        i === tiles.length - 1 && queue.current.length === 0 && move.to === latest.current.position ? latest.current.spot : pawnCenter(tile);
      const angle = () => Math.atan2(target().x - root.position.x, target().z - root.position.z);
      const label = `salto${i}`;
      tl.to(face.rotation, { y: () => nearest(face.rotation.y, angle()), duration: style.turn, ease: 'power2.out' })
        .to(body.position, { y: BASE_HEIGHT - CROUCH, duration: style.prepare, ease: 'power1.in' }, '<')
        .addLabel(label)
        .to(root.position, { x: () => target().x, y: () => target().y, z: () => target().z, duration: style.air, ease: 'power1.inOut' }, label)
        .to(body.position, { y: BASE_HEIGHT + style.height, duration: style.air / 2, ease: 'power2.out' }, label)
        .to(body.position, { y: BASE_HEIGHT - CROUCH, duration: style.air / 2, ease: 'power2.in' }, `${label}+=${style.air / 2}`)
        .call(() => {
          land(i);
          // Passou pelo Início: o bônus aparece no saldo agora.
          if (tile === 0) usePawnStore.getState().setPassedStart(playerId, move.id);
        })
        .to(body.position, { y: BASE_HEIGHT, duration: style.land, ease: 'power2.out' });
    });
    tl.call(() => {
      shownTile.current = move.to;
      // Pousou: aluguel, taxa e saque desta casa aparecem no saldo.
      usePawnStore.getState().setLanded(playerId, move.id);
    });
    timeline.current = tl;
  };

  // Primeira montagem (entrou na partida ou reconectou): já no lugar, ignorando movimentos antigos.
  useLayoutEffect(() => {
    const state = useGameStore.getState();
    handled.current = state.moves.reduce((max, m) => (m.playerId === playerId ? Math.max(max, m.id) : max), -1);
    snap();
    return () => {
      stopWaiting.current?.();
      timeline.current?.kill();
      shift.current?.kill();
      forgetPawn(playerId);
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
        const next = enqueueMoves(queue.current, state.moves, playerId, handled.current, shownTile.current);
        queue.current = next.queue;
        handled.current = next.handled;
        // Aba em segundo plano: o navegador pausa a animação e a fila viraria um replay atrasado ao
        // voltar. Vai direto; o snapshot que chega em seguida acerta a casa (efeito de position).
        if (document.hidden) {
          snap();
          return;
        }
        if (!timeline.current && queue.current.length > 0) {
          shift.current?.kill();
          runNext();
        }
      }),
    [playerId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Saiu da aba no meio dos saltos (ou voltou com eles pela metade): termina já no lugar oficial,
  // em vez de reproduzir depois o que ficou para trás.
  useEffect(() => {
    const onVisibility = () => {
      if (timeline.current || queue.current.length > 0) snap();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Snapshot mudou sem salto em andamento: mesma casa → acomoda; casa diferente sem evento → vai direto.
  useEffect(() => {
    if (timeline.current || queue.current.length > 0) return;
    if (shownTile.current === position) settle();
    else snap();
  }, [position, spot.x, spot.y, spot.z]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clips opcionais do modelo: com eles, a comemoração/saída usa o clip; sem eles, a versão procedural.
  const motion: AvatarMotion = celebrating ? 'celebrate' : leaving ? 'defeat' : 'idle';
  const clips = useRef<Partial<Record<AvatarMotion, boolean>>>({});
  const cheer = useRef<gsap.core.Timeline | null>(null);
  const onMotion = (name: AvatarMotion, hasClip: boolean) => {
    clips.current[name] = hasClip;
    if (name === 'celebrate' && hasClip) cheer.current?.kill();
  };

  useEffect(() => {
    const body = bodyRef.current;
    const face = faceRef.current;
    if (!celebrating || !body || !face || clips.current.celebrate) return;
    cheer.current = gsap
      .timeline({ repeat: -1, repeatDelay: 0.25 })
      .to(body.position, { y: BASE_HEIGHT + CHEER.height, duration: CHEER.up, ease: 'power2.out' })
      .to(face.rotation, { y: `+=${CHEER.spin}`, duration: CHEER.up + CHEER.down, ease: 'power1.inOut' }, '<')
      .to(body.position, { y: BASE_HEIGHT, duration: CHEER.down, ease: 'power2.in' });
    return () => {
      cheer.current?.kill();
      cheer.current = null;
      body.position.y = BASE_HEIGHT;
    };
  }, [celebrating]);

  // Já falido ao montar (entrou ou reconectou depois): não aparece. Falindo agora: sai com transição.
  const leftAtMount = useRef(leaving);
  useLayoutEffect(() => {
    if (leftAtMount.current && rootRef.current) rootRef.current.visible = false;
  }, []);
  // Efeito comum (não de layout): roda depois do modelo avisar se tem o clip defeat.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !leaving || leftAtMount.current) return;
    snap();
    const exit = gsap
      .timeline({ delay: clips.current.defeat ? EXIT.clipPause : EXIT.pause, onComplete: () => void (root.visible = false) })
      .to(root.scale, { x: 0.01, y: 0.01, z: 0.01, duration: EXIT.duration, ease: 'back.in(1.6)' })
      .to(root.position, { y: root.position.y - EXIT.sink, duration: EXIT.duration, ease: 'power2.in' }, '<');
    return () => {
      exit.kill();
    };
  }, [leaving]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parado, vira devagar para a câmera (só no eixo vertical). Durante os saltos, o giro é do timeline.
  useFrame(({ camera }, delta) => {
    if (figureRef.current && !leaving) {
      const target = timeline.current || queue.current.length ? 1 : desiredFigureScale.current;
      const next = figureRef.current.scale.x + (target - figureRef.current.scale.x) * Math.min(1, delta * 12);
      figureRef.current.scale.setScalar(next);
    }
    if (markerAnchorRef.current && figureRef.current) {
      markerAnchorRef.current.position.y = characterFor(avatarId).height * (figureRef.current.scale.x - 1);
    }
    const root = rootRef.current;
    const face = faceRef.current;
    if (!root || !face || timeline.current || cheer.current) return;
    const target = Math.atan2(camera.position.x - root.position.x, camera.position.z - root.position.z);
    face.rotation.y += (nearest(face.rotation.y, target) - face.rotation.y) * Math.min(1, delta * TURN_SPEED);
  });

  return (
    <group name={`PAWN_${playerId}`} ref={rootRef} scale={PAWN_SCALE}>
      <PlayerBase color={color} active={active} emphasized />
      <mesh ref={ringRef} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ringMaterial}>
        <ringGeometry args={[0.22, 0.27, 32]} />
      </mesh>
      <group ref={bodyRef} position={[0, BASE_HEIGHT, 0]}>
        <group ref={faceRef}>
          <group name="PAWN_FIGURE_SCALE" ref={figureRef} scale={initialFigureScale.current}>
            <Suspense fallback={null}>
              <AvatarFigure avatarId={avatarId} color={color} motion={motion} onMotion={onMotion} renderOrder={PAWN_RENDER_ORDER} />
            </Suspense>
          </group>
          {active && <group name="PAWN_ACTIVE_ANCHOR" ref={markerAnchorRef}>
            <ActiveMarker color={color} height={characterFor(avatarId).height + .11} amplitude={.02} renderOrder={PAWN_RENDER_ORDER} />
          </group>}
        </group>
      </group>
    </group>
  );
}
