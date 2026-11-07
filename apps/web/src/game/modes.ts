// Nomes e descrições dos modos de partida, num só lugar (menu, sala, HUD e tabuleiro).
import { rules } from '@imperio/game-data';
import type { GameMode } from '@imperio/shared-types';

export const MODES: GameMode[] = ['CLASSIC', 'QUICK', 'TIMED_25', 'TIMED_60'];

const minutes = (mode: GameMode) => rules.modes[mode].timeLimitMinutes;

/** Nome curto: "Clássico", "Rápido", "25 min", "1 hora". */
export function modeName(mode: GameMode): string {
  const m = minutes(mode);
  if (m !== null) return m % 60 === 0 ? `${m / 60} hora${m === 60 ? '' : 's'}` : `${m} min`;
  return mode === 'QUICK' ? 'Rápido' : 'Clássico';
}

/** Como a partida termina, em poucas palavras. */
export function modeRule(mode: GameMode): string {
  if (minutes(mode) !== null) return 'Maior patrimônio.';
  const rounds = rules.modes[mode].roundLimit;
  return rounds === null ? 'Último a falir.' : `${rounds} rodadas.`;
}

/** Descrição completa, para a sala de espera. */
export function modeDescription(mode: GameMode): string {
  const m = minutes(mode);
  if (m !== null) return `${modeName(mode)} (vence o maior patrimônio ao fim do tempo)`;
  const rounds = rules.modes[mode].roundLimit;
  return rounds === null ? 'Clássico (sem limite de rodadas)' : `Rápido (${rounds} rodadas)`;
}

/** Modo por tempo? */
export function isTimed(mode: GameMode): boolean {
  return minutes(mode) !== null;
}

/** "12:05" a partir de milissegundos (arredonda para cima, nunca negativo). */
export function clockText(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
