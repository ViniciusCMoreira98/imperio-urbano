import './public-rooms.css';
import type{GameMode}from'@imperio/shared-types';
import{rules}from'@imperio/game-data';
import{AvatarPortrait}from'../hud/AvatarPortrait';
import{PlayerMenuCard,CurrencyMenuCard,type PlayerMenuCardProps}from'./MenuCards';
import logo from'../main-menu/art/logo-v1.webp';
import crown from'../main-menu/art/crown-v1.svg';
import players from'../main-menu/art/players-v1.svg';
import coin from'../main-menu/art/coin-v1.svg';
import{MODES,modeName,modeRule}from'../game/modes';
import watch from'./art/stopwatch-v1.svg';import wifi from'./art/wifi-v1.svg';import globe from'./art/globe-v1.svg';import back from'./art/back-v1.svg';

export interface PlayEntryProps{
 player:PlayerMenuCardProps;
 wallet?:{coins?:number;diamonds?:number;onAddCoins?:()=>void;onAddDiamonds?:()=>void};
 mode:GameMode;onModeChange:(mode:GameMode)=>void;
 inviteCode:string;onInviteCodeChange:(code:string)=>void;
 onCreate:()=>void;onJoin:()=>void;onBack:()=>void;onBrowseRooms?:()=>void;
 pending?:'create'|'join'|null;error?:string;
 /** Aposta da sala (engenharia, 07/11/2026): opções do catálogo; acima de `max` (saldo) fica desabilitada. */
 stake?:{options:number[];value:number;onChange:(stake:number)=>void;max?:number};
}
const stakeLabel=(v:number)=>v>=1000?`${(v/1000).toLocaleString('pt-BR')} mil`:v.toLocaleString('pt-BR');
/** Artwork and controlled inputs only. LAN routing and network requests belong to the host. */
function PlayEntryScreen({channel,player,wallet,mode,onModeChange,inviteCode,onInviteCodeChange,onCreate,onJoin,onBack,onBrowseRooms,pending,error,panel,stake}:PlayEntryProps&{channel:'lan'|'online';panel?:'create'|'private'}){
 const local=channel==='lan';
 return <main className={`pm-screen${panel?' pm-single':''}`} data-channel={channel}>
  <header className="pm-topbar"><PlayerMenuCard {...player}/><div className="pm-wallets">{wallet?.coins!==undefined&&<CurrencyMenuCard kind="coins" balance={wallet.coins} onAdd={wallet.onAddCoins}/>} {wallet?.diamonds!==undefined&&<CurrencyMenuCard kind="diamonds" balance={wallet.diamonds} onAdd={wallet.onAddDiamonds}/>}</div><button type="button" className="pm-back" onClick={onBack}><img src={back} alt=""/>{local?'Menu':'Voltar'}</button></header>
  <section className="pm-shell" aria-labelledby="pm-title">
   <header className="pm-heading"><img className="pm-channel-icon" src={local?wifi:globe} alt=""/><div><span className="pm-channel">{local?'REDE LOCAL':'MULTIPLAYER ONLINE'}</span><h1 id="pm-title">{local?'Jogar Agora':panel==='create'?'Criar sala online':panel==='private'?'Salas Privadas':'Jogar Online'}</h1><p>{local?'Reúna a turma na mesma rede Wi-Fi ou cabeada.':'Convide seus amigos, mesmo de longe.'}</p></div><img className="pm-brand" src={logo} alt="Império Urbano — Edição Brasil"/></header>
   <div className="pm-options">{panel!=='private'&&<section className="pm-create"><h2>{local?'Criar partida local':'Criar sala online'}</h2><p className="pm-description">Escolha o modo e prepare a mesa.</p><fieldset className="pm-modes"><legend>Modo da partida</legend>{MODES.map(value=><label className="pm-mode" key={value}><input type="radio" name="mode" value={value} checked={mode===value} disabled={!!pending} onChange={()=>onModeChange(value)} aria-label={modeName(value)}/><img src={value==='CLASSIC'?crown:watch} alt=""/><strong>{modeName(value)}</strong><small>{modeRule(value)}</small><span className="pm-mode-check" aria-hidden="true">✓</span></label>)}</fieldset>{stake&&<fieldset className="pm-stakes"><legend>Aposta</legend>{stake.options.map(value=><label className="pm-stake" key={value}><input type="radio" name="stake" value={value} checked={stake.value===value} disabled={!!pending||(stake.max!==undefined&&value>stake.max)} onChange={()=>stake.onChange(value)} aria-label={`Aposta de ${value.toLocaleString('pt-BR')} moedas`}/><img src={coin} alt=""/>{stakeLabel(value)}</label>)}</fieldset>}<div className="pm-capacity"><div className="pm-avatar-stack" aria-hidden="true"><AvatarPortrait avatarId="avatar-1"/><AvatarPortrait avatarId="avatar-3"/><AvatarPortrait avatarId="avatar-4"/></div><span>De {rules.players.min} a {rules.players.max} jogadores</span></div><button className="pm-primary" type="button" disabled={!!pending} onClick={onCreate}>{pending==='create'?'Criando…':local?'Criar partida local':'Criar sala online'}</button></section>}
   {panel!=='create'&&<section className={`pm-join${!local&&onBrowseRooms?' pm-has-public':''}`}><div className="pm-join-art" aria-hidden="true"><i/><img src={players} alt=""/><i/></div><h2>{local?'Entre na partida da turma':onBrowseRooms?'Encontre sua turma':'Já recebeu um convite?'}</h2><p className="pm-description">{local?'Peça o código para quem criou a partida.':onBrowseRooms?'Escolha uma sala pública ou use um convite.':'Digite o código compartilhado pelos seus amigos.'}</p>{!local&&onBrowseRooms&&<button className="pm-public-button" type="button" disabled={!!pending} onClick={onBrowseRooms}><img src={globe} alt=""/>Entrar em uma sala<span>Ver salas públicas</span></button>}<form onSubmit={event=>{event.preventDefault();if(inviteCode.length===6&&!pending)onJoin();}}><label className="pm-code-label" htmlFor="pm-code">Código {local?'da partida':'da sala'}</label><input id="pm-code" aria-label="Código do convite" className="pm-code" maxLength={6} value={inviteCode} disabled={!!pending} onChange={event=>onInviteCodeChange(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6))} placeholder="EX.: BR7K2P" autoComplete="off" spellCheck={false}/><button className="pm-secondary" type="submit" disabled={!!pending||inviteCode.length!==6}>{pending==='join'?'Entrando…':local?'Entrar na partida':'Entrar com código'}</button></form><p className="pm-network-note"><img src={local?wifi:globe} alt=""/>{local?'Todos precisam estar na mesma rede.':'Cada jogador pode estar em uma rede diferente.'}</p></section>}</div>
   {error&&<p className="pm-error" role="alert">{error}</p>}
  </section>
 </main>;
}
export function LocalPlayScreen(props:PlayEntryProps){return <PlayEntryScreen channel="lan" {...props}/>;}
export function CreateOnlineRoomScreen(props:PlayEntryProps){return <PlayEntryScreen {...props} channel="online" panel="create"/>;}
export function PrivateRoomsScreen(props:PlayEntryProps){return <PlayEntryScreen {...props} channel="online" panel="private"/>;}
export {OnlinePlayScreen} from './OnlineMenuScreen';

/** Compatibilidade com o host de produção atual: criação/convite e apostas preservados. */
export function OnlineRoomEntryScreen(props:PlayEntryProps){return <PlayEntryScreen {...props} channel="online"/>;}
