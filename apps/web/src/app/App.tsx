import { useEffect } from 'react';
import { setMusic } from '../audio/music';
import { RotateDeviceNotice, useAskToRotate } from '../hud/RotateDeviceNotice';
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

  // Celular em pé: pede para girar já ao abrir o jogo, no menu e na sala (a partida cuida do próprio aviso).
  const askToRotate = useAskToRotate();
  if (inGame) return <GameScreen />;
  return (
    <>
      <div className="contents" inert={askToRotate} aria-hidden={askToRotate || undefined}>
        {!session || screen === 'menu' ? <MenuScreen /> : <LobbyScreen />}
      </div>
      {askToRotate && <RotateDeviceNotice inGame={false} />}
    </>
  );
}
