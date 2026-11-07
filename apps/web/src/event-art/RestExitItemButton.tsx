import image from './art/passe-livre-v1.webp';
import './rest-exit-item.css';

export interface RestExitItemProps {
 quantity:number;
 /** Elegibilidade recebida do host: turno, fase e Descanso oficiais. */
 canUse:boolean;
 pending?:boolean;
 onUse:()=>void;
}
/** Item guardado separado da carta passiva. Não altera inventário ou estado da partida. */
export function RestExitItemButton({quantity,canUse,pending=false,onUse}:RestExitItemProps){
 if(quantity<=0)return null;
 return <button type="button" className="rest-pass-item" disabled={!canUse||pending} onClick={onUse} aria-label={`Usar Passe Livre (${quantity})`} title={canUse?'Sair do Descanso sem perder a vez':'Use no seu turno, enquanto estiver no Descanso'}>
  <img src={image} alt=""/><span className="rest-pass-copy"><strong>Passe Livre</strong><span>Sair do Descanso</span></span><span className="rest-pass-count" aria-label={`${quantity} unidades`}>×{quantity}</span><span className="rest-pass-action">{pending?'Usando…':'Usar'}</span>
 </button>;
}
