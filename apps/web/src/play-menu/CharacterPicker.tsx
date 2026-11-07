// Escolha do personagem no menu (07/11/2026): avatar e cor do peão antes de entrar numa sala.
// Abre pelo botão "Seu personagem" do menu ou tocando no retrato do card do jogador.
import { useEffect, useRef, useState } from 'react';
import type { AvatarId, PawnColor } from '@imperio/shared-types';
import { AvatarPreview } from '../avatars/AvatarPreview';
import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { AvatarPortrait } from '../hud/AvatarPortrait';
import { playSound } from '../audio/audio';
import { ApiError } from '../net/api';
import { useAppStore } from '../store/appStore';
import { useCharacterStore } from '../store/characterStore';
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
          <div>
            <h2 id="cp-title">Escolha seu personagem</h2>
            <p>Você entra nas salas com ele. Também dá para trocar na sala de espera.</p>
          </div>
          <button type="button" className="cp-close" aria-label="Fechar" onClick={close}>
            ✕
          </button>
        </header>
        <div className="cp-body">
          <AvatarPreview className="cp-preview" avatarId={avatarId} color={PAWN_COLORS[color].hex} label={AVATARS[avatarId].name} />
          <div className="cp-choices">
            <h3>1. Personagem</h3>
            <div className="cp-avatars" role="radiogroup" aria-label="Personagem">
              {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
                <button key={id} type="button" role="radio" aria-checked={avatarId === id} onClick={() => setAvatarId(id)}>
                  <span className="cp-avatar-art">
                    <AvatarPortrait avatarId={id} />
                  </span>
                  <span className="cp-avatar-name">{AVATARS[id].name}</span>
                </button>
              ))}
            </div>
            <h3>2. Cor do peão</h3>
            <div className="cp-colors" role="radiogroup" aria-label="Cor do peão">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={PAWN_COLORS[c].name}
                  title={PAWN_COLORS[c].name}
                  style={{ background: PAWN_COLORS[c].hex }}
                  onClick={() => setColor(c)}
                />
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
