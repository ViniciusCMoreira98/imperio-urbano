// Catálogo de efeitos sonoros (faixas do ElevenLabs em public/audio). Um som sem arquivo fica mudo
// até a faixa chegar; trocar uma faixa é só mudar o caminho aqui.

export type SoundId =
  | 'dado'
  | 'saltoPeao'
  | 'abrirJanela'
  | 'confirmarAcao'
  | 'erroAcaoInvalida'
  | 'passarBotao'
  | 'comprar'
  | 'construir'
  | 'pagarAluguel'
  | 'receberDinheiro'
  | 'cartaEvento'
  | 'olimpiadas'
  | 'suaVez'
  | 'tempoAcabando'
  | 'falencia'
  | 'vitoria';

interface SoundDef {
  file: string | null;
  /** Mistura relativa depois da normalização (1 = nível comum dos efeitos). */
  mix: number;
}

export const SOUNDS: Record<SoundId, SoundDef> = {
  dado: { file: '/audio/dado.mp3', mix: 1 },
  saltoPeao: { file: '/audio/saltoPeao.mp3', mix: 0.6 },
  abrirJanela: { file: '/audio/abrirJanela.mp3', mix: 0.7 },
  confirmarAcao: { file: '/audio/confirmarAcao.mp3', mix: 0.8 },
  erroAcaoInvalida: { file: '/audio/erroAcaoInvalida.mp3', mix: 0.9 },
  passarBotao: { file: '/audio/passarBotao.mp3', mix: 0.35 },
  comprar: { file: '/audio/comprar.mp3', mix: 1 },
  construir: { file: '/audio/construir.mp3', mix: 1 },
  pagarAluguel: { file: '/audio/pagarAluguel.mp3', mix: 0.9 },
  receberDinheiro: { file: '/audio/receberDinheiro.mp3', mix: 0.9 },
  cartaEvento: { file: '/audio/cartaEvento.mp3', mix: 0.9 },
  olimpiadas: { file: '/audio/olimpiadas.mp3', mix: 1 },
  suaVez: { file: '/audio/suaVez.mp3', mix: 0.8 },
  tempoAcabando: { file: null, mix: 0.6 },
  falencia: { file: null, mix: 1 },
  vitoria: { file: '/audio/vitoria.mp3', mix: 1 },
};

/** Nível médio (RMS, dBFS) para o qual cada faixa é normalizada antes da mistura. */
export const TARGET_RMS_DB = -20;
/** Começo do som: primeira amostra a até 30 dB do pico (o ataque, não o chiado antes dele). */
export const ATTACK_DB = -30;
/** Fim do som: última amostra a até 40 dB do pico. */
export const TAIL_DB = -40;

export interface TrimResult {
  start: number;
  end: number;
  gain: number;
}

/**
 * Recorte do silêncio e ganho de normalização de uma faixa (amostras de um canal). Algumas faixas
 * chegam com segundos de silêncio no começo (dado) ou bem mais baixas que as outras (erro, salto).
 */
export function analyzeTrack(samples: Float32Array, sampleRate: number): TrimResult {
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  if (peak === 0) return { start: 0, end: samples.length / sampleRate, gain: 1 };
  const attack = peak * 10 ** (ATTACK_DB / 20);
  const tail = peak * 10 ** (TAIL_DB / 20);
  let first = 0;
  while (Math.abs(samples[first]) < attack) first++;
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]) < tail) last--;
  let energy = 0;
  for (let i = first; i <= last; i++) energy += samples[i] * samples[i];
  const rms = Math.sqrt(energy / (last - first + 1));
  const gain = Math.min(4, Math.max(0.25, 10 ** (TARGET_RMS_DB / 20) / rms));
  // Pequena folga para não cortar o ataque nem a cauda.
  return { start: Math.max(0, first / sampleRate - 0.02), end: Math.min(samples.length / sampleRate, last / sampleRate + 0.04), gain };
}
