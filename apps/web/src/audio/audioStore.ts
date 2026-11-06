// Volume e mudo dos efeitos sonoros, lembrados neste navegador (só conveniência; falhar não quebra nada).
import { create } from 'zustand';

const KEY = 'imperio.audio';

interface AudioSettings {
  volume: number;
  muted: boolean;
}

function load(): AudioSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<AudioSettings> | null;
    const volume = typeof saved?.volume === 'number' ? Math.min(1, Math.max(0, saved.volume)) : 0.8;
    return { volume, muted: saved?.muted === true };
  } catch {
    return { volume: 0.8, muted: false };
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
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  ...load(),
  setVolume: (volume) => {
    const next = { volume: Math.min(1, Math.max(0, volume)), muted: false };
    save(next);
    set(next);
  },
  toggleMute: () => {
    const next = { volume: get().volume, muted: !get().muted };
    save(next);
    set(next);
  },
}));
