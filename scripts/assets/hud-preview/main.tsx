import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameScreen } from '../../../apps/web/src/screens/GameScreen';
import { useAppStore } from '../../../apps/web/src/store/appStore';
import { useGameStore } from '../../../apps/web/src/store/gameStore';
import { useViewStore } from '../../../apps/web/src/store/viewStore';
import '../../../apps/web/src/index.css';

// Prévia exclusiva de QA: Playwright intercepta o WebSocket, sem backend real.
useAppStore.setState({session:{playerId:'visual-1',nickname:'Vinícius',token:'visual-fixture'},gameId:'hud-visual-fixture',screen:'game'});
(window as any).hudQA = { game:useGameStore, view:useViewStore };
createRoot(document.getElementById('root')!).render(<GameScreen/>);
