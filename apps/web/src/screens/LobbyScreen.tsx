import { useEffect, useState } from 'react';
import type { AvatarId, LobbyView, PawnColor } from '@imperio/shared-types';
import { AvatarPreview } from '../avatars/AvatarPreview';
import { modeName } from '../game/modes';
import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { AvatarPortrait } from '../hud/AvatarPortrait';
import crown from '../main-menu/art/crown-v1.svg';
import playersIcon from '../main-menu/art/players-v1.svg';
import { api, ApiError } from '../net/api';
import back from '../play-menu/art/back-v1.svg';
import { useAppStore } from '../store/appStore';
import '../play-menu/play-menu.css';
import './lobby.css';

/** A sala ainda não tem canal em tempo real: consulta o servidor periodicamente. */
const POLL_MS = 1500;
const CAPACITY = 4;

/** Sala de espera na arte tropical do menu (proposta do Codex, 07/11/2026). Tudo vem do lobby real. */
export function LobbyScreen() {
  const session = useAppStore((s) => s.session);
  const gameId = useAppStore((s) => s.gameId)!;
  const lobby = useAppStore((s) => s.lobby);
  const updateLobby = useAppStore((s) => s.updateLobby);
  const openGame = useAppStore((s) => s.openGame);
  const leave = useAppStore((s) => s.leave);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) {
      leave();
      return;
    }
    let active = true;
    const refresh = async () => {
      try {
        const view = await api.lobby(session.token, gameId);
        if (!active) return;
        updateLobby(view);
        if (view.status !== 'LOBBY') openGame();
      } catch (e) {
        if (active && e instanceof ApiError && (e.status === 404 || e.status === 401)) leave();
      }
    };
    void refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session, gameId, updateLobby, openGame, leave]);

  if (!session || !lobby) {
    return (
      <main className="pm-screen lb-screen">
        <p className="lb-loading">Carregando sala…</p>
      </main>
    );
  }

  const me = lobby.players.find((p) => p.playerId === session.playerId);
  const isHost = lobby.hostPlayerId === session.playerId;
  const takenColors = new Set(lobby.players.filter((p) => p.playerId !== session.playerId).map((p) => p.pawnColor));

  async function act(action: () => Promise<LobbyView>) {
    setError(null);
    try {
      const view = await action();
      updateLobby(view);
      if (view.status !== 'LOBBY') openGame();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo deu errado.');
    }
  }

  const customize = (avatarId: AvatarId, pawnColor: PawnColor) =>
    act(() => api.customize(session.token, gameId, avatarId, pawnColor));

  const hint = isHost
    ? lobby.canStart
      ? 'Todos prontos: pode iniciar a partida.'
      : 'Precisa de 2 a 4 jogadores, todos prontos.'
    : 'O anfitrião inicia quando todos estiverem prontos.';

  return (
    <main className="pm-screen lb-screen">
      <section className="pm-shell lb-shell" aria-labelledby="lb-title">
        <header className="lb-header">
          <img className="lb-crown" src={crown} alt="" />
          <div className="lb-title">
            <h1 id="lb-title">Sala de espera</h1>
            <p>Reúna a turma. A partida já vai começar!</p>
          </div>
          <div className="lb-chips">
            <span className="lb-chip">
              <img src={crown} alt="" />
              {modeName(lobby.mode)}
            </span>
            <span className="lb-chip lb-chip-soft">{lobby.publicRoom ? '🌐 Pública' : '🔒 Privada'}</span>
            {lobby.stake > 0 && (
              <span className="lb-chip lb-chip-soft" title={`Prêmio de ${(lobby.stake * lobby.players.length).toLocaleString('pt-BR')} moedas ao vencedor`}>
                🪙 Aposta {lobby.stake.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <button className="pm-back lb-leave" type="button" onClick={leave}>
            <img src={back} alt="" />
            Sair da sala
          </button>
        </header>

        <div className="lb-code">
          <span className="lb-code-label">Código da sala</span>
          <strong className="lb-code-value">{lobby.inviteCode}</strong>
          <button
            type="button"
            className="lb-copy"
            onClick={() => {
              void navigator.clipboard?.writeText(lobby.inviteCode).then(() => setCopied(true));
            }}
          >
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
        </div>

        <div className="lb-body">
          <section className="lb-panel lb-players" aria-labelledby="lb-players-title">
            <h2 id="lb-players-title">
              <img src={playersIcon} alt="" />
              Jogadores · {lobby.players.length}/{CAPACITY}
            </h2>
            <ul>
              {lobby.players.map((p) => {
                const mine = p.playerId === session.playerId;
                const host = p.playerId === lobby.hostPlayerId;
                return (
                  <li key={p.playerId} className={`lb-seat${mine ? ' lb-mine' : ''}`}>
                    {host && <img className="lb-host" src={crown} alt="Anfitrião" title="Anfitrião" />}
                    <span className="lb-portrait" style={{ borderColor: PAWN_COLORS[p.pawnColor].hex }}>
                      <AvatarPortrait avatarId={p.avatarId} />
                    </span>
                    <strong className="lb-name">{p.nickname}</strong>
                    <span className="lb-you">{mine ? '(você)' : ' '}</span>
                    <span className={`lb-status ${p.ready ? 'lb-ready' : 'lb-waiting'}`}>
                      {p.ready ? '✔ Pronto' : '… Aguardando'}
                    </span>
                  </li>
                );
              })}
              {Array.from({ length: CAPACITY - lobby.players.length }, (_, i) => (
                <li key={`vaga-${i}`} className="lb-seat lb-free">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <circle cx="20" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path d="M6 40c1-9 7-14 14-14s13 5 14 14M38 22v12M32 28h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <strong className="lb-name">Vaga livre</strong>
                  <span className="lb-free-text">Aguardando jogador</span>
                </li>
              ))}
            </ul>
          </section>

          {me && (
            <section className="lb-panel lb-character" aria-labelledby="lb-character-title">
              <h2 id="lb-character-title">Seu personagem</h2>
              <AvatarPreview
                className="lb-preview"
                avatarId={me.avatarId}
                color={PAWN_COLORS[me.pawnColor].hex}
                label={AVATARS[me.avatarId].name}
              />
              <div className="lb-avatars" role="radiogroup" aria-label="Avatar">
                {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={me.avatarId === id}
                    aria-label={AVATARS[id].name}
                    title={AVATARS[id].name}
                    onClick={() => void customize(id, me.pawnColor)}
                  >
                    <AvatarPortrait avatarId={id} />
                  </button>
                ))}
              </div>
              <h3 className="lb-divider">Cor do peão</h3>
              <div className="lb-colors" role="radiogroup" aria-label="Cor do peão">
                {(Object.keys(PAWN_COLORS) as PawnColor[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={me.pawnColor === color}
                    aria-label={PAWN_COLORS[color].name}
                    title={takenColors.has(color) ? 'Em uso por outro jogador' : PAWN_COLORS[color].name}
                    disabled={takenColors.has(color)}
                    onClick={() => void customize(me.avatarId, color)}
                    style={{ background: PAWN_COLORS[color].hex }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="lb-footer">
          <p className="lb-hint">
            <span aria-hidden="true">ⓘ</span> {error ? <span className="lb-error" role="alert">{error}</span> : hint}
          </p>
          {me && (
            <button
              type="button"
              className={`lb-ready-btn${me.ready ? '' : ' lb-go'}`}
              onClick={() => void act(() => api.setReady(session.token, gameId, !me.ready))}
            >
              {me.ready ? 'Não estou pronto' : 'Estou pronto'}
            </button>
          )}
          {isHost && (
            <button
              type="button"
              className="lb-start"
              disabled={!lobby.canStart}
              onClick={() => void act(() => api.start(session.token, gameId))}
            >
              <strong>{lobby.canStart ? 'Iniciar partida' : '🔒 Iniciar partida'}</strong>
              {!lobby.canStart && <small>Aguardando todos ficarem prontos</small>}
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}
