import { useId } from 'react';
import type { EventCard } from '@imperio/shared-types';
import './eventCards.css';

const MOTIFS: Record<string, string> = {
  'festa-junina':'festival', 'safra-recorde':'wheat', restituicao:'coin', 'premio-turismo':'medal',
  'multa-transito':'sign', oficina:'tool', churrasco:'grill', 'reforma-urbana':'city', aniversario:'gift',
  'volta-ao-inicio':'home', 'voo-sao-paulo':'plane', 'tocha-olimpica':'torch', 'convite-brasilia':'palace',
  'estrada-interditada':'barrier', carona:'car', 'feriado-prolongado':'palm',
};

function Motif({ name }: { name: string }) {
  switch (name) {
    case 'festival': return <><path d="M16 22Q50 40 84 22M20 24l5 16 10-10M42 30l8 15 8-15M65 30l10 10 5-16"/><path d="m30 77 20-25 20 25M25 80h50M36 63l28 15M64 63 36 78"/></>;
    case 'wheat': return <><path d="M50 83V20M50 39Q24 38 30 22q20 1 20 17ZM50 56Q24 55 30 40q20 0 20 16ZM50 73Q24 72 30 57q20 1 20 16ZM50 45q26-1 20-17-20 1-20 17ZM50 63q26-1 20-17-20 1-20 17Z"/></>;
    case 'coin': return <><circle cx="50" cy="50" r="29"/><path d="M50 28v44m12-34c-18-14-36 10-12 12s6 27-12 12"/></>;
    case 'medal': return <><path d="m32 17 18 30 18-30M25 17h15l10 20 10-20h15"/><circle cx="50" cy="62" r="23"/><path d="m50 47 4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1Z"/></>;
    case 'sign': return <><path d="M50 21 81 76H19Z"/><path d="M50 40v16m0 9v1"/></>;
    case 'tool': return <><path d="M65 17a21 21 0 0 0-23 28L20 67a9 9 0 0 0 13 13l23-23a21 21 0 0 0 27-24L69 46 55 32Z"/><circle cx="28" cy="72" r="2"/></>;
    case 'grill': return <><path d="M23 48h54a27 24 0 0 1-54 0Zm7 0h40M39 69l-8 16m30-16 8 16M35 34q-8-8 0-16m15 16q-8-8 0-16m15 16q-8-8 0-16"/></>;
    case 'city': return <><path d="M18 83V43h23V20h24v25h17v38ZM43 83V47M51 30h5m-5 10h5m-5 10h5m-5 10h5M26 53h6m-6 10h6m-6 10h6m42-18h2m-2 10h2M50 83V72h9v11"/></>;
    case 'gift': return <><path d="M22 43h56v38H22Zm-4-14h64v14H18Zm32 0v52M50 29c-36-1-20-26-8-12l8 12c36-1 20-26 8-12Z"/></>;
    case 'home': return <><path d="m17 45 33-28 33 28M26 41v41h48V41M43 82V59h14v23M34 48h4m24 0h4"/></>;
    case 'plane': return <><path d="m14 56 28-7 13-28q4-9 10-6l-6 32 22 18-2 7-25-9-8 16-10 4 3-23-22 5Z"/></>;
    case 'torch': return <><path d="M52 14c-1 18-24 17-22 34 3 18 36 18 40-1 2-11-11-17-10-27-6 5-5 12-8 17M30 65h40l-8 9H38Zm9 9 5 15h12l5-15"/></>;
    case 'palace': return <><path d="M17 38h66M23 38v37m14-37v37m26-37v37m14-37v37M17 76h66M12 84h76M18 28h64L50 16Z"/></>;
    case 'barrier': return <><path d="M15 38h70v22H15Zm9 22v23m52-23v23M17 57l18-18m0 21 21-21m0 21 21-21"/></>;
    case 'car': return <><path d="m25 41 8-20h34l8 20M18 45q32-9 64 0v27H18ZM28 53h8m28 0h8M25 72v8m50-8v8M42 63h16"/></>;
    case 'palm': return <><path d="M47 83q13-27 5-48M52 36Q30 7 15 32q22-7 37 4ZM52 36Q77 8 87 35q-23-9-35 1ZM52 36Q30 30 24 54q17-13 28-18ZM52 36q22-4 28 18Q62 42 52 36ZM24 85h52"/></>;
    default: return <><path d="M37 34c0-20 34-20 30 0-2 10-17 10-17 24m0 13v2"/><circle cx="50" cy="50" r="35"/></>;
  }
}

export function EventIllustration({ cardId }: { cardId: string }) {
  const id = useId();
  return <svg viewBox="0 0 180 128" fill="none" aria-hidden="true" className="iu-event-card__illustration">
    <defs><radialGradient id={id}><stop stopColor="#7461ad"/><stop offset="1" stopColor="#292341"/></radialGradient></defs>
    <rect x="1" y="1" width="178" height="126" rx="18" fill={`url(#${id})`} stroke="#ad94d8" strokeOpacity=".35"/>
    <circle cx="90" cy="64" r="48" stroke="#edcb89" strokeOpacity=".25"/>
    <path d="m18 28 3 6 6 3-6 3-3 6-3-6-6-3 6-3Zm142 64 3 5 5 3-5 3-3 5-3-5-5-3 5-3Z" fill="#e1bc74"/>
    <g transform="translate(40 14)" stroke="#ffe4a6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><Motif name={MOTIFS[cardId] ?? 'unknown'}/></g>
  </svg>;
}

/** Frente sem efeito de jogo, estado de rede, temporizador ou ação de fechamento. */
export function EventCardVisual({ card, who }: { card: EventCard; who?: string }) {
  return <article className="iu-event-card">
    <header><span>EVENTO</span><span className="iu-event-card__spark" aria-hidden="true">✦</span><span>EDIÇÃO BRASIL</span></header>
    <EventIllustration cardId={card.id}/>
    {who && <p className="iu-event-card__who">{who}</p>}
    <h3>{card.title}</h3><p className="iu-event-card__text">{card.text}</p>
    <footer aria-hidden="true"><span/>IMPÉRIO URBANO<span/></footer>
  </article>;
}
