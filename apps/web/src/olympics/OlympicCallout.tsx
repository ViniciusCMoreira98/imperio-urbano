import type { CSSProperties } from 'react';
import './olympics.css';

export interface OlympicCalloutProps {
  stateName: string;
  multiplier: number;
  edition?: number;
  celebrate?: boolean;
  reducedMotion?: boolean;
}

/** Visual DOM para ancorar junto à sede (por exemplo, com Html do Drei).
 * A engenharia controla montagem, chave do evento e anúncio acessível. */
export function OlympicCallout({ stateName, multiplier, edition, celebrate = false, reducedMotion = false }: OlympicCalloutProps) {
  if (!Number.isInteger(multiplier) || multiplier < 1) throw new Error('Multiplicador visual inválido.');
  return (
    <div className={`iu-olympic${celebrate ? ' iu-olympic--celebrate' : ''}${reducedMotion ? ' iu-olympic--still' : ''}`}>
      <div className="iu-olympic__badge" role="img" aria-label={`${stateName}, sede olímpica${edition === undefined ? '' : ` da ${edition}ª edição`}. Aluguel vezes ${multiplier}.`}>
        <svg className="iu-olympic__torch" viewBox="0 0 40 56" fill="none" aria-hidden="true">
          <path d="M21 2C25 12 35 13 32 24C30 32 12 34 8 24C4 15 17 14 21 2Z" fill="#ffb52e" />
          <path d="M22 13C23 21 29 22 25 28C20 33 13 27 16 23C18 20 21 19 22 13Z" fill="#fff0ac" />
          <path d="M10 33H30L26 39H14L10 33Z" fill="#ffd36e" />
          <path d="M15 41H25L23 54H17L15 41Z" fill="#d99a35" />
          <path d="M19 42H22L21 52H19V42Z" fill="#ffe8a5" />
        </svg>
        <div className="iu-olympic__copy" aria-hidden="true"><span className="iu-olympic__eyebrow">SEDE OLÍMPICA</span><strong className="iu-olympic__state" title={stateName}>{stateName}</strong></div>
        <span className="iu-olympic__multiplier" aria-hidden="true">×{multiplier}</span>
      </div>
      {celebrate && <div className="iu-olympic__celebration" aria-hidden="true">
        <span className="iu-olympic__headline">{edition === undefined ? 'É tempo de celebrar!' : `${edition}ª edição · Vamos celebrar!`}</span>
        <div className="iu-olympic__confetti">{Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const radius = 72 + (i % 4) * 18;
          const style = { '--dx': `${Math.cos(angle) * radius}px`, '--dy': `${Math.sin(angle) * radius - 65}px`, '--spin': `${(i % 2 ? -1 : 1) * (180 + i * 23)}deg`, '--delay': `${(i % 6) * 35}ms`, '--confetti-color': ['#ffd36e', '#a991ff', '#65e2db', '#fff2cc'][i % 4] } as CSSProperties;
          return <i key={i} style={style} />;
        })}</div>
      </div>}
    </div>
  );
}
