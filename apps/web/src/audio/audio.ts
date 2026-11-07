// Toca os efeitos sonoros pela Web Audio API. O navegador só libera o áudio depois de um gesto
// (clique, toque ou tecla): até lá, e com a aba escondida, os pedidos de som são descartados em vez de
// virar uma rajada atrasada.
import { useAudioStore } from './audioStore';
import { SOUNDS, type SoundId, type TrimResult, analyzeTrack } from './sounds';

interface Loaded extends TrimResult {
  buffer: AudioBuffer;
}

let context: AudioContext | null = null;
let master: GainNode | null = null;
const loaded = new Map<SoundId, Loaded>();
let loading: Promise<void> | null = null;

function masterLevel() {
  const { volume, muted } = useAudioStore.getState();
  return muted ? 0 : volume;
}

function ensureContext(): AudioContext | null {
  if (context) return context;
  const Ctor = typeof window !== 'undefined' ? window.AudioContext : undefined;
  if (!Ctor) return null;
  context = new Ctor();
  master = context.createGain();
  master.gain.value = masterLevel();
  master.connect(context.destination);
  useAudioStore.subscribe(() => {
    if (master && context) master.gain.setTargetAtTime(masterLevel(), context.currentTime, 0.02);
  });
  return context;
}

function loadAll(ctx: AudioContext): Promise<void> {
  loading ??= Promise.all(
    (Object.keys(SOUNDS) as SoundId[]).map(async (id) => {
      const file = SOUNDS[id].file;
      if (!file) return;
      try {
        const buffer = await ctx.decodeAudioData(await (await fetch(file)).arrayBuffer());
        loaded.set(id, { buffer, ...analyzeTrack(buffer.getChannelData(0), buffer.sampleRate) });
      } catch {
        // Faixa ausente ou inválida: aquele som fica mudo, o resto continua.
      }
    }),
  ).then(() => undefined);
  return loading;
}

/** Quem precisa saber que o áudio foi liberado (a música do menu começa no primeiro gesto). */
const unlockListeners = new Set<(ctx: AudioContext) => void>();
export function onAudioUnlocked(listener: (ctx: AudioContext) => void): () => void {
  unlockListeners.add(listener);
  if (context?.state === 'running') listener(context);
  return () => unlockListeners.delete(listener);
}

/** Libera o áudio no primeiro gesto do jogador (menus incluídos) e já carrega as faixas. */
function installAudioUnlock(): void {
  const unlock = () => {
    const ctx = ensureContext();
    if (!ctx) return;
    void ctx.resume().then(() => unlockListeners.forEach((listener) => listener(ctx)));
    void loadAll(ctx);
  };
  const events = ['pointerdown', 'keydown', 'touchend'] as const;
  events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));
}
if (typeof window !== 'undefined') installAudioUnlock();

export interface PlayOptions {
  /** Atraso em segundos a partir de agora. */
  delay?: number;
  /** Velocidade/tom (1 = original): o salto alterna tons a partir de uma faixa só. */
  rate?: number;
  /** Ganho extra só desta vez. */
  gain?: number;
}

/** Último início de cada som: o mesmo som pedido duas vezes quase juntas toca uma vez só. */
const lastStart = new Map<SoundId, number>();

export function playSound(id: SoundId, options: PlayOptions = {}): void {
  if (typeof document !== 'undefined' && document.hidden) return;
  if (!context || !master || context.state !== 'running' || masterLevel() === 0) return;
  const track = loaded.get(id);
  if (!track) return;
  const source = context.createBufferSource();
  source.buffer = track.buffer;
  source.playbackRate.value = options.rate ?? 1;
  const gain = context.createGain();
  gain.gain.value = track.gain * SOUNDS[id].mix * (options.gain ?? 1);
  source.connect(gain).connect(master);
  const when = context.currentTime + Math.max(0, options.delay ?? 0);
  if (Math.abs(when - (lastStart.get(id) ?? -1)) < 0.06) return;
  lastStart.set(id, when);
  source.start(when, track.start, track.end - track.start);
  source.onended = () => gain.disconnect();
}
