import saqueUrl from './art/saque-tile-v1.png';
import taxUrl from './art/tax-pool-marker-v1.png';
import './special-tiles.css';

/** Arte de apresentação; a regra de saque e o dinheiro pertencem ao servidor. */
export function SaqueTileArtwork(){
 return <div className="saque-artwork" role="img" aria-label="Saque: receba o fundo acumulado das taxas"><img src={saqueUrl} alt=""/><strong aria-hidden="true">SAQUE</strong></div>;
}

/** Recebe o total já formatado. Não acumula, distribui nem reinicia valores localmente. */
export function TaxPoolMarker({collectedLabel}:{collectedLabel:string}){
 return <div className="tax-pool-marker" role="img" aria-label={`Fundo acumulado da Taxa: ${collectedLabel}`}><img src={taxUrl} alt=""/><div className="tax-pool-marker__text" aria-hidden="true"><span>ACUMULADO</span><strong>{collectedLabel}</strong></div></div>;
}
