import { GameScreen } from '../screens/GameScreen';
import { LobbyScreen } from '../screens/LobbyScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { useAppStore } from '../store/appStore';

export function App() {
  const screen = useAppStore((s) => s.screen);
  const session = useAppStore((s) => s.session);

  if (!session || screen === 'menu') return <MenuScreen />;
  if (screen === 'lobby') return <LobbyScreen />;
  return <GameScreen />;
}
