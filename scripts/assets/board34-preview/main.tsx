import React,{useState}from'react';import{createRoot}from'react-dom/client';
import{states}from'@imperio/game-data';
import{Board34Scene,board34Layout}from'../../../apps/web/src/board/board34/Board34Scene';
import{AvatarFigure}from'../../../apps/web/src/avatars/AvatarFigure';import{PlayerBase}from'../../../apps/web/src/avatars/PlayerBase';
import{PropertyBuildingModel}from'../../../apps/web/src/board/BuildingModels';import{propertyBuildingPlacement}from'../../../apps/web/src/board/buildings/buildingPresentation';
import{tileAnchor}from'../../../apps/web/src/board/layout';import{PAWN_SCALE,pawnSpots}from'../../../apps/web/src/board/pawnLayout';
import{formatCredits}from'../../../apps/web/src/property-card/tileInfo';
import{OlympicHost}from'../../../apps/web/src/board/OlympicHost';
import{olympicLocalContour}from'../../../apps/web/src/board/olympicPresentation';
import './preview.css';
function InspectionPieces({tileId,count,level}:{tileId:string;count:number;level:number}){
 const tile=board34Layout.tiles.find(t=>t.id===tileId)!;const a=tileAnchor(tile.index);
 const pawns=Array.from({length:count},(_,seat)=>({id:`inspection-${seat}`,position:tile.index,seat})),spots=pawnSpots(pawns);
 const colors=['#a264e6','#479cec','#51c280','#e65b71'],avatars=['avatar-1','avatar-2','avatar-3','avatar-4']as const;
 const b=propertyBuildingPlacement(a.buildingArea,level);const olympics=new URLSearchParams(location.search).has('olympics');
 return <>
 {pawns.map((pawn,i)=>{const spot=spots.get(pawn.id)!;return <group name={`INSPECTION_PAWN_${i}`} key={i} position={[spot.x,spot.y,spot.z]} scale={PAWN_SCALE}><PlayerBase color={colors[i]} active={false}/><AvatarFigure avatarId={avatars[i]} color={colors[i]}/></group>;})}
 <group name="INSPECTION_BUILDINGS" position={[a.x,a.surfaceY,a.z]} rotation={[0,a.rotationY,0]}>{b&&<group position={[b.x,0,b.z]}><PropertyBuildingModel level={b.level} color="#9c72d6" scale={b.scale}/></group>}</group>
 {olympics&&tile.type==='PROPERTY'&&<group position={[a.x,a.surfaceY,a.z]} rotation={[0,a.rotationY,0]}><OlympicHost placement={{...a,isCorner:false}} contour={olympicLocalContour(a)}/></group>}
 </>;
}
function Preview(){
 const[selected,setSelected]=useState<string|null>(null),[tax,setTax]=useState<string|null>('R$ 600'),[count,setCount]=useState(0),[level,setLevel]=useState(4),[rents,setRents]=useState('base');
 const labels=board34Layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>{const state=states.find(s=>s.id===t.id)!;const value=rents==='hotel'?state.rent.hotel:rents==='house2'?state.rent.house2:state.rent.base;return{stateId:t.id,rentLabel:formatCredits(value)};});
 (window as any).board34QA={selected,tax,count,level,labels,setSelected,setTax,setCount,setLevel,setRents};
 return <main><header className="inspection-tools"><strong>Tabuleiro 3D · 34 casas</strong><span>{selected??'Selecione uma casa'}</span><label>Fundo <select value={tax??'unknown'} onChange={e=>setTax(e.target.value==='unknown'?null:e.target.value)}><option>R$ 0</option><option>R$ 100</option><option>R$ 600</option><option>R$ 12.000</option><option value="unknown">Não informado</option></select></label><label>Peças <select value={count} onChange={e=>setCount(Number(e.target.value))}><option value="0">Sem peças</option><option value="1">1 personagem</option><option value="4">4 personagens</option></select></label><label>Construção <select value={level} onChange={e=>setLevel(Number(e.target.value))}><option value="0">Terreno</option><option value="1">Casa 1</option><option value="2">Casa 2</option><option value="3">Casa 3</option><option value="4">Casa 4</option><option value="5">Hotel</option></select></label><label>Aluguéis <select value={rents} onChange={e=>setRents(e.target.value)}><option value="base">Base</option><option value="house2">Duas casas</option><option value="hotel">Hotel</option></select></label></header><div className="inspection-scene"><Board34Scene selectedId={selected} onSelect={setSelected} rentLabels={labels} taxPoolLabel={tax} diceValues={[5,3]}>{(count>0||selected!==null)&&<InspectionPieces tileId={selected??'RN'} count={count} level={level}/>}</Board34Scene></div></main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
