import type{ReactNode}from'react';
import coin from '../main-menu/art/coin-v1.svg';
import diamond from '../main-menu/art/diamond-v1.svg';
import plus from '../main-menu/art/plus-v1.svg';
import crown from '../main-menu/art/crown-v1.svg';
import './play-menu.css';

export interface PlayerMenuCardProps{nickname:string;portrait:ReactNode;level?:number;experience?:{current:number;target:number}}
export function PlayerMenuCard({nickname,portrait,level,experience}:PlayerMenuCardProps){
 const xp=experience&&experience.target>0?experience:undefined;
 return <section className="pm-player-card" aria-label={`Jogador: ${nickname}`}><span className="pm-player-portrait">{portrait}</span><div className="pm-player-data"><strong title={nickname}>{nickname}</strong>{level!==undefined&&<span className="pm-player-level"><img src={crown} alt=""/>Nível {level}</span>}{xp&&<div className="pm-xp" role="progressbar" aria-label="Experiência" aria-valuemin={0} aria-valuemax={xp.target} aria-valuenow={Math.max(0,Math.min(xp.current,xp.target))}><i style={{width:`${Math.max(0,Math.min(100,xp.current/xp.target*100))}%`}}/><span>{xp.current.toLocaleString('pt-BR')} / {xp.target.toLocaleString('pt-BR')}</span></div>}</div></section>;
}
export interface CurrencyMenuCardProps{kind:'coins'|'diamonds';balance:number;onAdd?:()=>void}
export function CurrencyMenuCard({kind,balance,onAdd}:CurrencyMenuCardProps){const label=kind==='coins'?'Moedas':'Diamantes';return <section className={`pm-currency-card pm-${kind}${onAdd?'':' pm-currency-readonly'}${balance.toLocaleString('pt-BR').length>7?' pm-currency-long':''}`} aria-label={`${label}: ${balance.toLocaleString('pt-BR')}`}><img className="pm-currency-icon" src={kind==='coins'?coin:diamond} alt=""/><strong>{balance.toLocaleString('pt-BR')}</strong>{onAdd&&<button type="button" onClick={onAdd} aria-label={`Adicionar ${label.toLowerCase()}`}><img src={plus} alt=""/></button>}</section>;}
