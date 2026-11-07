// Volume dos efeitos, volume da música e mudo geral, lembrados neste navegador (só conveniência; falhar
// não quebra nada).
import { create } from 'zustand';

const KEY = 'imperio.audio';

export const DEFAULT_VOLUME = 0.8;
export const DEFAULT_MUSIC_VOLUME = 0.5;

interface AudioSettings {
  volume: number;
  musicVolume: number;
  muted: boolean;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function load(): AudioSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<AudioSettings> | null;
    return {
      volume: typeof saved?.volume === 'number' ? clamp(saved.volume) : DEFAULT_VOLUME,
      musicVolume: typeof saved?.musicVolume === 'number' ? clamp(saved.musicVolume) : DEFAULT_MUSIC_VOLUME,
      muted: saved?.muted === true,
    };
  } catch {
    return { volume: DEFAULT_VOLUME, musicVolume: DEFAULT_MUSIC_VOLUME, muted: false };
  }
}

function save(settings: AudioSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Navegação privada ou armazenamento bloqueado: vale só nesta sessão.
  }
}

interface AudioState extends AudioSettings {
  /** Volume dos efeitos; mexer num volume tira do mudo. */
  setVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  toggleMute: () => void;
  /** Volta os dois volumes ao padrão, com som. */
  reset: () => void;
}

export const useAudioStore = create<AudioState>()((set, get) => {
  const update = (patch: Partial<AudioSettings>) => {
    const { volume, musicVolume, muted } = { ...get(), ...patch };
    const next = { volume, musicVolume, muted };
    save(next);
    set(next);
  };
  return {
    ...load(),
    setVolume: (volume) => update({ volume: clamp(volume), muted: false }),
    setMusicVolume: (musicVolume) => update({ musicVolume: clamp(musicVolume), muted: false }),
    toggleMute: () => update({ muted: !get().muted }),
    reset: () => update({ volume: DEFAULT_VOLUME, musicVolume: DEFAULT_MUSIC_VOLUME, muted: false }),
  };
});
