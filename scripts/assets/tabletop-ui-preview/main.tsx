import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {states} from '@imperio/game-data';
import type {GameSnapshot} from '@imperio/shared-types';
import {ReferenceBoardScene,reference33Layout} from '../../../apps/web/src/board/reference33/ReferenceBoardScene';
import {StateRentOverlay,PlayerNameplate,ActionDock,type RentLabel} from '../../../apps/web/src/tabletop-ui/TabletopUi';
import {AvatarPortrait} from '../../../apps/web/src/hud/AvatarPortrait';
import {DiceFaces} from '../../../apps/web/src/hud/DiceFaces';
import {currentRent} from '../../../apps/web/src/game/rules';
import {formatCredits} from '../../../apps/web/src/property-card/tileInfo';
import '../../../apps/web/src/index.css';
import './preview.css';

type Mode='base'|'houses'|'hotel'|'olympics';
function Preview(){
 const[mode,setMode]=useState<Mode>('base');const[selected,setSelected]=useState<string|null>(null);const[rolls,setRolls]=useState(0);
 // Fixture local de arte: só o helper existente consulta propriedades/Olimpíadas; nenhuma partida é criada.
 const fixture={properties:reference33Layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>({stateId:t.id,ownerId:mode==='base'?null:'preview',buildingLevel:mode==='houses'?2:mode==='hotel'?5:mode==='olympics'&&t.id==='ES'?2:0,ownerVisits:6,levelReachedAtVisit:5})),olympics:{edition:1,hostStateId:mode==='olympics'?'ES':null,hostPlayerId:'preview',multiplier:3}} as GameSnapshot;
 const labels:RentLabel[]=reference33Layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>{const state=states.find(s=>s.id===t.stateId)!;return{stateId:state.id,stateName:state.name,rentLabel:formatCredits(currentRent(fixture,state)),kind:mode==='base'?'base':'current'};});
 (window as any).rentAssetQA={labels,selected,mode,rolls};
 return <main>
  <header className="asset-review-header"><h1>Aluguéis no tabuleiro</h1><p>Prévia de arte · valores do catálogo · sem partida conectada</p><label>Conferir valores <select value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value="base">Aluguel base</option><option value="houses">Duas casas</option><option value="hotel">Hotel</option><option value="olympics">ES com duas casas + Olimpíadas ×3</option></select></label></header>
  <section className="asset-review-board" aria-label="Tabuleiro com aluguel dos 26 estados"><ReferenceBoardScene selectedId={selected} onSelect={setSelected}/><StateRentOverlay labels={labels}/></section>
  <section className="asset-review-gallery" aria-label="Assets dos controles"><div className="asset-review-players">{(['avatar-1','avatar-2','avatar-3','avatar-4'] as const).map((id,i)=><PlayerNameplate key={id} name={i===0?'Vinícius':`Jogador ${i+1}`} balanceLabel="R$ 1.250" active={i===0} portrait={<AvatarPortrait avatarId={id}/>}/>)}</div><ActionDock roundLabel="Rodada 3"><strong>Sua vez</strong><DiceFaces values={[5,3]}/><span className="asset-review-timer">27 s</span><button type="button" onClick={()=>setRolls(n=>n+1)}>ROLAR DADOS</button></ActionDock><p role="status">{rolls?`${rolls} clique(s) de demonstração, sem enviar comandos.`:'Textos, retratos, dados, tempo e botões permanecem separados da imagem.'}</p></section>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
