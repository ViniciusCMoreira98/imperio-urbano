import { useEffect, useState } from 'react';
import type { GameMode } from '@imperio/shared-types';
import type { LobbyView } from '@imperio/shared-types';
import { api, ApiError } from '../net/api';
import { loadLastSession } from '../net/session';
import { useAppStore } from '../store/appStore';
import { Button, ErrorText, Logo, MenuBackground, Panel } from '../ui/ui';

const MODES: { id: GameMode; title: string; text: string }[] = [
  { id: 'CLASSIC', title: 'Clássico', text: 'Vence o último jogador que não falir.' },
  { id: 'QUICK', title: 'Rápido', text: 'Após 15 rodadas, vence o maior patrimônio.' },
];

export function MenuScreen() {
  const session = useAppStore((s) => s.session);
  return (
    <MenuBackground>
      <div className="w-full max-w-md">
        <Logo />
        {session ? <PlayMenu /> : <NicknameForm />}
      </div>
    </MenuBackground>
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
    <Panel title="Como quer ser chamado?">
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
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myGames, setMyGames] = useState<LobbyView[]>([]);

  // Token que não vale mais volta a pedir o apelido; com token válido, lista as partidas em aberto.
  useEffect(() => {
    api.myGames(session.token).then(setMyGames, (e) => {
      if (e instanceof ApiError && e.status === 401) setSession(null);
    });
  }, [session.token, setSession]);

  async function run(action: () => Promise<Parameters<typeof openLobby>[0]>) {
    setBusy(true);
    setError(null);
    try {
      openLobby(await action());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo deu errado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <p className="mb-4 text-center text-white/90">
        Olá, <strong className="text-amber-300">{session.nickname}</strong>!{' '}
        <button type="button" className="text-sm text-sky-300 underline" onClick={() => setSession(null)}>
          trocar apelido
        </button>
      </p>

      {myGames.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 font-bold text-white">Suas partidas</h2>
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
        </div>
      )}

      <h2 className="mb-2 font-bold text-white">Criar sala privada</h2>
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
      <Button
        variant="primary"
        className="mt-3 w-full text-lg"
        disabled={busy}
        onClick={() => void run(() => api.createGame(session.token, mode))}
      >
        CRIAR SALA
      </Button>

      <h2 className="mb-2 mt-6 font-bold text-white">Entrar com código</h2>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run(() => api.joinGame(session.token, code));
        }}
      >
        <input
          aria-label="Código da sala"
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="7F3KD9"
          className="min-w-0 flex-1 rounded-lg border border-sky-400/40 bg-slate-800 px-3 py-2 font-mono text-lg tracking-[0.3em] text-white outline-none focus:border-amber-300"
        />
        <Button type="submit" variant="secondary" disabled={busy || code.length < 6}>
          ENTRAR
        </Button>
      </form>
      <ErrorText message={error} />
    </Panel>
  );
}
