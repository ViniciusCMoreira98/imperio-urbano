import { useEffect } from 'react';
import { setMusic } from '../audio/music';
import { GameScreen } from '../screens/GameScreen';
import { LobbyScreen } from '../screens/LobbyScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { useAppStore } from '../store/appStore';

export function App() {
  const screen = useAppStore((s) => s.screen);
  const session = useAppStore((s) => s.session);
  const inGame = !!session && screen !== 'menu' && screen !== 'lobby';

  // Música do menu no menu, no Jogar Online e na sala de espera; a do tabuleiro durante a partida.
  useEffect(() => setMusic(inGame ? 'board' : 'menu'), [inGame]);

  if (!session || screen === 'menu') return <MenuScreen />;
  if (screen === 'lobby') return <LobbyScreen />;
  return <GameScreen />;
}
