// Dados 3D da partida: rolam a cada lance recebido ao vivo e param exatamente no resultado do
// servidor. Reconexão, aba em segundo plano e movimento reduzido mostram o resultado já parado.
// Um lance que chega com personagens ainda andando espera a mesa parar; o peão de quem rolou espera
// estes dados pararem (diceStore.shownRollId).
// Pose e envelope vêm do manifesto ativo (layout.dice / layout.diceRoll), sem copiar números.
import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import layout from './board34/layout.json';
import { DiceVisual } from '../dice/DiceVisual';
import type { DiceFace } from '../dice/diceOrientation';
import { LAND_SECONDS, LIFT_SECONDS, ROLL_SECONDS, SPIN_SECONDS, rollAnimates, rollPlan } from '../dice/rollPlan';
import { playSound } from '../audio/audio';
import { useDiceStore } from '../store/diceStore';
import { useGameStore } from '../store/gameStore';
import { usePawnStore } from '../store/pawnStore';

/** Algum personagem anda na mesa (quem só espera os próprios dados não conta). */
const tableBusy = () => {
  const { moving, waiting } = usePawnStore.getState();
  return Object.keys(moving).some((id) => !waiting[id]);
};

type Faces = [DiceFace, DiceFace];
const TURN = Math.PI * 2;

const asFaces = (dice: readonly number[] | null | undefined): Faces | null =>
  dice && dice.length === 2 && dice.every((v) => Number.isInteger(v) && v >= 1 && v <= 6) ? [dice[0] as DiceFace, dice[1] as DiceFace] : null;

const randomFace = () => (1 + Math.floor(Math.random() * 6)) as DiceFace;

export function RollingDice() {
  const lastDice = useGameStore((s) => s.snapshot?.lastDice ?? null);
  const [faces, setFaces] = useState<Faces | null>(() => asFaces(lastDice));
  const bodies = useRef<(Group | null)[]>([]);
  const spins = useRef<(Group | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handled = useRef<number>(useGameStore.getState().roll?.id ?? -1);
  /** Lance recebido esperando a mesa parar. */
  const pending = useRef<{ official: Faces; id: number } | null>(null);

  /** Direto no repouso oficial, sem giro extra. */
  const snap = (official: Faces | null, rollId = handled.current) => {
    pending.current = null;
    timeline.current?.kill();
    timeline.current = null;
    if (deadline.current !== null) clearTimeout(deadline.current);
    deadline.current = null;
    layout.dice.forEach((pose, i) => {
      bodies.current[i]?.position.set(pose.position[0], pose.position[1], pose.position[2]);
      spins.current[i]?.rotation.set(0, 0, 0);
    });
    setFaces(official);
    useDiceStore.getState().setRolling(false);
    useDiceStore.getState().setShown(rollId);
  };

  const play = (official: Faces, rollId: number) => {
    pending.current = null;
    timeline.current?.kill();
    const tl = gsap.timeline({ onComplete: () => snap(official, rollId) });
    useDiceStore.getState().setRolling(true);
    // Primeiro lance da partida: os dados ainda não estavam na mesa; entram com faces quaisquer.
    setFaces((f) => f ?? [randomFace(), randomFace()]);
    layout.dice.forEach((pose, i) => {
      const body = bodies.current[i];
      const spin = spins.current[i];
      if (!body || !spin) return;
      const plan = rollPlan(i, pose, layout.diceRoll);
      body.position.set(...plan.rest);
      spin.rotation.set(0, 0, 0);
      const [first, ...rest] = plan.air;
      tl.to(body.position, { x: first[0], y: first[1], z: first[2], duration: LIFT_SECONDS, ease: 'power2.out' }, 0);
      const step = SPIN_SECONDS / rest.length;
      rest.forEach((p, k) => tl.to(body.position, { x: p[0], y: p[1], z: p[2], duration: step, ease: 'sine.inOut' }, LIFT_SECONDS + k * step));
      // Voltas completas: ao terminar, a rotação extra é zero e vale a face oficial do DiceVisual.
      tl.to(spin.rotation, { x: plan.turns[0] * TURN, y: plan.turns[1] * TURN, z: plan.turns[2] * TURN, duration: SPIN_SECONDS, ease: 'power2.out' }, LIFT_SECONDS);
      // Pouso vertical depois dos giros (exigência do envelope).
      tl.to(body.position, { x: plan.rest[0], y: plan.rest[1], z: plan.rest[2], duration: LAND_SECONDS, ease: 'power2.in' }, LIFT_SECONDS + SPIN_SECONDS);
    });
    // Troca para a face oficial já girando, para não revelar o resultado antes do lance.
    tl.call(() => setFaces(official), [], LIFT_SECONDS + SPIN_SECONDS * 0.2);
    timeline.current = tl;
    // O impacto da faixa (logo após a folga de 0,02 s do recorte) coincide com o toque na mesa, no fim do pouso.
    playSound('dado', { delay: ROLL_SECONDS - 0.02 });
    // Sem quadros de animação (janela encoberta, painel oculto) o gsap não avança: o relógio garante
    // que os dados param no resultado e a barra volta a mostrá-lo.
    deadline.current = setTimeout(() => snap(official, rollId), ROLL_SECONDS * 1000 + 250);
  };

  // Snapshot novo sem lance ao vivo (entrada, reconexão): mostra o resultado oficial parado.
  // Um lance ao vivo esperando a mesa parar (pending) já traz o mesmo valor no snapshot: as faces só
  // mudam quando ele rolar, senão os dados trocariam de valor ainda na jogada anterior.
  useEffect(() => {
    if (!timeline.current && !pending.current) setFaces(asFaces(lastDice));
  }, [lastDice]);

  useLayoutEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (state.resync !== previous.resync) {
          handled.current = state.roll?.id ?? handled.current;
          snap(asFaces(state.snapshot?.lastDice));
          return;
        }
        const roll = state.roll;
        if (!roll || roll.id <= handled.current) return;
        handled.current = roll.id;
        const official = asFaces(roll.dice);
        if (!official) return;
        if (!rollAnimates()) return snap(official, roll.id);
        // A barra já esconde o valor e o botão de rolar enquanto o lance espera a vez de aparecer.
        useDiceStore.getState().setRolling(true);
        if (tableBusy()) pending.current = { official, id: roll.id };
        else play(official, roll.id);
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Mesa parou: o lance que esperava rola agora.
  useEffect(() => {
    useDiceStore.getState().setShown(handled.current);
    return usePawnStore.subscribe(() => {
      const next = pending.current;
      if (!next || tableBusy()) return;
      if (rollAnimates()) play(next.official, next.id);
      else snap(next.official, next.id);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aba escondida no meio do lance: termina parado no resultado, sem replay atrasado ao voltar.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && (timeline.current || pending.current)) snap(asFaces(useGameStore.getState().snapshot?.lastDice) ?? faces);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      timeline.current?.kill();
      if (deadline.current !== null) clearTimeout(deadline.current);
      useDiceStore.getState().setRolling(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group visible={faces !== null}>
      {layout.dice.map((pose, i) => (
        <group key={i} ref={(g) => { bodies.current[i] = g; }} position={pose.position as [number, number, number]}>
          <group rotation={[0, pose.yaw, 0]}>
            <group ref={(g) => { spins.current[i] = g; }}>
              <DiceVisual face={faces?.[i] ?? 1} size={pose.size} />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
