// Estado de cada personagem: se está animando vai para o pawnStore (a interface espera o pouso). Em
// desenvolvimento também vira gancho de teste (some do build de produção): o E2E lê em que casa cada
// personagem está desenhado e se já parou, para comparar com a posição oficial do snapshot.
import { usePawnStore } from '../store/pawnStore';

export interface PawnDebugState {
  /** Casa em que o personagem está (ou está chegando, enquanto anima). */
  tile: number;
  /** Parado no lugar oficial (sem salto nem deslize em andamento). */
  resting: boolean;
}

type DebugWindow = { __imperioPawns?: Record<string, PawnDebugState> };

export function reportPawn(playerId: string, state: PawnDebugState): void {
  usePawnStore.getState().setMoving(playerId, !state.resting);
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  const w = window as unknown as DebugWindow;
  (w.__imperioPawns ??= {})[playerId] = state;
}

export function forgetPawn(playerId: string): void {
  usePawnStore.getState().setMoving(playerId, false);
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  delete (window as unknown as DebugWindow).__imperioPawns?.[playerId];
}
