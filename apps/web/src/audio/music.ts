// Músicas em loop (faixas do Suno; origem e licença em assets/audio/LICENCAS.md): uma para o menu
// (menu inicial, Jogar Online e sala de espera) e outra para o tabuleiro. Volume próprio (musicVolume)
// e o mesmo mudo dos efeitos.
// Tocam pelo mesmo AudioContext dos efeitos, então só começam depois do primeiro gesto do jogador
// (regra dos navegadores). Trocar de faixa faz um cruzamento suave; a faixa que sai pausa e, ao voltar,
// continua de onde parou. Com a aba escondida, tudo pausa.
import { onAudioUnlocked } from './audio';
import { useAudioStore } from './audioStore';

export type MusicTrack = 'menu' | 'board';

const FILES: Record<MusicTrack, string> = {
  menu: '/audio/menuInicial.mp3',
  board: '/audio/musicaTabuleiro.mp3',
};
/** Mistura da música sob os efeitos (1 = volume da faixa). O tabuleiro fica mais baixo, por baixo das jogadas. */
const MIX: Record<MusicTrack, number> = { menu: 0.6, board: 0.45 };
const FADE_SECONDS = 0.8;

interface Channel {
  element: HTMLAudioElement;
  gain: GainNode;
  pauseTimer: ReturnType<typeof setTimeout> | null;
}

let ctx: AudioContext | null = null;
const channels: Partial<Record<MusicTrack, Channel>> = {};
let wanted: MusicTrack | null = null;

function level(track: MusicTrack): number {
  const { musicVolume, muted } = useAudioStore.getState();
  return muted ? 0 : musicVolume * MIX[track];
}

function fadeTo(channel: Channel, value: number, seconds: number) {
  if (!ctx) return;
  const g = channel.gain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(value, ctx.currentTime + seconds);
}

/** Cria a faixa no contexto de áudio na primeira vez que ela é pedida. */
function channel(track: MusicTrack): Channel | null {
  if (!ctx) return null;
  const existing = channels[track];
  if (existing) return existing;
  const element = new Audio(FILES[track]);
  element.loop = true;
  element.preload = 'auto';
  const gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(element).connect(gain).connect(ctx.destination);
  const created: Channel = { element, gain, pauseTimer: null };
  channels[track] = created;
  return created;
}

function start(track: MusicTrack) {
  if (document.hidden) return;
  const ch = channel(track);
  if (!ch) return;
  if (ch.pauseTimer !== null) {
    clearTimeout(ch.pauseTimer);
    ch.pauseTimer = null;
  }
  void ch.element.play().then(
    () => {
      if (wanted === track) fadeTo(ch, level(track), FADE_SECONDS);
    },
    () => {
      // Navegador ainda bloqueando: tenta de novo no próximo gesto.
    },
  );
}

function stop(track: MusicTrack, seconds: number) {
  const ch = channels[track];
  if (!ch) return;
  fadeTo(ch, 0, seconds);
  if (ch.pauseTimer !== null) clearTimeout(ch.pauseTimer);
  ch.pauseTimer = setTimeout(() => {
    ch.pauseTimer = null;
    if (wanted !== track || document.hidden) ch.element.pause();
  }, seconds * 1000);
}

if (typeof window !== 'undefined') {
  onAudioUnlocked((audioContext) => {
    if (ctx) return;
    ctx = audioContext;
    useAudioStore.subscribe(() => {
      const ch = wanted && channels[wanted];
      if (wanted && ch && !document.hidden) fadeTo(ch, level(wanted), 0.05);
    });
    if (wanted) start(wanted);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) (Object.keys(channels) as MusicTrack[]).forEach((t) => stop(t, 0));
    else if (wanted) start(wanted);
  });
}

/** Escolhe a música da tela atual (null = silêncio). Pedir a mesma faixa de novo não reinicia nada. */
export function setMusic(track: MusicTrack | null) {
  if (track === wanted) return;
  const previous = wanted;
  wanted = track;
  if (previous) stop(previous, FADE_SECONDS);
  if (track) start(track);
}

/** Estado atual da música (verificação e depuração). */
export function musicState() {
  const tracks = Object.fromEntries(
    (Object.keys(channels) as MusicTrack[]).map((t) => {
      const ch = channels[t]!;
      return [t, { playing: !ch.element.paused, time: ch.element.currentTime, gain: ch.gain.gain.value }];
    }),
  );
  return { wanted, tracks };
}
