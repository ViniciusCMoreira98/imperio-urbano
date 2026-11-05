import type {CSSProperties, ReactNode} from 'react';
import rentUrl from './art/rent-plaque-v1.png';
import playerUrl from './art/player-frame-v1.png';
import dockUrl from './art/action-dock-v1.png';
import assets from './art/assets.json';
import positions from './rentPlacements.json';
import './tabletop-ui.css';

const urls={'rent-plaque':rentUrl,'player-frame':playerUrl,'action-dock':dockUrl};
/** PNG original intacto; a janela retira apenas a margem transparente na apresentação. */
function Surface({asset}:{asset:keyof typeof urls}){
 const spec=assets.assets[asset];
 return <svg className="tabletop-surface" viewBox={spec.viewBox.join(' ')} preserveAspectRatio="none" aria-hidden="true" focusable="false"><image href={urls[asset]} width={spec.width} height={spec.height}/></svg>;
}

export interface RentLabel {stateId:string;stateName:string;rentLabel:string;kind:'base'|'current'}
/** Recebe o valor já formatado; não calcula regras, valores ou multiplicadores. */
export function RentPlaque({stateName,rentLabel,kind='current'}:Omit<RentLabel,'stateId'>){
 const label=`${stateName}: aluguel ${kind==='base'?'base':'atual'} ${rentLabel}`;
 return <span className="rent-plaque" role="img" aria-label={label} title={label}><Surface asset="rent-plaque"/><span className="rent-plaque__value" aria-hidden="true">{rentLabel}</span></span>;
}

/** Camada de apresentação sobre a composição nativa 3:2; não captura cliques. */
export function StateRentOverlay({labels}:{labels:RentLabel[]}){
 const byId=new Map(labels.map(item=>[item.stateId,item]));
 return <div className="state-rent-overlay" data-rent-overlay>
  {positions.placements.map(rect=>{
   const label=byId.get(rect.stateId);if(!label)return null;
   const style:CSSProperties={left:`${rect.x/positions.reference.width*100}%`,top:`${rect.y/positions.reference.height*100}%`,width:`${rect.width/positions.reference.width*100}%`,height:`${rect.height/positions.reference.height*100}%`,fontSize:`${rect.height*.62/positions.reference.width*100}cqw`};
   return <div key={rect.stateId} className="state-rent-overlay__item" data-rent-state={rect.stateId} style={style}><RentPlaque {...label}/></div>;
  })}
 </div>;
}

export function PlayerNameplate({name,balanceLabel,portrait,active=false}:{name:string;balanceLabel:string;portrait:ReactNode;active?:boolean}){
 return <div className="tabletop-player" data-active={active}><Surface asset="player-frame"/><div className="tabletop-player__portrait">{portrait}</div><div className="tabletop-player__text"><strong>{name}</strong><span>{balanceLabel}</span></div></div>;
}

/** Só a base e encaixe; botões, tempo, dados e comandos pertencem ao host. */
export function ActionDock({children,roundLabel}:{children:ReactNode;roundLabel?:string}){
 return <div className="tabletop-action"><Surface asset="action-dock"/>{roundLabel&&<span className="tabletop-action__round">{roundLabel}</span>}<div className="tabletop-action__content">{children}</div></div>;
}
