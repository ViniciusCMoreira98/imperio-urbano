import {PlayerMenuCard,CurrencyMenuCard} from './MenuCards';
import type {PlayEntryProps} from './PlayEntryScreens';
import crown from '../main-menu/art/crown-v1.svg';
import globe from './art/globe-v1.svg';
import back from './art/back-v1.svg';
import logo from '../main-menu/art/logo-v1.webp';
import './online-menu.css';

export interface OnlineMenuProps extends Pick<PlayEntryProps,'player'|'wallet'|'onBack'> {
 onCreateRoom:()=>void;onPublicRooms:()=>void;onPrivateRooms:()=>void;
}
/** Três destinos controlados pelo host, sem criar salas ou buscar dados. */
export function OnlinePlayScreen({player,wallet,onBack,onCreateRoom,onPublicRooms,onPrivateRooms}:OnlineMenuProps){
 return <main className="pm-screen om-screen" data-channel="online">
  <header className="pm-topbar"><PlayerMenuCard {...player}/><div className="pm-wallets">{wallet?.coins!==undefined&&<CurrencyMenuCard kind="coins" balance={wallet.coins} onAdd={wallet.onAddCoins}/>} {wallet?.diamonds!==undefined&&<CurrencyMenuCard kind="diamonds" balance={wallet.diamonds} onAdd={wallet.onAddDiamonds}/>}</div><button className="pm-back" type="button" onClick={onBack}><img src={back} alt=""/>Menu</button></header>
  <section className="pm-shell" aria-labelledby="om-title">
   <header className="pm-heading"><img className="pm-channel-icon" src={globe} alt=""/><div><span className="pm-channel">MULTIPLAYER ONLINE</span><h1 id="om-title">Jogar Online</h1><p>Escolha como quer reunir a turma.</p></div><img className="pm-brand" src={logo} alt="Império Urbano — Edição Brasil"/></header>
   <nav className="om-options" aria-label="Opções de jogo online">
    <button className="om-choice om-create" type="button" onClick={onCreateRoom}><img src={crown} alt=""/><strong>Criar sala</strong><span>Prepare uma nova partida</span><i aria-hidden="true">→</i></button>
    <button className="om-choice om-public" type="button" onClick={onPublicRooms}><img src={globe} alt=""/><strong>Salas Públicas</strong><span>Encontre uma turma para jogar</span><i aria-hidden="true">→</i></button>
    <button className="om-choice om-private" type="button" onClick={onPrivateRooms}><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 28v-9a14 14 0 0 1 28 0v9" fill="none" stroke="#ffe48c" strokeWidth="6"/><rect x="10" y="26" width="44" height="34" rx="8" fill="#ffd45e"/><circle cx="32" cy="40" r="5" fill="#154773"/><path d="M32 43v7" stroke="#154773" strokeWidth="5" strokeLinecap="round"/></svg><strong>Salas Privadas</strong><span>Entre usando um código de convite</span><i aria-hidden="true">→</i></button>
   </nav>
  </section>
 </main>;
}
