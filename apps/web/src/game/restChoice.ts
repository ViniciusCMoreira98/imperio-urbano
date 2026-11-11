import {board} from '@imperio/game-data';
import type {GameSnapshot} from '@imperio/shared-types';
/** A escolha só existe na própria vez, antes do lance e durante a penalidade do Descanso. */
export function shouldOfferRestChoice(snapshot:GameSnapshot|null,myId:string):boolean{
 const me=snapshot?.players.find(p=>p.id===myId);
 return !!snapshot&&snapshot.status==='IN_PROGRESS'&&snapshot.currentPlayerId===myId&&snapshot.phase==='AWAITING_ROLL'&&!!me&&!me.bankrupt&&me.skipTurns>0&&board.tiles.some(t=>t.index===me.position&&t.type==='REST');
}
