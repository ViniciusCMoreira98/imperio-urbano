// Configurações com a arte do kit do Codex (settings-art). Só aparece o que o jogo já tem (decisão do
// usuário, 06/11/2026): Som (volume e mudo dos efeitos) e, fora da partida, Conta (apelido). Música,
// FPS, idioma, conta vinculada etc. entram quando existirem.
// O som vale na hora e fica lembrado neste navegador (audioStore); não há "Salvar".
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import '../settings-art/settings-assets.css';
import './settingsHost.css';
import skylineArt from '../settings-art/art/skyline-v1.svg';
import gearIcon from '../main-menu/art/gear-v1.svg';
import musicIcon from '../settings-art/art/music-v1.svg';
import profileIcon from '../settings-art/art/profile-v1.svg';
import speakerIcon from '../settings-art/art/speaker-v1.svg';
import checkIcon from '../settings-art/art/check-v1.svg';
import resetIcon from '../settings-art/art/reset-v1.svg';
import logoutIcon from '../settings-art/art/logout-v1.svg';
import { playSound } from '../audio/audio';
import { useAudioStore } from '../audio/audioStore';
import { useAppStore } from '../store/appStore';

/** Volume inicial dos efeitos (o mesmo do audioStore sem nada salvo). */
const DEFAULT_VOLUME = 0.8;

type Tab = 'sound' | 'account';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'sound', label: 'Som', icon: musicIcon },
  { id: 'account', label: 'Conta', icon: profileIcon },
];

export function SettingsDialog({ open, onClose, inGame }: { open: boolean; onClose: () => void; inGame: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>('sound');
  // Na partida não se troca de apelido: a aba Conta só existe no menu.
  const tabs = inGame ? TABS.filter((t) => t.id !== 'account') : TABS;
  const current = tabs.some((t) => t.id === tab) ? tab : 'sound';

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      el.querySelector<HTMLElement>('[role=tab][aria-selected=true]')?.focus();
    } else if (!open && el.open) el.close();
  }, [open]);

  const select = (id: Tab) => {
    setTab(id);
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(`[data-tab=${id}]`)?.focus());
  };
  const onTabKey = (event: KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === current);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length].id);
  };

  return (
    <dialog
      ref={dialog}
      className="st-dialog"
      aria-labelledby="settings-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === dialog.current && onClose()}
    >
      {open && (
        <section className="st-panel">
          <img className="st-skyline" src={skylineArt} alt="" />
          <div className="st-heading">
            <img src={gearIcon} alt="" />
            <h1 id="settings-title">CONFIGURAÇÕES</h1>
          </div>
          <button type="button" className="st-close" aria-label="Fechar configurações" onClick={onClose} />
          <nav className="st-tabs" role="tablist" aria-label="Categorias das configurações" onKeyDown={onTabKey}>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className="st-tab"
                id={`settings-tab-${t.id}`}
                role="tab"
                data-tab={t.id}
                aria-selected={current === t.id}
                aria-controls="settings-content"
                tabIndex={current === t.id ? 0 : -1}
                onClick={() => select(t.id)}
              >
                <img src={t.icon} alt="" />
                {t.label}
              </button>
            ))}
          </nav>
          <div className="st-body" id="settings-content" role="tabpanel" aria-labelledby={`settings-tab-${current}`}>
            {current === 'sound' ? <SoundTab /> : <AccountTab onClose={onClose} />}
          </div>
          <footer className="st-footer">
            {current === 'sound' && (
              <button type="button" className="st-button" onClick={() => useAudioStore.getState().setVolume(DEFAULT_VOLUME)}>
                <img src={resetIcon} alt="" />
                Restaurar padrão
              </button>
            )}
            <button type="button" className="st-button st-primary" onClick={onClose}>
              <img src={checkIcon} alt="" />
              Concluir
            </button>
          </footer>
        </section>
      )}
    </dialog>
  );
}

function SoundTab() {
  const volume = useAudioStore((s) => s.volume);
  const muted = useAudioStore((s) => s.muted);
  const setVolume = useAudioStore((s) => s.setVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const percent = Math.round(volume * 100);
  const shown = muted ? 0 : percent;
  // Ao soltar o controle, um toque curto mostra como ficou.
  const preview = () => playSound('confirmarAcao');
  return (
    <>
      <section className="st-card">
        <h2>
          <img src={speakerIcon} alt="" />
          VOLUME
        </h2>
        <div className="st-fields">
          <label className="st-row st-volume">
            <span>Efeitos sonoros</span>
            <input
              className="st-range"
              type="range"
              min={0}
              max={100}
              step={5}
              value={shown}
              style={{ '--fill': `${shown}%` } as CSSProperties}
              aria-label="Efeitos sonoros"
              aria-valuetext={muted ? 'mudo' : `${percent}%`}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              onPointerUp={preview}
              onKeyUp={preview}
            />
            <output>{muted ? 'mudo' : `${percent}%`}</output>
          </label>
        </div>
      </section>
      <section className="st-card">
        <h2>
          <img src={musicIcon} alt="" />
          PREFERÊNCIAS
        </h2>
        <div className="st-fields">
          <label className="st-row">
            <span>Silenciar tudo</span>
            <input
              className="st-toggle"
              type="checkbox"
              checked={muted}
              onChange={() => {
                // Tirar do mudo com o volume em zero volta a um nível audível.
                if (muted && volume === 0) setVolume(0.5);
                else toggleMute();
              }}
            />
          </label>
        </div>
      </section>
    </>
  );
}

function AccountTab({ onClose }: { onClose: () => void }) {
  const session = useAppStore((s) => s.session);
  const setSession = useAppStore((s) => s.setSession);
  return (
    <section className="st-card st-account-card">
      <h2>
        <img src={profileIcon} alt="" />
        PERFIL
      </h2>
      <div className="st-fields">
        <div className="st-row">
          <span>Apelido</span>
          <strong className="st-account-name">{session?.nickname ?? '—'}</strong>
        </div>
        <div className="st-row">
          <span>Tipo de conta</span>
          <span>Convidado neste navegador</span>
        </div>
        <div className="st-row">
          {/* Volta à tela do apelido; as partidas em andamento continuam com o convidado anterior. */}
          <button
            type="button"
            className="st-button st-account-action"
            onClick={() => {
              onClose();
              setSession(null);
            }}
          >
            <img src={logoutIcon} alt="" />
            Trocar apelido
          </button>
        </div>
      </div>
    </section>
  );
}
