import { useEffect, useState, type CSSProperties } from 'react';
import { rules } from '@imperio/game-data';
import { endedByClock, finalRanking, prizeShare } from '../game/finalRanking';
import { modeName } from '../game/modes';
import { PAWN_COLORS } from '../game/presentation';
import { api } from '../net/api';
import { formatCredits } from '../property-card/tileInfo';
import { useGameStore } from '../store/gameStore';
import { Button } from '../ui/ui';
import { AvatarPortrait, LeaderCrown } from './AvatarPortrait';
import trophy from './art/game-over/trophy-v1.webp';
import clockIcon from './art/game-over/clock-v1.svg';
import finishIcon from './art/game-over/finish-v1.svg';
import exitIcon from './art/game-over/exit-v1.svg';
import coinIcon from '../main-menu/art/coin-v1.svg';
import './gameOver.css';

/**
 * Resultado da partida. Nos modos por tempo, deixa claro que o relógio acabou e que venceu o maior
 * patrimônio, com o patrimônio de cada um. Também cobre fim por falência e por abandono.
 */
export function GameOverScreen({ myId, token, gameId, onLeave }: { myId: string; token: string; gameId: string; onLeave: () => void }) {
  const snapshot = useGameStore((s) => s.snapshot)!;
  const [stake, setStake] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    api.lobby(token, gameId).then((lobby) => alive && setStake(lobby.stake)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [token, gameId]);

  const ranking = finalRanking(snapshot);
  const winners = ranking.filter((r) => r.winner);
  const abandoned = winners.length === 0;
  const byClock = endedByClock(snapshot);
  const iWon = winners.some((r) => r.player.id === myId);
  const mine = ranking.find((r) => r.player.id === myId);
  const share = stake === null ? 0 : prizeShare(stake, snapshot.players.length, winners.length);
  const names = winners.map((r) => r.player.nickname).join(' e ');
  const others = winners.filter((r) => r.player.id !== myId).map((r) => r.player.nickname).join(' e ');
  const minutes = rules.modes[snapshot.mode].timeLimitMinutes;

  const title = abandoned ? 'Partida encerrada' : byClock ? 'Acabou o tempo!' : 'Fim de jogo!';
  const subtitle = abandoned
    ? 'Todos saíram e ninguém voltou a tempo. Não houve vencedor.'
    : byClock
      ? `Depois de ${minutes} min, vence o maior patrimônio (saldo + estados + construções + aluguel).`
      : winners.length > 1
        ? 'Empate!'
        : 'Os outros jogadores faliram.';

  return (
    <div className="go-backdrop" role="dialog" aria-modal="true" aria-labelledby="go-title">
      <section className="go-card" data-outcome={abandoned ? 'abandoned' : iWon ? winners.length > 1 ? 'tie' : 'victory' : 'placed'}>
        {iWon && <div className="go-confetti" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*19)%60}%`,rotate:`${(i*31)%180}deg`,background:['#f4d16b','#6fdca6','#7bbde7'][i%3],animationDelay:`${i*.055}s`}}/>)}</div>}
        <header className="go-head">
          <span className="go-icon" aria-hidden="true"><img src={abandoned ? exitIcon : byClock ? clockIcon : finishIcon} alt=""/></span>
          <div>
            <span className="go-eyebrow">IMPÉRIO URBANO · RESULTADO</span>
            <h2 id="go-title" className="go-title">{title}</h2>
            <p className="go-sub">{subtitle}</p>
          </div>
          {iWon && <img className="go-trophy" src={trophy} alt="" aria-hidden="true"/>}
        </header>

        {!abandoned && (
          <p className="go-result">
            {iWon ? (
              <strong>{winners.length > 1 ? `Empate! Você divide a vitória com ${others}.` : 'Você venceu!'}</strong>
            ) : (
              <span>
                <strong>{names}</strong> {winners.length > 1 ? 'empataram e venceram.' : 'venceu.'}
                {mine && !mine.player.bankrupt && <> Você ficou em {mine.place}º.</>}
              </span>
            )}
            {share > 0 && (
              <span className="go-prize">
                <span>{iWon ? 'Você leva' : winners.length > 1 ? 'Cada vencedor leva' : 'Prêmio'}:</span> <img src={coinIcon} alt="moedas"/> <strong>{share.toLocaleString('pt-BR')}</strong>
              </span>
            )}
          </p>
        )}

        <div className="go-ranking-label" aria-hidden="true"><span>CLASSIFICAÇÃO FINAL</span><span>{ranking.length} jogadores</span></div>
        <ol className="go-list" aria-label="Classificação final">
          {ranking.map((r) => {
            const color = PAWN_COLORS[r.player.pawnColor].hex;
            return (
              <li key={r.player.id} className={`go-row${r.winner ? ' go-winner' : ''}${r.player.bankrupt ? ' go-bankrupt' : ''}`} style={{ borderColor: color,'--go-player-color':color } as CSSProperties}>
                <span className="go-place">{r.place}º</span>
                <span className="go-avatar" style={{ background: `${color}55`, boxShadow: `0 0 0 2px ${color}` }}>
                  <AvatarPortrait avatarId={r.player.avatarId} />
                  {r.winner && <span className="go-crown"><LeaderCrown /></span>}
                </span>
                <span className="go-name">
                  <span className="go-nick">
                    <span className="go-player-name" title={r.player.nickname}>{r.player.nickname}</span>
                    {r.player.id === myId && <small> (você)</small>}
                  </span>
                  <small className="go-detail">
                    {r.player.bankrupt ? 'Faliu' : `${r.properties} estado(s) · saldo ${formatCredits(r.player.credits)}`}
                  </small>
                </span>
                <span className="go-worth">
                  <small>Patrimônio</small>
                  {r.player.bankrupt ? '—' : formatCredits(r.netWorth)}
                </span>
              </li>
            );
          })}
        </ol>

        <footer className="go-foot">
          <span className="go-mode">{modeName(snapshot.mode)} · {snapshot.round} rodada(s)</span>
          <Button variant="primary" className="go-menu-button" onClick={onLeave}>
            Voltar ao menu
          </Button>
        </footer>
      </section>
    </div>
  );
}
