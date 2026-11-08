import { useEffect } from 'react';
import { api } from '../net/api';
import { useAppStore } from '../store/appStore';

/**
 * Confere com o servidor a conta da sessão guardada: Google ligado, e-mail e foto. Sessões salvas antes
 * do login com Google (ou da foto) não têm esses campos; o servidor completa.
 */
export function useAccountSync() {
  const session = useAppStore((s) => s.session);
  const setSession = useAppStore((s) => s.setSession);
  useEffect(() => {
    if (!session) return;
    let alive = true;
    api.me(session.token).then((me) => {
      const same = me.google === !!session.google && me.email === (session.email ?? null) && me.photoUrl === (session.photoUrl ?? null);
      if (alive && !same) setSession({ ...session, google: me.google, email: me.email, photoUrl: me.photoUrl });
    }, () => undefined);
    return () => {
      alive = false;
    };
  }, [session, setSession]);
}
