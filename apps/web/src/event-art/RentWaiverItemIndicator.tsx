import image from './art/aluguel-zero-v1.webp';
import './rest-exit-item.css';

/** Somente apresenta a quantidade oficial; a primeira chegada adversária ativa o item no servidor. */
export function RentWaiverItemIndicator({quantity}:{quantity:number}){
 if(quantity<=0)return null;
 return <div className="rest-pass-item rent-waiver-item" role="status" aria-label={`Aluguel Zero: ${quantity}. Uso automático na próxima propriedade adversária.`}>
  <img src={image} alt=""/><span className="rest-pass-copy"><strong>Aluguel Zero</strong><span>Próximo aluguel adversário</span></span><span className="rest-pass-count" aria-label={`${quantity} unidades`}>×{quantity}</span><span className="rest-pass-action">Automático · uso único</span>
 </div>;
}
