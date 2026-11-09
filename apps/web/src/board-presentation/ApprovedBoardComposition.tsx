import{useLayoutEffect,useRef,useState,type CSSProperties}from'react';
import{board,states}from'@imperio/game-data';
import type{AvatarId}from'@imperio/shared-types';
import{ApprovedPropertyCard,ApprovedSpecialCard,ApprovedRollButton,ApprovedPlayerCard,ApprovedRoundControl,type ApprovedSpecialKind}from'./ApprovedBoardKit';
import{approvedCompositionCells,approvedCompositionFit,COMPOSITION}from'./approvedCompositionLayout';
import logo from'../main-menu/art/logo-v1.webp';
import dice from'../main-menu/art/dice-v1.webp';
import panorama from'./art/approved-center-panorama-v1.png';
import'./approved-board-composition.css';
export interface CompositionPlayer{id:string;nickname:string;balanceLabel:string;avatarId:AvatarId;photoUrl?:string|null}
export interface CompositionBuilding{stateId:string;level:number;spriteUrl:string;sourceModel:string;ownerColor?:string;width:number;height:number}
export interface ApprovedBoardCompositionProps{players:CompositionPlayer[];rentLabels:Record<string,string>;taxPoolLabel:string;buildings?:CompositionBuilding[];selectedId?:string|null;onSelect?:(id:string)=>void;onRoll?:()=>void;onControl?:(kind:'settings'|'players'|'history'|'cards')=>void;cardsCount?:number}
const cells=approvedCompositionCells(),byId=new Map<string,(typeof states)[number]>(states.map(s=>[s.id,s])),types:Record<string,ApprovedSpecialKind>={START:'start',OLYMPICS:'olympics',REST:'rest',NATIONAL_TRAVEL:'airport',EVENT:'event',TAX:'tax',SAQUE:'withdraw'};
function buildingPosition(building:CompositionBuilding){
 const cell=cells.find(c=>c.id===building.stateId)!;let x=cell.x+cell.width/2-building.width/2,y=cell.y;
 if(cell.side==='north')y=COMPOSITION.innerTop+8;
 if(cell.side==='south')y=COMPOSITION.innerTop+COMPOSITION.innerHeight-8-building.height;
 if(cell.side==='west'){x=COMPOSITION.innerLeft+8;y=cell.y+cell.height/2-building.height*.7;}
 if(cell.side==='east'){x=COMPOSITION.innerLeft+COMPOSITION.innerWidth-8-building.width;y=cell.y+cell.height/2-building.height*.7;}
 return{x,y};
}
/** Static composition for art review. Real values/actions can be supplied without changing the artwork. */
export function ApprovedBoardComposition({players,rentLabels,taxPoolLabel,buildings=[],selectedId,onSelect,onRoll,onControl,cardsCount=0}:ApprovedBoardCompositionProps){
 const ref=useRef<HTMLDivElement>(null),[fit,setFit]=useState(()=>approvedCompositionFit(1360,900));
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setFit(approvedCompositionFit(entry.contentRect.width,entry.contentRect.height)));observer.observe(el);return()=>observer.disconnect()},[]);
 const style={'--composition-scale':fit.scale,'--composition-player-width':`${fit.playerWidth}px`,'--composition-control-size':`${fit.controlSize}px`,'--composition-margin':`${fit.margin}px`}as CSSProperties;
 return <div ref={ref} className="approved-composition" style={style} aria-label="Composição visual do tabuleiro de 34 casas">
  <div className="approved-composition-board" style={{width:COMPOSITION.width,height:COMPOSITION.height}}>
   <div className="approved-composition-rim" aria-hidden="true"/>
   <div className="approved-composition-center" style={{left:COMPOSITION.innerLeft,top:COMPOSITION.innerTop,width:COMPOSITION.innerWidth,height:COMPOSITION.innerHeight}}>
    <img className="approved-composition-panorama" src={panorama} alt=""/>
    <img className="approved-composition-logo" src={logo} alt="Império Urbano — Edição Brasil"/>
    <img className="approved-composition-dice" src={dice} alt="Dois dados ilustrativos"/>
    <div className="approved-composition-roll"><ApprovedRollButton onClick={onRoll}/></div>
   </div>
   <div className="approved-composition-cells">{cells.map(cell=>{const tile=board.tiles[cell.index],state=tile.type==='PROPERTY'&&tile.stateId?byId.get(tile.stateId):null;return <div key={cell.id} className="approved-composition-cell" data-tile-id={cell.id} data-tile-index={cell.index} data-side={cell.side} style={{left:cell.x,top:cell.y,width:cell.width,height:cell.height}}>
    {state?<ApprovedPropertyCard stateId={state.id} name={state.name} orientation={cell.orientation} rentLabel={rentLabels[state.id]??null} ownerColor={buildings.find(b=>b.stateId===cell.id)?.ownerColor} selected={selectedId===cell.id} onSelect={()=>onSelect?.(cell.id)}/>:<ApprovedSpecialCard kind={types[tile.type]} orientation={cell.specialOrientation} amountLabel={tile.id==='TAX'?taxPoolLabel:undefined} onSelect={()=>onSelect?.(cell.id)}/>}
   </div>})}</div>
   <div className="approved-composition-buildings" aria-label="Construções atuais">{buildings.map(building=>{const{x,y}=buildingPosition(building);return <img key={building.stateId} src={building.spriteUrl} alt={`${building.level===0?'Terreno':building.level===5?'Hotel':'Casa '+building.level} em ${byId.get(building.stateId)?.name}`} data-building-state={building.stateId} data-model-source={building.sourceModel} data-building-level={building.level} style={{left:x,top:y,width:building.width,height:building.height}}/>})}</div>
  </div>
  <aside className="approved-composition-players" aria-label="Jogadores">{players.slice(0,4).map((player,index)=><div key={player.id} data-seat={index}><ApprovedPlayerCard nickname={player.nickname} avatarId={player.avatarId} photoUrl={player.photoUrl} balanceLabel={player.balanceLabel}/></div>)}</aside>
  <nav className="approved-composition-controls" aria-label="Controles da composição"><ApprovedRoundControl kind="settings" label="Configurações" onClick={()=>onControl?.('settings')}/><ApprovedRoundControl kind="players" label="Jogadores" onClick={()=>onControl?.('players')}/><ApprovedRoundControl kind="history" label="Histórico" onClick={()=>onControl?.('history')}/><ApprovedRoundControl kind="cards" label="Cartas guardadas" badge={cardsCount||undefined} onClick={()=>onControl?.('cards')}/></nav>
 </div>;
}
