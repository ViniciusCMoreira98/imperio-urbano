// Menu principal com a arte do kit do Codex (main-menu): praia, logotipo e mascote. Só aparece o que o
// jogo já tem (decisão do usuário, 06/11/2026): apelido, Jogar Online (criar sala ou entrar com código,
// tela do kit play-menu), voltar às suas partidas e Configurações. Nível, moedas e diamantes entram
// quando existirem; Jogar Agora (mesma rede local) espera o servidor de rede local (decisão de 07/11/2026).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { GameMode, LobbyView, PublicRoom } from '@imperio/shared-types';
import { rules } from '@imperio/game-data';
import './menuScreen.css';
import backgroundArt from '../main-menu/art/background-v1.webp';
import logoArt from '../main-menu/art/logo-v1.webp';
import mascotArt from '../main-menu/art/mascot-v1.webp';
import globeIcon from '../play-menu/art/globe-v1.svg';
import laurelLeft from '../main-menu/art/laurel-left-v1.svg';
import laurelRight from '../main-menu/art/laurel-right-v1.svg';
import { playSound } from '../audio/audio';
import { AvatarPortrait } from '../hud/AvatarPortrait';
import { SettingsButton } from '../hud/SettingsButton';
import { CreateOnlineRoomScreen, OnlinePlayScreen, PrivateRoomsScreen } from '../play-menu/PlayEntryScreens';
import { PublicRoomsScreen } from '../play-menu/PublicRoomsScreen';
import { api, ApiError } from '../net/api';
import { useWallet } from '../net/useWallet';
import { CurrencyMenuCard, PlayerMenuCard } from '../play-menu/MenuCards';
import { loadLastSession } from '../net/session';
import { useAppStore } from '../store/appStore';
import { Button, ErrorText, Panel } from '../ui/ui';

export function MenuScreen() {
  const session = useAppStore((s) => s.session);
  const [online, setOnline] = useState(false);
  const wallet = useWallet(online ? undefined : session?.token);
  if (session && online) return <OnlineEntry onBack={() => setOnline(false)} />;
  return (
    <main className="menu-scene" style={{ backgroundImage: `url(${backgroundArt})` }}>
      <div className="menu-top">
        {session ? (
          <>
            <PlayerMenuCard nickname={session.nickname} portrait={<AvatarPortrait avatarId="avatar-1" />} />
            {wallet && (
              <div className="pm-wallets menu-wallets">
                <CurrencyMenuCard kind="coins" balance={wallet.coins} />
                <CurrencyMenuCard kind="diamonds" balance={wallet.diamonds} />
              </div>
            )}
          </>
        ) : (
          <span />
        )}
        <SettingsButton inGame={false} className="menu-settings" />
      </div>
      <img className="menu-logo" src={logoArt} alt="Império Urbano — Edição Brasil" />
      <img className="menu-mascot" src={mascotArt} alt="" aria-hidden="true" />
      {session ? <PlayMenu onPlayOnline={() => setOnline(true)} /> : <NicknameForm />}
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

function PlayMenu({ onPlayOnline }: { onPlayOnline: () => void }) {
  const session = useAppStore((s) => s.session)!;
  const setSession = useAppStore((s) => s.setSession);
  const openLobby = useAppStore((s) => s.openLobby);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [myGames, setMyGames] = useState<LobbyView[]>([]);

  // Token que não vale mais volta a pedir o apelido; com token válido, lista as partidas em aberto.
  useEffect(() => {
    api.myGames(session.token).then(setMyGames, (e) => {
      if (e instanceof ApiError && e.status === 401) setSession(null);
    });
  }, [session.token, setSession]);


  return (
    <>
      <div className="menu-actions">
        <button
          type="button"
          className="menu-play menu-online"
          onClick={() => {
            playSound('confirmarAcao');
            onPlayOnline();
          }}
        >
          <img src={globeIcon} alt="" />
          <strong>Jogar Online</strong>
          <small>Criar sala ou entrar com código</small>
        </button>
      </div>
      {myGames.length > 0 && (
        <button
          type="button"
          className="menu-games"
          onClick={() => {
            playSound('confirmarAcao');
            setGamesOpen(true);
          }}
        >
          <img className="menu-laurel" src={laurelLeft} alt="" />
          <strong>Suas Partidas ({myGames.length})</strong>
          <img className="menu-laurel" src={laurelRight} alt="" />
        </button>
      )}

      {gamesOpen && (
        <MenuSheet title="Suas partidas" onClose={() => setGamesOpen(false)}>
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

/**
 * Jogar Online com a tela do kit play-menu: criar sala (Clássico ou Rápido) ou entrar com o código.
 * Liga as ações ao servidor atual; sem nível, moedas nem diamantes, que ainda não existem.
 */
/** Jogar Online: três destinos (Criar sala, Salas Públicas, Salas Privadas), cada um volta para a escolha. */
function OnlineEntry({ onBack }: { onBack: () => void }) {
  const session = useAppStore((s) => s.session)!;
  const openLobby = useAppStore((s) => s.openLobby);
  const [view, setView] = useState<'menu' | 'create' | 'public' | 'private'>('menu');
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const [publicRoom, setPublicRoom] = useState(true);
  const [code, setCode] = useState('');
  const [pending, setPending] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | undefined>();
  const stakes = rules.economy.stakes;
  const [stake, setStake] = useState(stakes[0]);
  // Saldo do servidor (já com a recarga grátis do dia). Sem resposta, os cards de moeda não aparecem.
  const wallet = useWallet(session.token);
  // Aposta escolhida acima do saldo cai para a maior que cabe (ou a menor).
  useEffect(() => {
    if (wallet && stake > wallet.coins) setStake(stakes.filter((v) => v <= wallet.coins).at(-1) ?? stakes[0]);
  }, [wallet, stake, stakes]);

  // Salas públicas: carregadas ao abrir a lista e no botão Atualizar.
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  async function loadRooms() {
    setLoadingRooms(true);
    setError(undefined);
    try {
      setRooms(await api.publicRooms(session.token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível carregar as salas.');
    } finally {
      setLoadingRooms(false);
    }
  }

  function go(next: typeof view) {
    playSound('confirmarAcao');
    setError(undefined);
    setView(next);
    if (next === 'public') void loadRooms();
  }

  async function run(kind: 'create' | 'join', action: () => Promise<LobbyView>, roomId?: string) {
    playSound('confirmarAcao');
    setPending(kind);
    setJoiningId(roomId ?? null);
    setError(undefined);
    try {
      openLobby(await action());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Algo deu errado.');
      playSound('erroAcaoInvalida');
      setPending(null);
      setJoiningId(null);
      if (roomId) void loadRooms(); // a sala pode ter lotado ou começado
    }
  }

  const player = { nickname: session.nickname, portrait: <AvatarPortrait avatarId="avatar-1" /> };
  const back = () => go('menu');
  const form = {
    player,
    wallet: wallet ?? undefined,
    mode,
    onModeChange: setMode,
    inviteCode: code,
    onInviteCodeChange: setCode,
    onCreate: () => void run('create', () => api.createGame(session.token, mode, stake, publicRoom)),
    onJoin: () => void run('join', () => api.joinGame(session.token, code)),
    onBack: back,
    pending,
    error,
  };

  if (view === 'create') {
    return (
      <CreateOnlineRoomScreen
        {...form}
        stake={{ options: stakes, value: stake, onChange: setStake, max: wallet?.coins }}
        visibility={{ publicRoom, onChange: setPublicRoom }}
      />
    );
  }
  if (view === 'private') return <PrivateRoomsScreen {...form} />;
  if (view === 'public') {
    return (
      <PublicRoomsScreen
        player={player}
        rooms={rooms.map((r) => ({
          id: r.gameId,
          name: `Sala de ${r.hostName}`,
          hostName: r.hostName,
          mode: r.mode,
          players: r.players,
          capacity: r.capacity,
          joinable: true,
          stake: r.stake,
        }))}
        onBack={back}
        onRefresh={() => void loadRooms()}
        onJoin={(id) => void run('join', () => api.joinPublic(session.token, id), id)}
        loading={loadingRooms}
        joiningId={joiningId}
        error={error}
      />
    );
  }
  return (
    <OnlinePlayScreen
      player={player}
      wallet={wallet ?? undefined}
      onBack={onBack}
      onCreateRoom={() => go('create')}
      onPublicRooms={() => go('public')}
      onPrivateRooms={() => go('private')}
    />
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
