// Botão oficial "Entrar com Google" (Google Identity Services). O navegador recebe um ID token e o envia ao
// servidor, que confere a assinatura e liga ou recupera a conta. Sem Client ID no servidor, nada aparece.
import { useEffect, useRef, useState } from 'react';
import { api } from '../net/api';

interface GsiButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'continue_with' | 'signin';
  shape?: 'pill' | 'rectangular';
  locale?: string;
  width?: number;
}

interface Gsi {
  accounts: {
    id: {
      initialize(options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: 'popup' }): void;
      renderButton(parent: HTMLElement, options: GsiButtonOptions): void;
    };
  };
}

declare global {
  interface Window {
    google?: Gsi;
  }
}

const SCRIPT = 'https://accounts.google.com/gsi/client';
let script: Promise<Gsi> | null = null;
let clientId: Promise<string | null> | null = null;
/** O GIS guarda um callback por página: o botão montado por último recebe o login. */
let current: ((credential: string) => void) | null = null;
let initializedFor: string | null = null;

function loadScript(): Promise<Gsi> {
  script ??= new Promise<Gsi>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google);
    const tag = document.createElement('script');
    tag.src = SCRIPT;
    tag.async = true;
    tag.onload = () => (window.google ? resolve(window.google) : reject(new Error('Google indisponível')));
    tag.onerror = () => {
      script = null;
      reject(new Error('Não foi possível carregar o login do Google.'));
    };
    document.head.appendChild(tag);
  });
  return script;
}

/** Client ID público vindo do servidor (uma vez por página); nulo = login com Google desligado. */
export function googleClientId(): Promise<string | null> {
  clientId ??= api.authConfig().then((c) => c.googleClientId ?? null, () => {
    clientId = null;
    return null;
  });
  return clientId;
}

export function GoogleButton({ onCredential, text = 'signin_with', width = 280 }: { onCredential: (credential: string) => void; text?: GsiButtonOptions['text']; width?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'off' | 'error'>('loading');
  const callback = useRef(onCredential);
  callback.current = onCredential;

  useEffect(() => {
    let alive = true;
    googleClientId()
      .then((id) => {
        if (!id) {
          if (alive) setState('off');
          return;
        }
        return loadScript().then((gsi) => {
          if (!alive || !host.current) return;
          current = (credential) => callback.current(credential);
          if (initializedFor !== id) {
            gsi.accounts.id.initialize({ client_id: id, callback: (r) => current?.(r.credential), ux_mode: 'popup' });
            initializedFor = id;
          }
          host.current.replaceChildren();
          gsi.accounts.id.renderButton(host.current, { theme: 'filled_blue', size: 'large', text, shape: 'pill', locale: 'pt-BR', width });
          setState('ready');
        });
      })
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, [text, width]);

  if (state === 'off') return null;
  return (
    <div className="google-button">
      <div ref={host} />
      {state === 'error' && <p className="text-xs text-rose-300">Não foi possível carregar o login do Google.</p>}
    </div>
  );
}
