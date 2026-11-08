import React from 'react';import{createRoot}from'react-dom/client';
import{useTexture}from'@react-three/drei';
import{states}from'@imperio/game-data';
import{Board34Scene,board34Layout}from'../../../apps/web/src/board/board34/Board34Scene';
import{pixelToWorld}from'../../../apps/web/src/board/board34/buildingZone';
import{panelPoint}from'../../../apps/web/src/board/board34/panelProjection';
import{tileAnchor}from'../../../apps/web/src/board/layout';
import{OlympicHost}from'../../../apps/web/src/board/OlympicHost';
import{olympicLocalContour}from'../../../apps/web/src/board/olympicPresentation';
import{PropertyBuildingModel}from'../../../apps/web/src/board/BuildingModels';
import{propertyBuildingPlacement}from'../../../apps/web/src/board/buildings/buildingPresentation';
import artwork from'../../../apps/web/src/board/board34/art/olympic-host-v1.webp';
import frameArtwork from'../../../apps/web/src/board/board34/art/olympic-frame-v2.webp';
import torchFrameArtwork from'../../../apps/web/src/board/board34/art/olympic-frame-v1.webp';
import './preview.css';
const id='RJ',tile=board34Layout.tiles.find(t=>t.id===id)!,a=tileAnchor(tile.index);
const frameMode=new URLSearchParams(location.search).get('variant')!=='stadium';
function PropertyFrame(){const texture=useTexture(new URLSearchParams(location.search).get('variant')==='torch'?torchFrameArtwork:frameArtwork);return<mesh name="OLYMPIC_FRAME_PREVIEW" renderOrder={5}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([[-.02,-.10],[1.02,-.10],[1.02,1.02],[-.02,1.02]].flatMap(([u,v])=>{const [x,z]=pixelToWorld(tile)(...panelPoint(tile.panel,u,v));return [x,a.surfaceY+.03,z]})),3]}/><bufferAttribute attach="attributes-uv" args={[new Float32Array([0,1,1,1,1,0,0,0]),2]}/><bufferAttribute attach="index" args={[new Uint16Array([0,1,2,0,2,3]),1]}/></bufferGeometry><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={2}/></mesh>}
function Pieces(){const texture=useTexture(artwork),[x,z]=pixelToWorld(tile)(...panelPoint(tile.panel,.28,.52)),building=propertyBuildingPlacement(a.buildingArea,2);return<>
 {frameMode?(new URLSearchParams(location.search).get('variant')==='torch'?<PropertyFrame/>:<group position={[a.x,a.surfaceY,a.z]} rotation={[0,a.rotationY,0]}><OlympicHost placement={{...a,isCorner:false}} contour={olympicLocalContour(a)}/></group>):<sprite name="OLYMPIC_STADIUM_PREVIEW" position={[x,a.surfaceY+.10,z]} scale={[.46,.46,1]}><spriteMaterial map={texture} transparent alphaTest={.03} depthWrite={false} toneMapped={false}/></sprite>}
 <group position={[a.x,a.surfaceY,a.z]} rotation={[0,a.rotationY,0]}>{!frameMode&&<OlympicHost placement={{...a,isCorner:false}} contour={olympicLocalContour(a)}/>} {building&&<group position={[building.x+(frameMode?0:.19),0,building.z]}><PropertyBuildingModel level={building.level} color="#479cec" scale={building.scale*(frameMode?1:.82)}/></group>}</group>
 </>}
const labels=board34Layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>({stateId:t.id,rentLabel:'R$ '+states.find(s=>s.id===t.id)!.rent.base,ownerColor:t.id===id?'#479cec':undefined}));
function Preview(){return<main><header><strong>Sede das Olimpíadas</strong><span>Estudo visual · Rio de Janeiro · arte sobre o tabuleiro real</span></header><div className="scene"><Board34Scene environment="beach" framing="immersive" selectedId={id} rentLabels={labels} taxPoolLabel="R$ 600" diceValues={[5,3]}><Pieces/></Board34Scene></div></main>}
createRoot(document.getElementById('root')!).render(<Preview/>);
