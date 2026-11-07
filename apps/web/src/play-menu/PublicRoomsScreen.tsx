import type {GameMode} from '@imperio/shared-types';
import playersIcon from '../main-menu/art/players-v1.svg';
import {PlayerMenuCard,type PlayerMenuCardProps} from './MenuCards';
import globe from './art/globe-v1.svg';
import back from './art/back-v1.svg';
import './public-rooms.css';

/** Lista pública fornecida pelo servidor; não incluir códigos privados neste contrato. */
export interface PublicRoomCard {
 id:string;name:string;hostName:string;mode:GameMode;
 players:number;capacity:number;joinable:boolean;
}
export interface PublicRoomsProps {
 player:PlayerMenuCardProps;rooms:PublicRoomCard[];
 onBack:()=>void;onRefresh:()=>void;onJoin:(roomId:string)=>void;
 loading?:boolean;joiningId?:string|null;error?:string;
}
/** Apresentação controlada. O servidor decide visibilidade, vagas e entrada atômica. */
export function PublicRoomsScreen({player,rooms,onBack,onRefresh,onJoin,loading=false,joiningId=null,error}:PublicRoomsProps){
 return <main className="pm-screen pr-screen">
  <header className="pm-topbar"><PlayerMenuCard {...player}/><button className="pm-back" type="button" onClick={onBack}><img src={back} alt=""/>Voltar</button></header>
  <section className="pm-shell pr-shell" aria-labelledby="pr-title" aria-busy={loading}>
   <header className="pm-heading pr-heading"><img className="pm-channel-icon" src={globe} alt=""/><div><span className="pm-channel">JOGAR ONLINE</span><h1 id="pr-title">Salas públicas</h1><p>Escolha uma sala e entre na turma.</p></div><button className="pr-refresh" type="button" disabled={loading||!!joiningId} onClick={onRefresh}>{loading?'Atualizando…':'Atualizar salas'}</button></header>
   {error&&<p role="alert" className="pm-error">{error}</p>}
   <div className="pr-list" aria-label="Salas públicas disponíveis">
    {loading?<p className="pr-message" role="status">Buscando salas públicas…</p>:rooms.length===0?<div className="pr-message"><h2>Nenhuma sala pública agora</h2><p>Atualize a lista ou volte para criar uma sala.</p></div>:rooms.map(room=>{
     const full=room.players>=room.capacity,available=room.joinable&&!full;
     return <article className="pr-room" key={room.id} aria-label={room.name}>
      <div className="pr-room-icon" aria-hidden="true"><img src={playersIcon} alt=""/></div>
      <div className="pr-room-name"><h2 title={room.name}>{room.name}</h2><p title={room.hostName}>Anfitrião: {room.hostName}</p></div>
      <span className="pr-mode">{room.mode==='CLASSIC'?'Clássico':'Rápido'}</span>
      <div className="pr-capacity"><strong>{room.players}/{room.capacity}</strong><span>{full?'Lotada':available?'Com vagas':'Indisponível'}</span></div>
      <button className="pr-enter" type="button" disabled={loading||!!joiningId||!available} onClick={()=>onJoin(room.id)} aria-label={`Entrar na sala ${room.name}`}>{joiningId===room.id?'Entrando…':full?'Lotada':available?'Entrar':'Indisponível'}</button>
     </article>;
    })}
   </div>
   <p className="pr-note">As vagas podem mudar enquanto você escolhe.</p>
  </section>
 </main>;
}
