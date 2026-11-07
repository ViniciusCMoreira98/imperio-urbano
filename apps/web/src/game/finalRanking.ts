// Classificação final mostrada na tela de fim de partida. Os vencedores vêm do servidor (winnerIds);
// o restante segue a mesma regra do desempate do servidor: patrimônio, depois saldo. Falidos por último.
import { rules } from '@imperio/game-data';
import type { GameSnapshot, PlayerState } from '@imperio/shared-types';
import { netWorth } from './rules';

export interface RankedPlayer {
  player: PlayerState;
  /** 1 para os vencedores; empates de patrimônio e saldo dividem a posição. */
  place: number;
  winner: boolean;
  netWorth: number;
  properties: number;
}

export function finalRanking(snapshot: GameSnapshot): RankedPlayer[] {
  const winners = new Set(snapshot.winnerIds);
  const rows = snapshot.players.map((player) => ({
    player,
    winner: winners.has(player.id),
    netWorth: player.bankrupt ? 0 : netWorth(snapshot, player.id),
    properties: snapshot.properties.filter((p) => p.ownerId === player.id).length,
  }));
  const key = (r: (typeof rows)[number]) => [Number(r.winner), Number(!r.player.bankrupt), r.netWorth, r.player.credits];
  const compare = (a: (typeof rows)[number], b: (typeof rows)[number]) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  };
  const sorted = [...rows].sort((a, b) => compare(a, b) || a.player.seat - b.player.seat);
  return sorted.map((row, i) => {
    const first = sorted.findIndex((other) => compare(other, row) === 0);
    return { ...row, place: (first === -1 ? i : first) + 1 };
  });
}

/** Modos por tempo que terminaram pelo relógio (e não por falência dos outros). */
export function endedByClock(snapshot: GameSnapshot): boolean {
  return rules.modes[snapshot.mode].timeLimitMinutes !== null && snapshot.timeUp;
}

/** Moedas que cada vencedor leva: aposta × jogadores, dividida no empate (sobra vai ao primeiro, como no servidor). */
export function prizeShare(stake: number, players: number, winners: number): number {
  if (stake <= 0 || winners <= 0) return 0;
  return Math.floor((stake * players) / winners);
}
