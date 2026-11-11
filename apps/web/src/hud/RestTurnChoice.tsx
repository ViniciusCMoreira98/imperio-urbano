import {useEffect, useRef, useState} from 'react';
import {shouldOfferRestChoice} from '../game/restChoice';
import passArt from '../event-art/art/passe-livre-v1.webp';
import {useGameStore} from '../store/gameStore';
import {useShownTurnPlayerId} from '../store/shownTurn';
import {useTableBusy} from '../store/tableBusy';
import {useViewStore} from '../store/viewStore';
import {Countdown} from './ActionBar';
import './restTurnChoice.css';

export function RestTurnChoice({myId}:{myId:string}){
 const snapshot=useGameStore(s=>s.snapshot);
 const shownTurn=useShownTurnPlayerId();
 const busy=useTableBusy();
 if(!snapshot||busy||shownTurn!==myId||!shouldOfferRestChoice(snapshot,myId))return null;
 const me=snapshot.players.find(p=>p.id===myId)!;
 return <RestChoiceDialog key={`${snapshot.gameId}:${snapshot.round}:${myId}`} passes={me.restPasses??0} turns={me.skipTurns}/>;
}

function RestChoiceDialog({passes,turns}:{passes:number;turns:number}){
 const send=useGameStore(s=>s.send);
 const offline=useGameStore(s=>s.connection!=='open');
 const rejection=useGameStore(s=>s.rejection);
 const resync=useGameStore(s=>s.resync);
 const deadline=useGameStore(s=>s.turnDeadline);
 const [pending,setPending]=useState(false);
 const lock=useRef(false);
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{if(rejection){lock.current=false;setPending(false);}},[rejection]);
 useEffect(()=>{lock.current=false;setPending(false);},[resync]);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  useViewStore.getState().clearSelection();
  const frame=requestAnimationFrame(()=>{const el=dialog.current;((el?.querySelector('button:not(:disabled)') as HTMLElement|null)??el)?.focus();});
  const buttons=()=>Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]);
  const onKey=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const items=buttons(),first=items[0],last=items[items.length-1];
   if(!first){event.preventDefault();dialog.current?.focus();}
   else if(!dialog.current?.contains(document.activeElement)){event.preventDefault();first.focus();}
   else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  const onFocus=(event:FocusEvent)=>{if(!dialog.current?.contains(event.target as Node))((buttons()[0] as HTMLElement|undefined)??dialog.current)?.focus();};
  document.addEventListener('keydown',onKey);document.addEventListener('focusin',onFocus);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',onKey);document.removeEventListener('focusin',onFocus);if(previous?.isConnected)previous.focus();};
 },[]);
 const act=(type:'USE_REST_PASS'|'ROLL_DICE')=>{
  if(lock.current||offline||(type==='USE_REST_PASS'&&passes<1))return;
  lock.current=true;setPending(true);useGameStore.getState().clearRejection();
  if(!send({type})){lock.current=false;setPending(false);}
 };
 return <div className="rest-turn-layer">
  <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="rest-turn-title" aria-describedby="rest-turn-description" aria-busy={pending} className="rest-turn-dialog">
   <header><img src={passArt} alt=""/><h2 id="rest-turn-title">Sua vez no Descanso</h2></header>
   <p id="rest-turn-description" role={offline||pending||rejection?'status':undefined}>{offline?'Reconectando…':pending?'Aguardando resposta…':rejection??'Escolha como sair do Descanso.'}</p>
   <div className="rest-turn-options">
    <button type="button" disabled={offline||pending||passes<1} onClick={()=>act('USE_REST_PASS')}><strong>Utilizar carta</strong><small>{passes>0?`Passe Livre: ${passes}`:'Sem Passe Livre'}</small></button>
    <button type="button" disabled={offline||pending} onClick={()=>act('ROLL_DICE')}><strong>Rolar dados</strong><small>Dupla libera você</small></button>
   </div>
   <footer><span>{turns===1?'Falta 1 jogada':`Faltam ${turns} jogadas`}</span>{deadline!==null&&<Countdown deadline={deadline} warn/>}</footer>
  </section>
 </div>;
}
