import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OlympicCallout } from '../../../apps/web/src/olympics/OlympicCallout';
import './preview.css';

function Preview() {
  const [replay, setReplay] = useState(0);
  const [multiplier, setMultiplier] = useState(3);
  const [still, setStill] = useState(false);
  return <main><header><small>IMPÉRIO URBANO · E26</small><h1>A festa acontece na sede.</h1><p>Tocha, dourado e confetes pontuais. O destaque permanece junto ao estado.</p></header>
    <section className="stage" aria-label="Demonstração do destaque na sede">
      <div className="board-lines" />
      <div className="host"><div className="callout"><OlympicCallout key={`${replay}-${still}`} stateName="Rio de Janeiro" multiplier={multiplier} edition={2} celebrate={replay > 0} reducedMotion={still} /></div><div className="tile"><span>RJ</span><div className="skyline"><i/><i/><i/><i/><i/></div><strong>RIO DE JANEIRO</strong><small>ESTADO-SEDE</small></div></div>
      <span className="stage-note">Estudo visual · posição ilustrativa</span>
    </section>
    <nav aria-label="Controles da demonstração"><button onClick={() => setReplay(n => n + 1)}>Celebrar edição</button><label>Multiplicador <select value={multiplier} onChange={e => setMultiplier(Number(e.target.value))}>{[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>×{n}</option>)}</select></label><label><input type="checkbox" checked={still} onChange={e => setStill(e.target.checked)} /> Sem movimento</label></nav>
    <section className="examples"><div><h2>Selo persistente</h2><OlympicCallout stateName="Mato Grosso" multiplier={2}/></div><div><h2>Nome longo · ×10</h2><OlympicCallout stateName="Rio Grande do Norte" multiplier={10}/></div></section>
    <footer>Demonstração isolada. Dados ilustrativos, sem servidor ou alteração da partida.</footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
