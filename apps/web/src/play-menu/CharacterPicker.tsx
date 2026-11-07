// Escolha do personagem no menu (07/11/2026): avatar e cor do peão antes de entrar numa sala.
// Abre pelo botão "Seu personagem" do menu ou tocando no retrato do card do jogador.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { AvatarId, PawnColor } from '@imperio/shared-types';
import { AvatarPreview } from '../avatars/AvatarPreview';
import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { AvatarPortrait } from '../hud/AvatarPortrait';
import { playSound } from '../audio/audio';
import { ApiError } from '../net/api';
import { useAppStore } from '../store/appStore';
import { useCharacterStore } from '../store/characterStore';
import playersIcon from '../main-menu/art/players-v1.svg';
import './character-picker.css';

const COLORS = Object.keys(PAWN_COLORS) as PawnColor[];

export function CharacterPicker() {
  const session = useAppStore((s) => s.session);
  const { character, pickerOpen, save, closePicker } = useCharacterStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-1');
  const [color, setColor] = useState<PawnColor>(COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ao abrir, parte da escolha atual.
  useEffect(() => {
    if (!pickerOpen) return;
    setAvatarId(character?.avatarId ?? 'avatar-1');
    setColor(character?.pawnColor ?? COLORS[0]);
    setError(null);
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [pickerOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pickerOpen || !session) return null;

  const close = () => {
    dialog.current?.close();
    closePicker();
  };

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await save(session!.token, avatarId, color);
      playSound('confirmarAcao');
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível salvar. Tente de novo.');
      playSound('erroAcaoInvalida');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="cp-dialog"
      aria-labelledby="cp-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => e.target === dialog.current && close()}
    >
      <section className="cp-panel">
        <header className="cp-header">
          <img className="cp-header-icon" src={playersIcon} alt="" />
          <div>
            <h2 id="cp-title">Escolha seu personagem</h2>
            <p>Escolha quem vai representar você no tabuleiro.</p>
          </div>
          <button type="button" className="cp-close" aria-label="Fechar" onClick={close}>
            ✕
          </button>
        </header>
        <div className="cp-body">
          <section className="cp-showcase" style={{'--cp-pawn-color':PAWN_COLORS[color].hex} as CSSProperties} aria-label="Personagem selecionado">
            <span className="cp-showcase-label">SEU PERSONAGEM</span>
            <AvatarPreview className="cp-preview" avatarId={avatarId} color={PAWN_COLORS[color].hex} label={AVATARS[avatarId].name} />
            <div className="cp-showcase-caption"><strong>{AVATARS[avatarId].name}</strong><span><i aria-hidden="true"/>{PAWN_COLORS[color].name}</span></div>
          </section>
          <div className="cp-choices">
            <h3><span className="cp-step">1</span> Escolha o personagem</h3>
            <div className="cp-avatars" role="radiogroup" aria-label="Personagem">
              {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
                <button key={id} type="button" role="radio" aria-checked={avatarId === id} onClick={() => setAvatarId(id)}>
                  <span className="cp-avatar-art">
                    <AvatarPortrait avatarId={id} />
                  </span>
                  <span className="cp-avatar-name">{AVATARS[id].name}</span>
                  <span className="cp-selected-check" aria-hidden="true">✓</span>
                </button>
              ))}
            </div>
            <h3><span className="cp-step">2</span> Cor do peão</h3>
            <div className="cp-colors" role="radiogroup" aria-label="Cor do peão">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={PAWN_COLORS[c].name}
                  title={PAWN_COLORS[c].name}
                  style={{ '--cp-choice-color': PAWN_COLORS[c].hex } as CSSProperties}
                  onClick={() => setColor(c)}
                ><span className="cp-color-dot" aria-hidden="true">{color===c?'✓':''}</span><span>{PAWN_COLORS[c].name}</span></button>
              ))}
            </div>
            <p className="cp-note">Se outra pessoa da sala já estiver com essa cor, você fica com a próxima livre.</p>
          </div>
        </div>
        <footer className="cp-footer">
          {error && (
            <p className="cp-error" role="alert">
              {error}
            </p>
          )}
          <p className="cp-selection-summary"><span>Sua escolha</span><strong>{AVATARS[avatarId].name} <i aria-hidden="true">·</i> {PAWN_COLORS[color].name}</strong></p>
          <button type="button" className="cp-cancel" onClick={close}>
            Cancelar
          </button>
          <button type="button" className="cp-save" disabled={busy} onClick={() => void confirm()}>
            {busy ? 'Salvando…' : `Jogar com ${AVATARS[avatarId].name}`}
          </button>
        </footer>
      </section>
    </dialog>
  );
}
