// Som da partida no topo da tela: o ícone abre um painel com o volume (0–100%) e o botão de mudo.
// Ao soltar o controle, um toque curto mostra como ficou.
import { useEffect, useRef, useState } from 'react';
import { playSound } from '../audio/audio';
import { useAudioStore } from '../audio/audioStore';

const icon = (volume: number, muted: boolean) => (muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊');

export function SoundControl() {
  const volume = useAudioStore((s) => s.volume);
  const muted = useAudioStore((s) => s.muted);
  const setVolume = useAudioStore((s) => s.setVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Fecha ao tocar fora ou com Esc.
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  const percent = Math.round(volume * 100);
  const silent = muted || volume === 0;
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="hud-panel rounded-full px-3 py-1 text-sm text-white hover:brightness-125"
        aria-label="Som"
        aria-expanded={open}
        title="Som"
        onClick={() => setOpen((v) => !v)}
      >
        {icon(volume, muted)}
      </button>
      {open && (
        <div className="hud-panel absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl p-3 text-sm text-white shadow-2xl">
          <label className="mb-1 flex items-center justify-between font-bold" htmlFor="sound-volume">
            Volume <span className="font-mono tabular-nums text-amber-200">{silent ? 'mudo' : `${percent}%`}</span>
          </label>
          <input
            id="sound-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={silent ? 0 : percent}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            onPointerUp={() => playSound('confirmarAcao')}
            onKeyUp={() => playSound('confirmarAcao')}
            className="w-full accent-amber-400"
            aria-valuetext={silent ? 'mudo' : `${percent}%`}
          />
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-white/10 px-3 py-1.5 font-bold hover:bg-white/20"
            onClick={() => {
              // Tirar do mudo com o volume em zero volta a um nível audível.
              if (silent && volume === 0) setVolume(0.5);
              else toggleMute();
            }}
          >
            {silent ? '🔊 Ligar o som' : '🔇 Silenciar'}
          </button>
        </div>
      )}
    </div>
  );
}
