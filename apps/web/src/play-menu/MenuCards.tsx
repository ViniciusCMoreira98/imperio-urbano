import type{ReactNode}from'react';
import coin from '../main-menu/art/coin-v1.svg';
import diamond from '../main-menu/art/diamond-v1.svg';
import plus from '../main-menu/art/plus-v1.svg';
import crown from '../main-menu/art/crown-v1.svg';
import './play-menu.css';
import './character-picker.css';

/** `wins`: partidas vencidas, contadas pelo servidor; `onEditCharacter`: o retrato vira botão "Trocar" (engenharia, 07/11/2026). */
export interface PlayerMenuCardProps{nickname:string;portrait:ReactNode;level?:number;experience?:{current:number;target:number};wins?:number;onEditCharacter?:()=>void}
export const winsLabel=(wins:number)=>`${wins.toLocaleString('pt-BR')} ${wins===1?'vitória':'vitórias'}`;
export function PlayerMenuCard({nickname,portrait,level,experience,wins,onEditCharacter}:PlayerMenuCardProps){
 const xp=experience&&experience.target>0?experience:undefined;
 return <section className="pm-player-card" aria-label={`Jogador: ${nickname}${wins!==undefined?`, ${winsLabel(wins)}`:''}`}>{onEditCharacter?<button type="button" className="pm-player-portrait pm-player-edit" onClick={onEditCharacter} aria-label="Trocar personagem" title="Trocar personagem">{portrait}<span className="pm-player-edit-badge" aria-hidden="true">✏️ Trocar</span></button>:<span className="pm-player-portrait">{portrait}</span>}<div className="pm-player-data"><div className="pm-player-head"><strong title={nickname}>{nickname}</strong>{wins!==undefined&&<span className="pm-player-wins" title={winsLabel(wins)}><span aria-hidden="true">🏆</span>{wins.toLocaleString('pt-BR')}</span>}</div>{level!==undefined&&<span className="pm-player-level"><img src={crown} alt=""/>Nível {level}</span>}{xp&&<div className="pm-xp" role="progressbar" aria-label="Experiência" aria-valuemin={0} aria-valuemax={xp.target} aria-valuenow={Math.max(0,Math.min(xp.current,xp.target))}><i style={{width:`${Math.max(0,Math.min(100,xp.current/xp.target*100))}%`}}/><span>{xp.current.toLocaleString('pt-BR')} / {xp.target.toLocaleString('pt-BR')}</span></div>}</div></section>;
}
export interface CurrencyMenuCardProps{kind:'coins'|'diamonds';balance:number;onAdd?:()=>void}
export function CurrencyMenuCard({kind,balance,onAdd}:CurrencyMenuCardProps){const label=kind==='coins'?'Moedas':'Diamantes';return <section className={`pm-currency-card pm-${kind}${onAdd?'':' pm-currency-readonly'}${balance.toLocaleString('pt-BR').length>7?' pm-currency-long':''}`} aria-label={`${label}: ${balance.toLocaleString('pt-BR')}`}><img className="pm-currency-icon" src={kind==='coins'?coin:diamond} alt=""/><strong>{balance.toLocaleString('pt-BR')}</strong>{onAdd&&<button type="button" onClick={onAdd} aria-label={`Adicionar ${label.toLowerCase()}`}><img src={plus} alt=""/></button>}</section>;}
