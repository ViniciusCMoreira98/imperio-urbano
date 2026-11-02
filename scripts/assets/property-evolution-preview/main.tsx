import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { states } from '@imperio/game-data';
import { PropertyEvolutionPanel, type PropertyEvolutionStage } from '../../../apps/web/src/property-evolution/PropertyEvolutionPanel';
import { STATE_HEADER_ART, StateHeaderArtwork, type StateArtworkCode } from '../../../apps/web/src/property-evolution/StateHeaderArtwork';
import { formatCredits } from '../../../apps/web/src/property-card/tileInfo';
import './preview.css';

const artworkCodes = (Object.keys(STATE_HEADER_ART) as StateArtworkCode[]).sort();
function Preview() {
  const [stateCode,setStateCode] = useState<StateArtworkCode>('RJ');
  const definition = states.find(state => state.id === stateCode)!;
  const r = definition.rent;
  const rents = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel];
  const [selected,setSelected] = useState(3);
  const [mode,setMode] = useState<'build'|'purchase'>('build');
  const [message,setMessage] = useState('Prévia de arte · valores do catálogo · sem comandos de partida');
  const [closed,setClosed] = useState(false);
  const stages: PropertyEvolutionStage[] = [0,1,2,3,4,5].map(level => ({level:level as PropertyEvolutionStage['level'],label:level===0?'Terreno':level===5?'Hotel':`Casa ${level}`,rentLabel:formatCredits(rents[level]),status:level===0?(mode==='purchase'?'available':'current'):level<=3?'available':'locked',note:level===4?'Em uma próxima visita':level===5?'Após a Casa 4 e nova visita':undefined}));
  return <main><nav><span>PRÉVIA DE ARTE · SEM PARTIDA CONECTADA</span><button onClick={()=>{setClosed(false);setSelected(3);setMode('build');}}>Construção</button><button onClick={()=>{setClosed(false);setSelected(0);setMode('purchase');}}>Compra</button><select aria-label="Estado da prévia" value={stateCode} onChange={event=>{setStateCode(event.target.value as StateArtworkCode);setClosed(false);}}>{artworkCodes.map(code=><option key={code} value={code}>{code} · {STATE_HEADER_ART[code].name}</option>)}</select><a href="?gallery=1">Todas as artes</a></nav>{!closed && <PropertyEvolutionPanel stateCode={stateCode} stateName={definition.name} mode={mode} stages={stages} selectedLevel={selected} costLabel={formatCredits((mode==='purchase'?definition.price:0)+selected*definition.houseCost)} newRentLabel={formatCredits(rents[selected])} actionLabel={mode==='purchase'?(selected===0?'COMPRAR TERRENO':`COMPRAR + ${selected} CASA${selected>1?'S':''}`):`CONSTRUIR ${selected} CASA${selected>1?'S':''}`} onSelect={setSelected} onConfirm={()=>setMessage('Clique recebido pela prévia. Nenhuma compra ou construção foi executada.')} onClose={()=>setClosed(true)} message={message}/>}</main>;
}

function Gallery() {
  return <main className="state-gallery"><header><h1>IMPÉRIO URBANO · ARTES DOS ESTADOS</h1><p>26 cabeçalhos originais · prévia do modal · sem partida conectada</p><a href="?">Voltar ao modal</a></header><div className="state-gallery-grid">{artworkCodes.map(code=><figure key={code}><div className="pe-postcard"><StateHeaderArtwork stateCode={code}/><span className="pe-code">{code}</span></div><figcaption>{STATE_HEADER_ART[code].name}</figcaption></figure>)}</div></main>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('gallery') ? <Gallery/> : <Preview/>);
