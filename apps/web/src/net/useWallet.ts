// Saldo do jogador (moedas e diamantes) lido do servidor ao abrir a tela. O servidor já aplica a recarga
// grátis do dia. Sem resposta (servidor fora), fica null e os cards de moeda não aparecem.
import { useEffect, useState } from 'react';
import { api, type Wallet } from './api';

export function useWallet(token: string | undefined): Wallet | null {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  useEffect(() => {
    if (!token) return;
    let alive = true;
    api.wallet(token).then(
      (w) => alive && setWallet(w),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [token]);
  return wallet;
}
