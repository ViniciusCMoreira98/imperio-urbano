import React,{useState}from'react';
import{createRoot}from'react-dom/client';
import{ReferenceBoardScene,reference33Layout}from'../../../apps/web/src/board/reference33/ReferenceBoardScene';
import './preview.css';
function Preview(){const[selected,setSelected]=useState<string|null>(null);(window as any).reference33Selection=selected;(window as any).clearReference33Selection=()=>setSelected(null);return <main><ReferenceBoardScene selectedId={selected} onSelect={setSelected} diceValues={[5,3]}/><div className="preview-label">{selected?reference33Layout.tiles.find(t=>t.id===selected)?.label:'Prévia visual · 33 casas · clique para selecionar'}</div></main>;}
createRoot(document.getElementById('root')!).render(<Preview/>);
