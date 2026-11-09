import{useState}from'react';
import{createRoot}from'react-dom/client';
import{states}from'@imperio/game-data';
import{ApprovedBoardComposition,type CompositionBuilding,type CompositionPlayer}from'../../../apps/web/src/board-presentation/ApprovedBoardComposition';
import{formatCredits}from'../../../apps/web/src/property-card/tileInfo';
import spriteManifest from'../../../assets/board-mobile/approved-composition/model-sprites/manifest.json';
const files=import.meta.glob('../../../assets/board-mobile/approved-composition/model-sprites/*.png',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const assignments=[['RN',1,'purple'],['AM',2,'blue'],['RO',3,'green'],['MT',0,'coral'],['DF',4,'blue'],['BA',5,'green'],['RJ',1,'purple'],['SC',2,'coral']]as const;
const buildings:CompositionBuilding[]=assignments.map(([stateId,level,color])=>{const key=`level-${level}-${color}`,s=spriteManifest.sprites.find(s=>s.key===key)!;return{stateId,level,spriteUrl:files[Object.keys(files).find(p=>p.endsWith('/'+key+'.png'))!],sourceModel:s.source,ownerColor:s.ownerColor,width:s.displayWidth,height:s.displayHeight}});
const rentKeys=['base','house1','house2','house3','house4','hotel']as const;
const rentLabels=Object.fromEntries(states.map(state=>{const level=assignments.find(a=>a[0]===state.id)?.[1]??0;return[state.id,formatCredits(state.rent[rentKeys[level]])]}));
const players:CompositionPlayer[]=[{id:'preview-1',nickname:'Vinícius',avatarId:'avatar-2',balanceLabel:'R$ 1.500'},{id:'preview-2',nickname:'Marina',avatarId:'avatar-1',balanceLabel:'R$ 1.500'},{id:'preview-3',nickname:'Lucas',avatarId:'avatar-4',balanceLabel:'R$ 1.500'},{id:'preview-4',nickname:'Sofia',avatarId:'avatar-3',balanceLabel:'R$ 1.500'}];
function Preview(){const[selected,setSelected]=useState<string|null>(null),[status,setStatus]=useState('Composição visual, sem partida conectada.');
 const log=(window as any).__compositionReview??={events:[],rentLabels,buildings};
 return <div style={{width:'100%',height:'100%'}} onKeyDown={e=>{if(e.key==='Escape'){setSelected(null);setStatus('Composição visual, sem partida conectada.')}}}>
  <ApprovedBoardComposition players={players} rentLabels={rentLabels} taxPoolLabel="R$ 600" buildings={buildings} cardsCount={2} selectedId={selected} onSelect={id=>{setSelected(id);setStatus(`Casa ${id} selecionada na composição.`);log.events.push({kind:'select',id})}} onRoll={()=>{setStatus('Botão de dados acionado na composição; partida ainda não conectada.');log.events.push({kind:'roll'})}} onControl={kind=>{setStatus(`${kind}: ação da composição; integração será feita na próxima etapa.`);log.events.push({kind:'control',control:kind})}}/>
  <p className="composition-review-status" role="status">{status}</p>
 </div>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
