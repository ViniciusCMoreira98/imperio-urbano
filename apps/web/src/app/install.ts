// App instalável (PWA). Android/Chrome: o navegador avisa que dá para instalar (beforeinstallprompt) e o
// botão "Instalar app" abre o pedido oficial. iPhone/iPad (Safari): não há pedido automático; o botão
// mostra o caminho Compartilhar › Adicionar à Tela de Início. Aberto como app, o botão some.
import { useSyncExternalStore } from 'react';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode = 'prompt' | 'ios' | null;

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Já está aberto como app (ícone da tela inicial)? */
function runningAsApp(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || ['fullscreen', 'standalone', 'minimal-ui'].some((mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches);
}

/** Safari de iPhone/iPad (inclui iPad que se apresenta como Mac com toque). */
export function isIosSafari(userAgent: string, maxTouchPoints: number): boolean {
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
  return ios && !otherBrowser;
}

/** Chamar uma vez no início: o aviso do navegador chega logo ao carregar a página. */
export function listenForInstall() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

function currentMode(): InstallMode {
  if (installed || runningAsApp()) return null;
  if (deferred) return 'prompt';
  if (typeof navigator !== 'undefined' && isIosSafari(navigator.userAgent, navigator.maxTouchPoints ?? 0)) return 'ios';
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Como o jogo pode ser instalado neste aparelho agora (null = não pode ou já está instalado). */
export function useInstallMode(): InstallMode {
  return useSyncExternalStore(subscribe, currentMode, () => null);
}

/** Abre o pedido oficial de instalação (Android/Chrome). */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  notify();
  return outcome === 'accepted';
}
