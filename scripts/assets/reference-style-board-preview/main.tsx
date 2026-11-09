import{useState}from'react';
import{createRoot}from'react-dom/client';
import{states}from'@imperio/game-data';
import{ReferenceStyleBoard}from'../../../apps/web/src/board-presentation/ReferenceStyleBoard';
import{formatCredits}from'../../../apps/web/src/property-card/tileInfo';
const assignments:Record<string,number>={};
const levels=['base','house1','house2','house3','house4','hotel']as const;
const rentLabels=Object.fromEntries(states.map(s=>[s.id,formatCredits(s.rent[levels[assignments[s.id]??0]])]));
const players=[{id:'1',nickname:'Vinícius',avatarId:'avatar-2' as const,balanceLabel:'R$ 1.500'},{id:'2',nickname:'Marina',avatarId:'avatar-1' as const,balanceLabel:'R$ 1.500'},{id:'3',nickname:'Lucas',avatarId:'avatar-4' as const,balanceLabel:'R$ 1.500'},{id:'4',nickname:'Sofia',avatarId:'avatar-3' as const,balanceLabel:'R$ 1.500'}];
function Preview(){const[status,setStatus]=useState('Prévia 3D sem partida conectada.');const record=(kind:string,id?:string)=>{((window as any).__referenceEvents??=[]).push({kind,id});setStatus(`${kind}: ${id??'prévia'}`)};return <><ReferenceStyleBoard players={players} rentLabels={rentLabels} taxPoolLabel="R$ 600" onSelect={id=>record('select',id)} onRoll={()=>record('roll')} onControl={kind=>record('control',kind)}/><p className="composition-review-status" role="status">{status}</p></>}
createRoot(document.getElementById('root')!).render(<Preview/>);
