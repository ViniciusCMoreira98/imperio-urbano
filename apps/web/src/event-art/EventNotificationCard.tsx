import events from './events.json';
import assalto from './art/assalto-v1.webp';
import viral from './art/caramelo-viral-v1.webp';
import incendio from './art/incendio-v1.webp';
import visita from './art/visita-olimpica-v1.webp';
import sede from './art/escolha-sede-v1.webp';
import apagao from './art/apagao-v1.webp';
import './event-brasil-v5.css';

const images: Record<string, string> = { assalto, 'caramelo-viral': viral, incendio, 'visita-olimpica': visita, 'escolha-sede': sede, apagao };

/** Arte passiva: sem diálogo, foco, callbacks, comandos, seleção ou temporizador. */
export function EventNotificationCard({ eventId }: { eventId: string }) {
  const event = events.find(item => item.id === eventId);
  if (!event) return null;
  return <article className="sc-card" role="status" aria-live="polite" aria-atomic="true" data-event={event.id} data-tone={event.tone}>
    <h2>{event.cardTitle}</h2>
    <img src={images[event.id]} alt="" aria-hidden="true" draggable={false}/>
    <p>{event.cardText}</p>
  </article>;
}
