import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { listenForInstall } from './app/install';
import { preloadAvatars } from './avatars/AvatarFigure';
import './index.css';

listenForInstall();
preloadAvatars();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
