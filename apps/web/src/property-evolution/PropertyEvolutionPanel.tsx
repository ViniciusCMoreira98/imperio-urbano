import { useId, type ReactNode } from 'react';
import { BuildingArtwork, BuildToolsArtwork, InvestmentArtwork } from './PropertyArtwork';
import { StateHeaderArtwork } from './StateHeaderArtwork';
import './property-evolution.css';

export interface PropertyEvolutionStage {
  /** Nível final: 0 terreno, 1–4 casas, 5 hotel. Não é quantidade a construir. */
  level: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  rentLabel: string;
  status: 'current' | 'available' | 'locked' | 'complete';
  /** Texto calculado pelo controlador, sem regra duplicada na arte. */
  note?: string;
}
export interface PropertyEvolutionPanelProps {
  stateCode: string;
  stateName: string;
  /** Opcional: por padrão o cabeçalho resolve a arte própria pela stateCode. */
  artwork?: ReactNode;
  mode: 'purchase' | 'build';
  stages: readonly PropertyEvolutionStage[];
  selectedLevel: number | null;
  costLabel: string;
  newRentLabel: string;
  actionLabel: string;
  actionDisabled?: boolean;
  pending?: boolean;
  message?: string;
  onSelect: (targetLevel: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

/** Conteúdo visual controlado. O diálogo/foco, comandos e permissões pertencem ao host. */
export function PropertyEvolutionPanel(props: PropertyEvolutionPanelProps) {
  const titleId = useId();
  const selected = props.stages.find(stage => stage.level === props.selectedLevel);
  const disabled = props.pending || props.actionDisabled || selected?.status !== 'available';
  return <section className="pe-panel" aria-labelledby={titleId} aria-busy={props.pending || undefined}>
    <button type="button" className="pe-close" aria-label="Fechar evolução da propriedade" onClick={props.onClose}><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="m8 4 8 8 8-8 4 4-8 8 8 8-4 4-8-8-8 8-4-4 8-8-8-8Z" fill="currentColor"/></svg></button>
    <header className="pe-header">
      <div className="pe-postcard">{props.artwork ?? <StateHeaderArtwork stateCode={props.stateCode}/>}<span className="pe-code">{props.stateCode}</span></div>
      <div><p className="pe-eyebrow">IMPÉRIO URBANO · EDIÇÃO BRASIL</p><h2 id={titleId}>{props.stateName}</h2><p className="pe-subtitle">{props.mode === 'purchase' ? 'Adquira sua propriedade' : 'Evolução da propriedade'}</p></div>
      <div className="pe-skyline" aria-hidden="true">{[25,38,22,56,72,42,60,33,48].map((height,i)=><i key={i} style={{height}}/>)}</div>
    </header>
    <div className="pe-body">
      <ol className="pe-stages" aria-label="Etapas da propriedade">
        {props.stages.map(stage => <li key={stage.level}>
          <button type="button" className={`pe-stage pe-${stage.status}${props.selectedLevel === stage.level ? ' pe-selected' : ''}`} aria-pressed={props.selectedLevel === stage.level} disabled={stage.status !== 'available' || props.pending} onClick={() => props.onSelect(stage.level)}>
            <div className="pe-illustration"><BuildingArtwork level={stage.level}/>{stage.status === 'locked' && <span className="pe-lock" aria-hidden="true"><svg viewBox="0 0 40 46"><path d="M10 20V13a10 10 0 0 1 20 0v7" fill="none" stroke="#ffe568" strokeWidth="6"/><rect x="4" y="19" width="32" height="24" rx="5" fill="#ffd127" stroke="#9e5800" strokeWidth="2"/><path d="M20 26v9" stroke="#5e3805" strokeWidth="4"/></svg></span>}</div>
            <h3>{stage.label}</h3><div className="pe-stage-details">{stage.status === 'current' ? <strong className="pe-current-label"><span>✓</span> Atual</strong> : <><span>Aluguel</span><strong>{stage.rentLabel}</strong></>}{stage.note && <small>{stage.note}</small>}</div>
            {stage.status === 'complete' && <span className="pe-complete" aria-label="Etapa concluída">✓</span>}
          </button>
        </li>)}
      </ol>
      <div className="pe-summary"><div><span className="pe-summary-icon"><InvestmentArtwork/></span><div><span>{props.mode === 'purchase' ? 'Custo da aquisição' : 'Custo da construção'}</span><strong>{props.costLabel}</strong></div></div><div><span className="pe-summary-icon pe-growth"><InvestmentArtwork growth/></span><div><span>Novo aluguel</span><strong>{props.newRentLabel}</strong></div></div></div>
      {props.message && <p className="pe-message" role="status">{props.message}</p>}
      <button type="button" className="pe-confirm" disabled={disabled} onClick={props.onConfirm}><BuildToolsArtwork/>{props.pending ? 'AGUARDE…' : props.actionLabel}</button>
    </div>
  </section>;
}
