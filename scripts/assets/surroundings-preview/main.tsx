import React from 'react';
import {createRoot} from 'react-dom/client';
import {board} from '@imperio/game-data';
import {GameBoard} from '../../../apps/web/src/board/GameBoard';
import {BoardSurroundings} from '../../../apps/web/src/board/surroundings/BoardSurroundings';
import {PlayersPanel} from '../../../apps/web/src/hud/PlayersPanel';
import {PropertyPanel} from '../../../apps/web/src/hud/PropertyPanel';
import {EventLog} from '../../../apps/web/src/hud/EventLog';
import {ActionBar} from '../../../apps/web/src/hud/ActionBar';
import {TurnBadge} from '../../../apps/web/src/hud/TurnBadge';
import {useGameStore} from '../../../apps/web/src/store/gameStore';
import {useAppStore} from '../../../apps/web/src/store/appStore';
import {useViewStore} from '../../../apps/web/src/store/viewStore';
import '../../../apps/web/src/index.css';
import './preview.css';

// Prévia isolada da arte: componentes reais, snapshot sintético, sem backend.
const players=['ROXO','AZUL','VERDE','VERMELHO'].map((pawnColor,i)=>({id:`visual-${i+1}`,nickname:i===0?'Vinícius':`Jogador ${i+1}`,avatarId:`avatar-${i+1}`,pawnColor,credits:1250,position:[1,9,18,27][i],seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false}));
const snapshot={gameId:'surroundings-preview',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:1,round:3,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],players,properties:board.tiles.filter(t=>t.type==='PROPERTY').map(t=>({stateId:t.stateId,ownerId:null,buildingLevel:0,ownerVisits:0,levelReachedAtVisit:0})),olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},pendingDebt:null,winnerIds:[],turnTimeLeftMs:300000};
useAppStore.setState({session:{playerId:'visual-1',nickname:'Vinícius',token:'visual-fixture'},gameId:'surroundings-preview',screen:'game'});
useGameStore.getState().receive({kind:'SNAPSHOT',snapshot} as any);
useGameStore.getState().setConnection('open');
const commands:unknown[]=[];useGameStore.getState().setSender(command=>{commands.push(command);return true;});
useViewStore.getState().selectTile(board.tiles.findIndex(t=>t.id==='ES'));
(window as any).surroundingsQA={game:useGameStore,view:useViewStore,commands};
function Preview(){return <BoardSurroundings
 top={<div className="game-hud-players surroundings-preview__players"><PlayersPanel myId="visual-1"/></div>}
 side={<><PropertyPanel myId="visual-1"/><EventLog/></>}
 bottom={<><TurnBadge myId="visual-1"/><ActionBar myId="visual-1"/></>}
><GameBoard/></BoardSurroundings>;}
createRoot(document.getElementById('root')!).render(<Preview/>);
