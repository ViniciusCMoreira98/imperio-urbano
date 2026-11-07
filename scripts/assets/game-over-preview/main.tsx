import React from 'react';
import {createRoot} from 'react-dom/client';
import type {AvatarId,GameSnapshot,LobbyView,PawnColor} from '@imperio/shared-types';
import {GameOverScreen} from '../../../apps/web/src/hud/GameOverScreen';
import {useGameStore} from '../../../apps/web/src/store/gameStore';
import {api} from '../../../apps/web/src/net/api';
import {endedByClock,finalRanking,prizeShare} from '../../../apps/web/src/game/finalRanking';
import {formatCredits} from '../../../apps/web/src/property-card/tileInfo';

const params=new URLSearchParams(location.search),kind=params.get('case')??'victory',count=Number(params.get('count')??(kind==='six'?6:3)),colors:PawnColor[]=['AZUL','VERDE','VERMELHO','ROXO','AMARELO','LARANJA'];
const abandoned=kind==='abandoned',classic=kind==='classic'||kind==='nostake',tie=kind==='tie';
const players=Array.from({length:count},(_,i)=>({id:`p${i+1}`,nickname:kind==='six'?(i===0?'Vinícius com nome muito comprido':`Jogador ${i+1} com nome extenso`):['Vinícius','Marina','Lucas','Sofia','Caio','Seu Zé'][i],avatarId:`avatar-${i%5+1}` as AvatarId,pawnColor:colors[i],seat:i,credits:kind==='six'&&i===0?9999999:tie&&i<2?1800:1800-i*300,position:0,ready:true,connected:!abandoned,bankrupt:abandoned||(classic&&i>0)||(count===6&&i===5),skipTurns:0,travelPending:false,restPasses:0,rentWaivers:0}));
const game={gameId:`preview-${kind}`,inviteCode:'ARTE01',mode:classic?'CLASSIC':kind==='placed'?'TIMED_60':'TIMED_25',status:'FINISHED',version:100,round:12,currentPlayerId:null,phase:null,lastDice:null,players,properties:tie||abandoned?[]:[{stateId:'SP',ownerId:'p1',buildingLevel:2,ownerVisits:2,levelReachedAtVisit:1,blackoutVisitsLeft:0}],winnerIds:abandoned?[]:tie?['p1','p2']:['p1'],timeUp:!classic,olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},taxPool:0} as GameSnapshot;
const myId=kind==='placed'?'p3':'p1',stake=kind==='nostake'?0:200;let leaves=0;
// API simulada apenas nesta prévia. Nenhuma sala ou conta real é acessada.
api.lobby=async()=>({stake} as LobbyView);
useGameStore.setState({snapshot:game});
(window as any).gameOverQA={getLeaves:()=>leaves,kind,expected:()=>({rows:finalRanking(game).map(r=>({name:r.player.nickname,place:`${r.place}º`,winner:r.winner,bankrupt:r.player.bankrupt,worth:r.player.bankrupt?'—':formatCredits(r.netWorth)})),prize:abandoned||stake===0?0:prizeShare(stake,count,game.winnerIds.length),byClock:endedByClock(game),myId})};
createRoot(document.getElementById('root')!).render(<main className="go-preview-stage"><GameOverScreen myId={myId} token="preview-only" gameId={game.gameId} onLeave={()=>{leaves++;}}/></main>);
