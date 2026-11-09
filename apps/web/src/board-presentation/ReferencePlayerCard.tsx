import type { CompositionPlayer } from './ApprovedBoardComposition';
import { PlayerPortrait } from '../hud/AvatarPortrait';
import frame from './art/reference-player-frame-v2.svg';
import credits from './art/credit-notes-v1.svg';

/** A new frame only. Portrait assets and Google photo/fallback behavior remain unchanged. */
export function ReferencePlayerCard({nickname,balanceLabel,avatarId,photoUrl}:CompositionPlayer){
  return <article className="reference-player" aria-label={`${nickname}; saldo ${balanceLabel}`}>
    <img className="reference-player-frame" src={frame} alt=""/>
    <span className="reference-player-portrait"><PlayerPortrait avatarId={avatarId} photoUrl={photoUrl}/></span>
    <b className="reference-player-name" title={nickname}>{nickname}</b>
    <span className="reference-player-balance"><img src={credits} alt=""/><strong>{balanceLabel}</strong></span>
  </article>;
}
