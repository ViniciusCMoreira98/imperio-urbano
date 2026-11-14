// Mesa 3D carregada (11/11/2026). No celular o tabuleiro demora a aparecer; antes disso o botão de rolar e o
// prazo surgiam sozinhos sobre o fundo vazio. O sinal liga quando tudo dentro do Suspense da cena montou
// (tabuleiro, peças e personagens) e desliga ao sair da partida.
import { useEffect } from 'react';
import { create } from 'zustand';

export const useBoardReady = create<{ ready: boolean }>()(() => ({ ready: false }));

/** Filho da cena: só monta quando o Suspense da mesa termina de carregar. */
export function BoardReadySignal() {
  useEffect(() => {
    useBoardReady.setState({ ready: true });
    return () => useBoardReady.setState({ ready: false });
  }, []);
  return null;
}
