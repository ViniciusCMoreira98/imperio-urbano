import { useEffect, useState } from 'react';
import type { AvatarId, LobbyView, PawnColor } from '@imperio/shared-types';
import { AvatarPreview } from '../avatars/AvatarPreview';
import { modeDescription } from '../game/modes';
import { AVATARS, PAWN_COLORS } from '../game/presentation';
import { api, ApiError } from '../net/api';
import { useAppStore } from '../store/appStore';
import { Button, ErrorText, MenuBackground, Panel } from '../ui/ui';

/** A sala ainda não tem canal em tempo real: consulta o servidor periodicamente. */
const POLL_MS = 1500;

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
      <MenuBackground>
        <p className="text-white/80">Carregando sala…</p>
      </MenuBackground>
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

  return (
    <MenuBackground>
      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[1.2fr_1fr]">
        <Panel title="Sala de espera">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-white/70">Código:</span>
            <span className="rounded-lg bg-slate-800 px-3 py-1 font-mono text-2xl font-bold tracking-[0.3em] text-white">
              {lobby.inviteCode}
            </span>
            <Button
              className="px-3 py-1 text-sm"
              onClick={() => {
                void navigator.clipboard?.writeText(lobby.inviteCode).then(() => setCopied(true));
              }}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>

          <h3 className="mb-2 font-bold text-white">Jogadores ({lobby.players.length}/4)</h3>
          <ul className="space-y-2">
            {lobby.players.map((p) => (
              <li key={p.playerId} className="flex items-center gap-3 rounded-lg bg-slate-800/80 px-3 py-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-2xl ring-2"
                  style={{ background: `${PAWN_COLORS[p.pawnColor].hex}33`, ['--tw-ring-color' as string]: PAWN_COLORS[p.pawnColor].hex }}
                  aria-hidden
                >
                  {AVATARS[p.avatarId].emoji}
                </span>
                <span className="flex-1 text-white">
                  {p.nickname}
                  {p.playerId === session.playerId && <span className="text-white/60"> (você)</span>}
                  {p.playerId === lobby.hostPlayerId && <span title="Anfitrião"> 👑</span>}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-sm font-bold ${p.ready ? 'bg-emerald-600 text-white' : 'text-white/60'}`}
                >
                  {p.ready ? 'Pronto' : 'Aguardando…'}
                </span>
              </li>
            ))}
            {Array.from({ length: 4 - lobby.players.length }, (_, i) => (
              <li key={`vazio-${i}`} className="rounded-lg border border-dashed border-white/15 px-3 py-3 text-white/40">
                Aguardando jogador…
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm text-white/70">
            Modo: <strong>{modeDescription(lobby.mode)}</strong>
          </p>
          {lobby.stake > 0 && (
            <p className="mt-1 text-sm text-white/70">
              Aposta: <strong>{lobby.stake.toLocaleString('pt-BR')} moedas</strong> por jogador · prêmio de{' '}
              <strong>{(lobby.stake * lobby.players.length).toLocaleString('pt-BR')}</strong> ao vencedor
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={leave}>
              ← Menu
            </Button>
            {me && (
              <Button variant={me.ready ? 'secondary' : 'confirm'} onClick={() => void act(() => api.setReady(session.token, gameId, !me.ready))}>
                {me.ready ? 'Não estou pronto' : 'Estou pronto'}
              </Button>
            )}
            {isHost && (
              <Button
                variant="primary"
                className="flex-1"
                disabled={!lobby.canStart}
                title={lobby.canStart ? undefined : 'Precisa de 2 a 4 jogadores, todos prontos.'}
                onClick={() => void act(() => api.start(session.token, gameId))}
              >
                INICIAR PARTIDA
              </Button>
            )}
          </div>
          {!isHost && <p className="mt-2 text-sm text-white/60">O anfitrião inicia quando todos estiverem prontos.</p>}
          <ErrorText message={error} />
        </Panel>

        {me && (
          <Panel title="Seu avatar">
            <AvatarPreview avatarId={me.avatarId} color={PAWN_COLORS[me.pawnColor].hex} label={AVATARS[me.avatarId].name} />
            <p className="mb-3 mt-1 text-center font-bold text-white">{AVATARS[me.avatarId].name}</p>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Avatar">
              {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={me.avatarId === id}
                  aria-label={AVATARS[id].name}
                  onClick={() => void customize(id, me.pawnColor)}
                  className={`flex aspect-square items-center justify-center rounded-xl text-3xl transition ${
                    me.avatarId === id ? 'bg-amber-300/25 ring-2 ring-amber-300' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {AVATARS[id].emoji}
                </button>
              ))}
            </div>

            <h3 className="mb-2 mt-4 font-bold text-white">Cor do peão</h3>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor do peão">
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
                  className={`h-10 w-10 rounded-full transition disabled:opacity-25 ${
                    me.pawnColor === color ? 'ring-4 ring-white' : 'ring-1 ring-white/30'
                  }`}
                  style={{ background: PAWN_COLORS[color].hex }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-white/50">Avatares podem se repetir; a cor identifica seu peão.</p>
          </Panel>
        )}
      </div>
    </MenuBackground>
  );
}
