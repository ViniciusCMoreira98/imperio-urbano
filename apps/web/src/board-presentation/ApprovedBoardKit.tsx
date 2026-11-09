import type{CSSProperties,ReactNode}from'react';
import type{AvatarId}from'@imperio/shared-types';
import{PlayerPortrait}from'../hud/AvatarPortrait';
import dice from'../main-menu/art/dice-v1.webp';
import players from'../main-menu/art/players-v1.svg';
import book from'../main-menu/art/book-v1.svg';
import cards from'./art/cards-control-v1.svg';
import './approved-board-kit.css';
import specialCrops from './art/special-icon-crops.json';
const art=import.meta.glob('./art/*.svg',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const pictures=import.meta.glob('../board/board34/art/v3/*.png',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const asset=(name:string)=>art[`./art/${name}-v1.svg`];
export function approvedStateArtwork(id:string){const path=`../board/board34/art/v3/${id.toLowerCase()}-board-v3.png`;if(!pictures[path])throw new Error(`Ilustração ausente para ${id}`);return pictures[path]}
type Orientation='portrait'|'landscape'|'landscape-edge';
export interface ApprovedPropertyCardProps{stateId:string;name:string;rentLabel:string|null;orientation?:Orientation;ownerColor?:string;selected?:boolean;onSelect?:()=>void}
/** Presentation only: the host supplies the official price and selection action. */
export function ApprovedPropertyCard({stateId,name,rentLabel,orientation='portrait',ownerColor,selected=false,onSelect}:ApprovedPropertyCardProps){
 return <button type="button" className="approved-property" data-orientation={orientation} data-state-id={stateId} data-selected={selected||undefined} style={{'--property-owner':ownerColor??'transparent'}as CSSProperties} onClick={onSelect} aria-label={`${name}; aluguel ${rentLabel??'indisponível'}`} aria-pressed={selected}>
  <img className="approved-property-picture" src={approvedStateArtwork(stateId)} alt="" draggable={false}/>
  <img className="approved-property-name-plate" src={asset(`property-name-${orientation}`)} alt="" draggable={false}/>
  <img className="approved-property-rent-plate" src={asset(`rent-strip-${orientation}`)} alt="" draggable={false}/>
  <span className="approved-property-name"><b>{stateId}</b>{orientation!=='portrait'&&<span>{name}</span>}</span>
  <output aria-live="off" className="approved-property-rent" data-long={!!rentLabel&&rentLabel.length>12||undefined}>{rentLabel??'—'}</output>
  <img className="approved-property-frame" src={asset(`property-frame-${orientation}`)} alt="" draggable={false}/>
 </button>;
}
const specials={start:{title:'Início',icon:'arrow',theme:'emerald'},olympics:{title:'Olimpíadas',icon:'flame',theme:'navy'},rest:{title:'Descanso',icon:'rest',theme:'navy'},airport:{title:'Aeroporto',icon:'airport',theme:'navy'},event:{title:'Evento',icon:'event',theme:'gold'},tax:{title:'Taxa',icon:'tax',theme:'gold'},withdraw:{title:'Saque',icon:'chest',theme:'emerald'}}as const;
export type ApprovedSpecialKind=keyof typeof specials;
export function ApprovedSpecialCard({kind,amountLabel,onSelect,orientation='square'}:{kind:ApprovedSpecialKind;amountLabel?:string;onSelect?:()=>void;orientation?:'square'|'portrait'|'wide'|'edge'}){
 const item=specials[kind],crop=specialCrops[item.icon];return <button type="button" className="approved-special" data-theme={item.theme} data-orientation={orientation} data-with-amount={!!amountLabel||undefined} onClick={onSelect} aria-label={`${item.title}${amountLabel?`; acumulado ${amountLabel}`:''}`}>
  <img className="approved-special-frame" src={asset(`special-frame-${item.theme}${orientation==='square'?'':'-'+orientation}`)} alt=""/>
  <svg className="approved-special-icon" viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image href={pictures[`../board/board34/art/v3/${item.icon}-v3.png`]} width={crop.sourceWidth} height={crop.sourceHeight}/></svg>
  <b className="approved-special-title" data-long={item.title.length>8||undefined}>{item.title}</b>
  {amountLabel&&<span className="approved-special-amount"><small>Acumulado</small><output aria-live="off">{amountLabel}</output></span>}
 </button>;
}
export function ApprovedRollButton({onClick,disabled=false,label='Rolar dados'}:{onClick?:()=>void;disabled?:boolean;label?:string}){
 return <button type="button" className="approved-roll" onClick={onClick} disabled={disabled}><img className="approved-roll-frame" src={asset('roll-button')} alt=""/><span><img src={dice} alt=""/><b>{label}</b></span></button>;
}
export function ApprovedPlayerCard({nickname,balanceLabel,avatarId,photoUrl}:{nickname:string;balanceLabel:string;avatarId:AvatarId;photoUrl?:string|null}){
 return <article className="approved-player" aria-label={`${nickname}; saldo ${balanceLabel}`}>
  <img className="approved-player-frame" src={asset('player-card')} alt=""/>
  <span className="approved-player-portrait"><PlayerPortrait avatarId={avatarId} photoUrl={photoUrl}/></span>
  <b className="approved-player-name" title={nickname}>{nickname}</b>
  <span className="approved-player-balance"><img src={asset('credit-notes')} alt=""/><strong>{balanceLabel}</strong></span>
 </article>;
}
const controls={settings:asset('control-gear'),players,history:book,cards,sound:asset('control-sound')};
export function ApprovedRoundControl({kind,label,onClick,badge}:{kind:keyof typeof controls;label:string;onClick?:()=>void;badge?:ReactNode}){
 return <button type="button" className="approved-round-control" onClick={onClick} aria-label={label}><img className="approved-round-control-frame" src={asset('round-control')} alt=""/><img className="approved-round-control-icon" src={controls[kind]} alt=""/>{badge!==undefined&&<span className="approved-round-control-badge">{badge}</span>}</button>;
}
