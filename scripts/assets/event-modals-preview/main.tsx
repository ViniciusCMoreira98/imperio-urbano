import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {EventNotificationCard} from '../../../apps/web/src/event-art/EventNotificationCard';
import {RestExitItemButton} from '../../../apps/web/src/event-art/RestExitItemButton';
import {RentWaiverItemIndicator} from '../../../apps/web/src/event-art/RentWaiverItemIndicator';
import events from '../../../apps/web/src/event-art/events.json';

function Preview() {
  const params=new URLSearchParams(location.search);
  const [eventId,setEventId]=useState<string|null>(params.get('event')??'assalto');
  const [boardClicks,setBoardClicks]=useState(0);
  const [quantity,setQuantity]=useState(1),[canUse,setCanUse]=useState(true),[pending,setPending]=useState(false),[uses,setUses]=useState(0);
  const gallery=params.has('gallery');
  (window as any).eventSimpleQA={events,show:(id:string)=>setEventId(id),hide:()=>setEventId(null),getBoardClicks:()=>boardClicks};
  (window as any).restItemQA={setQuantity,setCanUse,setPending,getUses:()=>uses};
  if(params.get('item')==='rent')return <main className="rest-item-preview"><h1>Seus itens</h1><RentWaiverItemIndicator quantity={quantity}/></main>;
  if(params.get('item')==='rest')return <main className="rest-item-preview"><h1>Seus itens</h1><RestExitItemButton quantity={quantity} canUse={canUse} pending={pending} onUse={()=>setUses(value=>value+1)}/></main>;
  if(gallery)return <main className="sc-gallery">{events.map(event=><EventNotificationCard key={event.id} eventId={event.id}/>)}</main>;
  return <main className="sc-board-preview" onClick={()=>setBoardClicks(value=>value+1)}>
    <img className="sc-board" src="/assets/3d/reviews/c8/connected-1280x720.png" alt="Captura do tabuleiro para demonstrar a posição da carta; seleção real pertence à integração"/>
    {eventId&&<div className="sc-event-layer"><EventNotificationCard eventId={eventId}/></div>}
  </main>;
}
createRoot(document.querySelector('#root')!).render(<Preview/>);
