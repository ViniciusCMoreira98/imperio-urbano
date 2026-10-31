// Centro do tabuleiro (seção 5): painel da partida e pilha 3D do baralho de eventos (E24).
// As Olimpíadas ficam destacadas no próprio estado-sede (OlympicHost), a pedido do usuário.
// Desenhados em canvas como textura, deitados no tabuleiro (sem elementos HTML dentro da cena 3D).
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { GameSnapshot } from '@imperio/shared-types';
import { PAWN_COLORS } from '../game/presentation';
import { useGameStore } from '../store/gameStore';
import { centerSlots } from './BoardCenter';

const PX_PER_UNIT = 256;
/** Logo acima do centro ilustrado. */
const PANEL_Y = 0.012;

type Line = { text: string; color?: string; size?: number; weight?: number };

/** Painel com fundo, borda e linhas centralizadas; o topo do canvas fica para o fundo do tabuleiro. */
function drawPanel(width: number, depth: number, background: [string, string], border: string, lines: Line[]): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * PX_PER_UNIT);
  canvas.height = Math.round(depth * PX_PER_UNIT);
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, background[0]);
  gradient.addColorStop(1, background[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, w - 10, h - 10);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Tamanhos das linhas são relativos a um painel de 230 px de altura; cresce junto com o painel,
  // limitado para o texto caber na altura.
  const baseHeight = lines.reduce((sum, line) => sum + (line.size ?? 34) * 1.25, 0);
  const scale = Math.min(h / 230, (h * 0.86) / baseHeight);
  const totalHeight = baseHeight * scale;
  let y = (h - totalHeight) / 2;
  for (const line of lines) {
    const size = (line.size ?? 34) * scale;
    ctx.font = `${line.weight ?? 600} ${size}px system-ui, sans-serif`;
    ctx.fillStyle = line.color ?? '#ffffff';
    ctx.fillText(line.text, w / 2, y + (size * 1.25) / 2, w - 30);
    y += size * 1.25;
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function gameLines(snapshot: GameSnapshot): Line[] {
  const current = snapshot.players.find((p) => p.id === snapshot.currentPlayerId);
  const mode = snapshot.mode === 'QUICK' ? `de 15 · Rápido` : '· Clássico';
  const second: Line =
    snapshot.status === 'FINISHED'
      ? { text: 'Partida encerrada', color: '#fcd34d', size: 34, weight: 800 }
      : { text: `Vez de ${current?.nickname ?? '—'}`, color: current ? PAWN_COLORS[current.pawnColor].hex : '#ffffff', size: 36, weight: 900 };
  return [{ text: `Rodada ${snapshot.round} ${mode}`, size: 34, weight: 700 }, second];
}

function Panel({ x, z, w, d, texture }: { x: number; z: number; w: number; d: number; texture: CanvasTexture }) {
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[x, PANEL_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

/** Cartas levemente desalinhadas, como um baralho de verdade; a de cima mostra a arte do verso. */
const PILE = [
  { turn: 0.06, dx: 0.02, dz: -0.01 },
  { turn: -0.05, dx: -0.03, dz: 0.02 },
  { turn: 0.03, dx: 0.01, dz: 0.03 },
  { turn: -0.08, dx: 0.03, dz: -0.02 },
  { turn: 0.02, dx: -0.01, dz: 0.0 },
  { turn: -0.03, dx: 0, dz: 0.01 },
];
const CARD_THICKNESS = 0.03;

function CardPile({ x, z, w, d, texture }: { x: number; z: number; w: number; d: number; texture: CanvasTexture }) {
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={[x, PANEL_Y, z]}>
      {PILE.map(({ turn, dx, dz }, i) => {
        const top = i === PILE.length - 1;
        return (
          <mesh key={i} position={[dx, CARD_THICKNESS * (i + 0.5), dz]} rotation={[0, turn, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, CARD_THICKNESS, d]} />
            {/* Ordem das faces do BoxGeometry: +x, -x, +y (topo), -y, +z, -z. */}
            {[0, 1, 2, 3, 4, 5].map((face) => (
              <meshStandardMaterial
                key={face}
                attach={`material-${face}`}
                color={face === 2 && top ? '#ffffff' : face === 2 || face === 3 ? '#5b21b6' : '#f5f3ff'}
                map={face === 2 && top ? texture : null}
              />
            ))}
          </mesh>
        );
      })}
    </group>
  );
}

export function CenterInfo({ size }: { size: number }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const slots = useMemo(() => Object.fromEntries(centerSlots(size).map((s) => [s.label, s])), [size]);
  const { Eventos: deck, Partida: gameSlot } = slots;

  const card = useMemo(() => ({ x: deck.x, z: deck.z, w: deck.w * 0.9, d: deck.d * 0.9 }), [deck]);
  const deckTexture = useMemo(
    () => drawPanel(card.w, card.d, ['#7c3aed', '#4c1d95'], '#c4b5fd', [{ text: '❓', size: 70 }, { text: 'EVENTOS', size: 40, weight: 900 }]),
    [card],
  );
  const gameKey = snapshot ? JSON.stringify([snapshot.round, snapshot.mode, snapshot.status, snapshot.currentPlayerId]) : '';
  const gameTexture = useMemo(
    () => (snapshot ? drawPanel(gameSlot.w, gameSlot.d, ['#1e293b', '#0f172a'], '#7dd3fc', gameLines(snapshot)) : null),
    [gameKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <CardPile {...card} texture={deckTexture} />
      {gameTexture && <Panel {...gameSlot} texture={gameTexture} />}
    </>
  );
}
