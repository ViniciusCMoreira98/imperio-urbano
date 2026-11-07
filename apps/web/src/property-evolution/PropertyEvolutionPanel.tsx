import { useId, type ReactNode } from 'react';
import { BuildingArtwork, BuildToolsArtwork, InvestmentArtwork } from './PropertyArtwork';
import { StateHeaderArtwork } from './StateHeaderArtwork';
import './property-evolution.css';

export interface PropertyEvolutionStage {
  /** Nível final: 0 terreno, 1–4 casas, 5 hotel. Não é quantidade a construir. */
  level: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  rentLabel: string;
  /** Valor sem o bônus, fornecido pelo controlador somente na sede olímpica. */
  baseRentLabel?: string;
  status: 'current' | 'available' | 'locked' | 'complete';
  /** Texto calculado pelo controlador, sem regra duplicada na arte. */
  note?: string;
}
interface PropertyEvolutionContent {
  stateCode: string;
  stateName: string;
  /** Opcional: por padrão o cabeçalho resolve a arte própria pela stateCode. */
  artwork?: ReactNode;
  stages: readonly PropertyEvolutionStage[];
  owner?: { name: string; color: string; portrait?: ReactNode } | null;
  olympics?: { multiplier: number; edition: number; label: string };
  message?: string;
  onClose: () => void;
}
interface PropertyEvolutionActions {
  selectedLevel: number | null;
  costLabel: string;
  newRentLabel: string;
  actionLabel: string;
  actionDisabled?: boolean;
  pending?: boolean;
  onSelect: (targetLevel: number) => void;
  onConfirm: () => void;
}
export type PropertyEvolutionPanelProps = PropertyEvolutionContent & (
  | ({ mode: 'purchase' | 'build' } & PropertyEvolutionActions)
  | ({ mode: 'view' } & Partial<PropertyEvolutionActions>)
);

/** Conteúdo visual controlado. O diálogo/foco, comandos e permissões pertencem ao host. */
export function PropertyEvolutionPanel(props: PropertyEvolutionPanelProps) {
  const titleId = useId();
  const viewing = props.mode === 'view';
  const current = props.stages.find(stage => stage.status === 'current');
  const selected = props.stages.find(stage => stage.level === props.selectedLevel);
  const disabled = props.pending || props.actionDisabled || selected?.status !== 'available';
  return <section className={`pe-panel${viewing ? ' pe-view' : ''}${props.olympics ? ' pe-olympic' : ''}`} aria-labelledby={titleId} aria-busy={viewing ? undefined : props.pending || undefined}>
    <button type="button" className="pe-close" aria-label="Fechar evolução da propriedade" onClick={props.onClose}><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="m8 4 8 8 8-8 4 4-8 8 8 8-4 4-8-8-8 8-4-4 8-8-8-8Z" fill="currentColor"/></svg></button>
    <header className="pe-header">
      <div className="pe-postcard">{props.artwork ?? <StateHeaderArtwork stateCode={props.stateCode}/>}<span className="pe-code">{props.stateCode}</span></div>
      <div><p className="pe-eyebrow">IMPÉRIO URBANO · EDIÇÃO BRASIL</p><h2 id={titleId}>{props.stateName}</h2><p className="pe-subtitle">{props.mode === 'purchase' ? 'Adquira sua propriedade' : 'Evolução da propriedade'}</p>
        {props.olympics && <div className="pe-olympic-badge"><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M20 2c3 10 13 13 12 23-1 13-24 14-25 0-1-8 8-13 8-19l5 10Z" fill="#ffcd4f"/><path d="M20 18c5 5 7 7 6 11-2 7-12 5-12 0 0-4 4-6 6-11" fill="#fff2a5"/><path d="M9 36h23l-4 5H13Zm5 6h12v5H14Z" fill="#f9d979"/></svg><strong>{props.olympics.label}</strong><small>Edição {props.olympics.edition}</small></div>}
      </div>
      <div className="pe-skyline" aria-hidden="true">{[25,38,22,56,72,42,60,33,48].map((height,i)=><i key={i} style={{height}}/>)}</div>
    </header>
    {viewing && <div className="pe-ownership">
      <div className="pe-owner-identity">
        <span className="pe-owner-portrait" style={{borderColor:props.owner?.color ?? '#efc55b',background:props.owner ? `${props.owner.color}30` : '#174b6b'}} aria-hidden="true">
          {props.owner?.portrait ?? (props.owner ? <span>{props.owner.name.trim().charAt(0)}</span> : <svg viewBox="0 0 48 48"><path d="M12 39V10m1 0h24l-6 8 6 8H13" fill="#f7d476" stroke="#ffeeb8" strokeWidth="2.5" strokeLinejoin="round"/><path d="M6 40h16" stroke="#ffeeb8" strokeWidth="3" strokeLinecap="round"/></svg>)}
        </span>
        <div><span className="pe-info-label">{props.owner ? 'Proprietário' : 'Propriedade livre'}</span><strong className="pe-owner-name">{props.owner?.name ?? 'Disponível para compra'}</strong>{props.owner && <span className="pe-owner-color"><i style={{background:props.owner.color}}/>Cor do proprietário</span>}</div>
      </div>
      <dl className="pe-view-facts"><div><dt>{current ? 'Nível atual' : 'Situação'}</dt><dd>{current?.label ?? 'Sem construção'}</dd></div><div><dt>{props.owner ? 'Aluguel atual' : 'Aluguel base'}</dt><dd>{(current ?? props.stages[0])?.rentLabel ?? '—'}</dd></div></dl>
    </div>}
    <div className="pe-body">
      <ol className="pe-stages" aria-label="Etapas da propriedade">
        {props.stages.map(stage => viewing ? <li key={stage.level} aria-current={stage.status === 'current' ? 'step' : undefined}>
          <div className={`pe-stage pe-view-stage${stage.status === 'current' ? ' pe-current' : ''}`}>
            {stage.status === 'current' && <span className="pe-view-current">✓ Nível atual</span>}
            <div className="pe-illustration"><BuildingArtwork level={stage.level}/></div>
            <h3>{stage.label}</h3><div className="pe-stage-details"><span>Aluguel</span>{props.olympics && stage.baseRentLabel && <s className="pe-base-rent" aria-label={`Sem Olimpíadas: ${stage.baseRentLabel}`}>{stage.baseRentLabel}</s>}<strong>{stage.rentLabel}</strong></div>
          </div>
        </li> : <li key={stage.level}>
          <button type="button" className={`pe-stage pe-${stage.status}${props.selectedLevel === stage.level ? ' pe-selected' : ''}`} aria-pressed={props.selectedLevel === stage.level} disabled={stage.status !== 'available' || props.pending} onClick={() => props.onSelect?.(stage.level)}>
            <div className="pe-illustration"><BuildingArtwork level={stage.level}/>{stage.status === 'locked' && <span className="pe-lock" aria-hidden="true"><svg viewBox="0 0 40 46"><path d="M10 20V13a10 10 0 0 1 20 0v7" fill="none" stroke="#ffe568" strokeWidth="6"/><rect x="4" y="19" width="32" height="24" rx="5" fill="#ffd127" stroke="#9e5800" strokeWidth="2"/><path d="M20 26v9" stroke="#5e3805" strokeWidth="4"/></svg></span>}</div>
            <h3>{stage.label}</h3><div className="pe-stage-details">{stage.status === 'current' && !props.olympics ? <strong className="pe-current-label"><span>✓</span> Atual</strong> : <><span>{stage.status === 'current' ? 'Aluguel atual' : 'Aluguel'}</span>{props.olympics && stage.baseRentLabel && <s className="pe-base-rent" aria-label={`Sem Olimpíadas: ${stage.baseRentLabel}`}>{stage.baseRentLabel}</s>}<strong>{stage.rentLabel}</strong></>}{stage.note && <small>{stage.note}</small>}</div>
            {stage.status === 'complete' && <span className="pe-complete" aria-label="Etapa concluída">✓</span>}
          </button>
        </li>)}
      </ol>
      {!viewing && <div className="pe-summary"><div><span className="pe-summary-icon"><InvestmentArtwork/></span><div><span>{props.mode === 'purchase' ? 'Custo da aquisição' : 'Custo da construção'}</span><strong>{props.costLabel}</strong></div></div><div><span className="pe-summary-icon pe-growth"><InvestmentArtwork growth/></span><div><span>Novo aluguel</span><strong>{props.newRentLabel}</strong></div></div></div>}
      {props.message && <p className="pe-message" role="status">{props.message}</p>}
      {viewing ? <p className="pe-view-caption">Aluguéis em cada etapa da evolução da propriedade</p> : <button type="button" className="pe-confirm" disabled={disabled} onClick={props.onConfirm}><BuildToolsArtwork/>{props.pending ? 'AGUARDE…' : props.actionLabel}</button>}
    </div>
  </section>;
}
