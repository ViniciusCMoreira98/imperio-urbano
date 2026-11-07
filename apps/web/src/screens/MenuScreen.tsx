// Menu principal com a arte do kit do Codex (main-menu): praia, logotipo e mascote. Só aparece o que o
// jogo já tem (decisão do usuário, 06/11/2026): apelido, criar sala, entrar com código, voltar às suas
// partidas e Configurações. Nível, moedas, diamantes e partida com IA entram quando existirem.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameMode, LobbyView } from '@imperio/shared-types';
import './menuScreen.css';
import backgroundArt from '../main-menu/art/background-v1.webp';
import logoArt from '../main-menu/art/logo-v1.webp';
import mascotArt from '../main-menu/art/mascot-v1.webp';
import diceArt from '../main-menu/art/dice-v1.webp';
import playersIcon from '../main-menu/art/players-v1.svg';
import laurelLeft from '../main-menu/art/laurel-left-v1.svg';
import laurelRight from '../main-menu/art/laurel-right-v1.svg';
import { playSound } from '../audio/audio';
import { setMenuMusic } from '../audio/music';
import { SettingsButton } from '../hud/SettingsButton';
import { api, ApiError } from '../net/api';
import { loadLastSession } from '../net/session';
import { useAppStore } from '../store/appStore';
import { Button, ErrorText, Panel } from '../ui/ui';

const MODES: { id: GameMode; title: string; text: string }[] = [
  { id: 'CLASSIC', title: 'Clássico', text: 'Vence o último jogador que não falir.' },
  { id: 'QUICK', title: 'Rápido', text: 'Após 15 rodadas, vence o maior patrimônio.' },
];

type Sheet = 'create' | 'join' | 'games' | null;

export function MenuScreen() {
  const session = useAppStore((s) => s.session);
  // Música do menu inicial enquanto esta tela está aberta.
  useEffect(() => {
    setMenuMusic(true);
    return () => setMenuMusic(false);
  }, []);
  return (
    <main className="menu-scene" style={{ backgroundImage: `url(${backgroundArt})` }}>
      <div className="menu-top">
        {session ? (
          <div className="menu-profile">
            <span className="menu-profile-label">Jogando como</span>
            <strong>{session.nickname}</strong>
          </div>
        ) : (
          <span />
        )}
        <SettingsButton inGame={false} className="menu-settings" />
      </div>
      <img className="menu-logo" src={logoArt} alt="Império Urbano — Edição Brasil" />
      <img className="menu-mascot" src={mascotArt} alt="" aria-hidden="true" />
      {session ? <PlayMenu /> : <NicknameForm />}
    </main>
  );
}

function NicknameForm() {
  const setSession = useAppStore((s) => s.setSession);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const last = loadLastSession();

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      setSession(await api.createSession(nickname));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Como quer ser chamado?" className="menu-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="nickname" className="mb-1 block text-sm text-white/80">
          Apelido
        </label>
        <input
          id="nickname"
          autoFocus
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-lg border border-sky-400/40 bg-slate-800 px-3 py-2 text-lg text-white outline-none focus:border-amber-300"
          placeholder="Ex.: Vinicius"
        />
        <Button type="submit" variant="primary" className="mt-4 w-full text-lg" disabled={busy || !nickname.trim()}>
          ENTRAR
        </Button>
        <ErrorText message={error} />
      </form>
      {last && (
        <Button variant="confirm" className="mt-3 w-full" onClick={() => setSession(last)}>
          Continuar como {last.nickname}
        </Button>
      )}
    </Panel>
  );
}

function PlayMenu() {
  const session = useAppStore((s) => s.session)!;
  const setSession = useAppStore((s) => s.setSession);
  const openLobby = useAppStore((s) => s.openLobby);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [myGames, setMyGames] = useState<LobbyView[]>([]);

  // Token que não vale mais volta a pedir o apelido; com token válido, lista as partidas em aberto.
  useEffect(() => {
    api.myGames(session.token).then(setMyGames, (e) => {
      if (e instanceof ApiError && e.status === 401) setSession(null);
    });
  }, [session.token, setSession]);

  const open = (next: Sheet) => {
    playSound('confirmarAcao');
    setSheet(next);
  };

  return (
    <>
      <div className="menu-actions">
        <button type="button" className="menu-play" onClick={() => open('create')}>
          <img src={diceArt} alt="" />
          <strong>Criar Sala</strong>
          <small>Clássico ou Rápido</small>
        </button>
        <button type="button" className="menu-play menu-join" onClick={() => open('join')}>
          <img src={playersIcon} alt="" />
          <strong>Entrar na Sala</strong>
          <small>Com o código do convite</small>
        </button>
      </div>
      {myGames.length > 0 && (
        <button type="button" className="menu-games" onClick={() => open('games')}>
          <img className="menu-laurel" src={laurelLeft} alt="" />
          <strong>Suas Partidas ({myGames.length})</strong>
          <img className="menu-laurel" src={laurelRight} alt="" />
        </button>
      )}

      {sheet === 'create' && (
        <MenuSheet title="Criar sala privada" onClose={() => setSheet(null)}>
          <CreateGame onCreated={openLobby} />
        </MenuSheet>
      )}
      {sheet === 'join' && (
        <MenuSheet title="Entrar com código" onClose={() => setSheet(null)}>
          <JoinGame onJoined={openLobby} />
        </MenuSheet>
      )}
      {sheet === 'games' && (
        <MenuSheet title="Suas partidas" onClose={() => setSheet(null)}>
          <ul className="space-y-2">
            {myGames.map((game) => (
              <li key={game.gameId} className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm">
                <span className="font-mono font-bold tracking-widest text-white">{game.inviteCode}</span>
                <span className="flex-1 text-white/70">
                  {game.status === 'IN_PROGRESS' ? 'em andamento' : 'na sala de espera'} · {game.players.length} jogador(es)
                </span>
                <Button variant="primary" className="px-3 py-1 text-sm" onClick={() => openLobby(game)}>
                  Voltar
                </Button>
              </li>
            ))}
          </ul>
        </MenuSheet>
      )}
    </>
  );
}

/** Chama a API e abre a sala; mostra o erro do servidor quando não dá. */
function useLobbyAction(onDone: (lobby: LobbyView) => void) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<LobbyView>) {
    setBusy(true);
    setError(null);
    try {
      onDone(await action());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }
  return { error, busy, run };
}

function CreateGame({ onCreated }: { onCreated: (lobby: LobbyView) => void }) {
  const session = useAppStore((s) => s.session)!;
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const { error, busy, run } = useLobbyAction(onCreated);
  return (
    <>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Modo de jogo">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-lg border p-3 text-left text-sm transition ${
              mode === m.id ? 'border-amber-300 bg-amber-300/15' : 'border-sky-400/30 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <span className="block font-bold text-white">{m.title}</span>
            <span className="text-white/70">{m.text}</span>
          </button>
        ))}
      </div>
      <Button variant="primary" className="mt-3 w-full text-lg" disabled={busy} onClick={() => void run(() => api.createGame(session.token, mode))}>
        CRIAR SALA
      </Button>
      <ErrorText message={error} />
    </>
  );
}

function JoinGame({ onJoined }: { onJoined: (lobby: LobbyView) => void }) {
  const session = useAppStore((s) => s.session)!;
  const [code, setCode] = useState('');
  const { error, busy, run } = useLobbyAction(onJoined);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => api.joinGame(session.token, code));
      }}
    >
      <div className="flex gap-2">
        <input
          aria-label="Código da sala"
          autoFocus
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="7F3KD9"
          className="min-w-0 flex-1 rounded-lg border border-sky-400/40 bg-slate-800 px-3 py-2 font-mono text-lg tracking-[0.3em] text-white outline-none focus:border-amber-300"
        />
        <Button type="submit" variant="secondary" disabled={busy || code.length < 6}>
          ENTRAR
        </Button>
      </div>
      <ErrorText message={error} />
    </form>
  );
}

/** Folha sobre o menu (criar, entrar, suas partidas): fecha no ✕, no Esc ou tocando fora. */
function MenuSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="menu-sheet"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === dialog.current && onClose()}
    >
      <Panel title={title} className="relative">
        <button type="button" className="absolute right-3 top-3 text-xl text-white/70 hover:text-white" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        {children}
      </Panel>
    </dialog>
  );
}
