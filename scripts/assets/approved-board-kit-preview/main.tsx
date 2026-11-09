import{useState}from'react';
import{createRoot}from'react-dom/client';
import{board,states}from'@imperio/game-data';
import{ApprovedPropertyCard,ApprovedSpecialCard,ApprovedRollButton,ApprovedPlayerCard,ApprovedRoundControl,type ApprovedSpecialKind}from'../../../apps/web/src/board-presentation/ApprovedBoardKit';
import{formatCredits}from'../../../apps/web/src/property-card/tileInfo';
import logo from'../../../apps/web/src/main-menu/art/logo-v1.webp';
import'./preview.css';
const byId=new Map(states.map(s=>[s.id,s]));
const propertyTiles=board.tiles.filter(t=>t.type==='PROPERTY');
const specialKinds:Record<string,ApprovedSpecialKind>={START:'start',OLYMPICS:'olympics',REST:'rest',AIRPORT:'airport',EVENT:'event',TAX:'tax',SAQUE:'withdraw'};
function Preview(){
 const[selected,setSelected]=useState<string|null>(null),[rolls,setRolls]=useState(0),[notice,setNotice]=useState('Recursos de apresentação — não é uma captura da partida.');
 const property=(id:string,orientation:'portrait'|'landscape'='portrait',label?:string)=>{const state=byId.get(id)!;return <ApprovedPropertyCard stateId={id} name={state.name} rentLabel={label??formatCredits(state.rent.house2)} orientation={orientation} selected={selected===id} onSelect={()=>{setSelected(id);setNotice(`${state.name} selecionado na prévia`)}}/>};
 return <main onKeyDown={e=>{if(e.key==='Escape'){setSelected(null);setRolls(0);setNotice('Recursos de apresentação — não é uma captura da partida.')}}}>
  <section className="kit-hero" aria-label="Prévia dos elementos visuais">
   <header className="kit-preview-header"><div><ApprovedPlayerCard nickname="Vinícius" avatarId="avatar-1" balanceLabel="R$ 1.500"/></div><img src={logo} alt="Império Urbano — Edição Brasil"/><div><ApprovedPlayerCard nickname="Marina" avatarId="avatar-2" balanceLabel="R$ 1.500"/></div></header>
   <div className="kit-intro"><span>REFERÊNCIA APROVADA · PRIMEIRA ETAPA</span><h1>Elementos do tabuleiro</h1><p>As mesmas ilustrações, com molduras e faixas próprias para cada orientação.</p></div>
   <div className="kit-feature-properties"><div>{property('RN')}</div><div>{property('AM')}</div><div>{property('MT')}</div><div>{property('RJ')}</div><aside><div>{property('AL','landscape')}</div><div>{property('BA','landscape')}</div></aside></div>
   <div className="kit-feature-controls"><div><ApprovedSpecialCard kind="start"/></div><div><ApprovedSpecialCard kind="event"/></div><div><ApprovedSpecialCard kind="tax" amountLabel="R$ 600"/></div><section><ApprovedRollButton onClick={()=>{setRolls(n=>n+1);setNotice('Botão de rolar acionado na prévia')}}/><div className="kit-rounds"><ApprovedRoundControl kind="settings" label="Configurações" onClick={()=>setNotice('Controle Configurações acionado')}/><ApprovedRoundControl kind="players" label="Jogadores" onClick={()=>setNotice('Controle Jogadores acionado')}/><ApprovedRoundControl kind="cards" label="Cartas guardadas" badge={2} onClick={()=>setNotice('Controle Cartas acionado')}/></div></section></div>
   <footer><p role="status" data-rolls={rolls}>{notice}</p><span>Modelos atuais de terreno, casas e hotel preservados.</span></footer>
  </section>
  <section className="kit-catalog"><h2>26 estados · versão vertical</h2><div className="kit-portrait-grid" data-catalog="portrait">{propertyTiles.map(t=><div key={t.id}>{property(t.stateId!)}</div>)}</div>
   <h2>26 estados · versão horizontal</h2><div className="kit-landscape-grid" data-catalog="landscape">{propertyTiles.map(t=><div key={t.id}>{property(t.stateId!,'landscape')}</div>)}</div>
   <h2>As 8 casas especiais do percurso</h2><div className="kit-special-grid" data-catalog="special">{board.tiles.filter(t=>t.type!=='PROPERTY').map(t=><div key={t.id} data-tile-id={t.id}><ApprovedSpecialCard kind={specialKinds[t.type==='NATIONAL_TRAVEL'?'AIRPORT':t.type]} amountLabel={t.id==='TAX'?'R$ 600':undefined}/><small>{t.id}</small></div>)}</div>
   <h2>Leitura em tamanhos pequenos e valores longos</h2><div className="kit-size-grid" data-catalog="sizes">{[56,72,96].map(w=><div key={w} style={{width:w}}>{property('PR')}<small>{w}px</small></div>)}<div style={{width:96}}>{property('SP','portrait','R$ 100.000')}<small>Valor longo</small></div><div style={{width:96}}>{property('RO','portrait','Apagão')}<small>Status</small></div><div style={{width:192}}>{property('DF','landscape','R$ 100.000')}<small>Horizontal</small></div></div>
  </section>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
