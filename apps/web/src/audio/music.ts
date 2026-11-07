// Música do menu inicial (faixa do Suno; origem e licença em assets/audio/LICENCAS.md): uma faixa em loop, com volume próprio (musicVolume) e o mesmo mudo dos efeitos.
// Toca pelo mesmo AudioContext dos efeitos, então só começa depois do primeiro gesto do jogador
// (regra dos navegadores). Some com um fade ao sair do menu e pausa com a aba escondida; ao voltar ao
// menu, continua de onde parou.
import { onAudioUnlocked } from './audio';
import { useAudioStore } from './audioStore';

const MENU_TRACK = '/audio/menuInicial.mp3';
/** Mistura da música sob os efeitos (1 = volume da faixa). */
const MUSIC_MIX = 0.6;
const FADE_SECONDS = 0.6;

let element: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let ctx: AudioContext | null = null;
let wanted = false;
let pauseTimer: ReturnType<typeof setTimeout> | null = null;

function level(): number {
  const { musicVolume, muted } = useAudioStore.getState();
  return muted ? 0 : musicVolume * MUSIC_MIX;
}

function fadeTo(value: number, seconds: number) {
  if (!gain || !ctx) return;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(value, ctx.currentTime + seconds);
}

/** Liga a faixa ao contexto de áudio (uma vez) e segue o volume das Configurações. */
function connect(audioContext: AudioContext) {
  if (element) return;
  ctx = audioContext;
  element = new Audio(MENU_TRACK);
  element.loop = true;
  element.preload = 'auto';
  gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(element).connect(gain).connect(ctx.destination);
  useAudioStore.subscribe(() => {
    if (wanted && !document.hidden) fadeTo(level(), 0.05);
  });
}

function start() {
  if (!element || !wanted || document.hidden) return;
  if (pauseTimer !== null) {
    clearTimeout(pauseTimer);
    pauseTimer = null;
  }
  void element.play().then(
    () => fadeTo(level(), FADE_SECONDS),
    () => {
      // Navegador ainda bloqueando: tenta de novo no próximo gesto.
    },
  );
}

function stop(seconds: number) {
  if (!element) return;
  fadeTo(0, seconds);
  if (pauseTimer !== null) clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => {
    pauseTimer = null;
    if (!wanted || document.hidden) element?.pause();
  }, seconds * 1000);
}

if (typeof window !== 'undefined') {
  onAudioUnlocked((audioContext) => {
    connect(audioContext);
    if (wanted && element?.paused) start();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(0);
    else start();
  });
}

/** O menu inicial liga ao aparecer e desliga ao sair. */
export function setMenuMusic(on: boolean) {
  wanted = on;
  if (on) start();
  else stop(FADE_SECONDS);
}

/** Estado atual da música (verificação e depuração). */
export function menuMusicState() {
  return { wanted, playing: !!element && !element.paused, time: element?.currentTime ?? 0, gain: gain?.gain.value ?? 0 };
}
