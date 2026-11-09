import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Box3, BufferAttribute, ExtrudeGeometry, LinearMipmapLinearFilter, OrthographicCamera, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Vector3 } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PMREMGenerator } from 'three';
import { DiceVisual } from '../dice/DiceVisual';
import { AvatarFigure } from '../avatars/AvatarFigure';
import { ApprovedRollButton, ApprovedRoundControl } from './ApprovedBoardKit';
import { ReferencePlayerCard } from './ReferencePlayerCard';
import type { CompositionPlayer } from './ApprovedBoardComposition';
import { createCellSurface, type CellSurface } from './referenceStyleTextures';
import { INNER_RATIO, REFERENCE_OUTLINE, outlineAt, referenceStyleCells, type Point, type ReferenceCell } from './referenceStyleLayout';
import centerArt from './art/reference-center-v2.png';
import woodArt from '../board/board34/art/table-wood-v1.png';
import logo from '../main-menu/art/logo-v1.webp';
import './reference-style-board.css';

const cells=referenceStyleCells();
const shapeOf=(points:Point[])=>new Shape(points.map(([x,z])=>({x,y:-z}) as import('three').Vector2));
function surfaceGeometry(points:Point[],surface?:CellSurface,textureScale=1,textureAspect?:number){
  const geometry=new ShapeGeometry(shapeOf(points)),position=geometry.getAttribute('position'),uv=new Float32Array(position.count*2);
  const minX=Math.min(...REFERENCE_OUTLINE.map(p=>p[0]))*textureScale,maxX=Math.max(...REFERENCE_OUTLINE.map(p=>p[0]))*textureScale,minZ=-6.7*textureScale,maxZ=6.7*textureScale;
  let imageWidth=maxX-minX,imageHeight=maxZ-minZ;
  if(textureAspect){if(imageWidth/imageHeight>textureAspect)imageHeight=imageWidth/textureAspect;else imageWidth=imageHeight*textureAspect}
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),z=-position.getY(i);
    if(surface){const cell=cells.find(c=>c.polygon===points)!;uv[i*2]=(x*cell.u[0]+z*cell.u[1]-surface.minU)/surface.width;uv[i*2+1]=1-(x*cell.v[0]+z*cell.v[1]-surface.minV)/surface.height;}
    else{uv[i*2]=.5+(x-(minX+maxX)/2)/imageWidth;uv[i*2+1]=.5-(z-(minZ+maxZ)/2)/imageHeight;}
  }
  geometry.setAttribute('uv',new BufferAttribute(uv,2));return geometry;
}
interface Projection { viewport:{width:number;height:number}; outline:{x:number;y:number}[]; diceBounds:{x:number;y:number;width:number;height:number}|null; labels:{id:string;text:string;color:string;x:number;y:number;width:number;fontSize:number;angle:number}[]; logo:{x:number;y:number;width:number}; roll:{x:number;y:number;width:number}; board:{x:number;y:number;width:number;height:number}; cells: {id:string;x:number;y:number;fontPixels:number;polygon:{x:number;y:number}[]}[] }
interface Props { players:CompositionPlayer[]; rentLabels:Record<string,string>; taxPoolLabel:string; onSelect?:(id:string)=>void; onRoll?:()=>void; onControl?:(kind:'settings'|'players'|'history'|'cards'|'sound')=>void }
function Rig({surfaces,onProject}:{surfaces:CellSurface[];onProject:(p:Projection)=>void}){
  const {camera,size,gl,scene}=useThree();
  useLayoutEffect(()=>{
    const c=camera as OrthographicCamera,phone=size.height<=500;
    c.left=-size.width/2;c.right=size.width/2;c.top=size.height/2;c.bottom=-size.height/2;c.position.set(0,phone?12:19.5,17);c.lookAt(0,-.16,0);c.near=.1;c.far=100;c.zoom=1;c.updateProjectionMatrix();c.updateMatrixWorld(true);
    const projection=(x:number,y:number,z:number)=>{const p=new Vector3(x,y,z).project(c);return{x:(p.x+1)*size.width/2,y:(1-p.y)*size.height/2}};
    const envelope=(y:number)=>REFERENCE_OUTLINE.map(([x,z])=>projection(x,y,z));
    const initial=[...envelope(.06),...envelope(-.425)],bounds=(p:{x:number;y:number}[])=>({x:Math.min(...p.map(v=>v.x)),y:Math.min(...p.map(v=>v.y)),width:Math.max(...p.map(v=>v.x))-Math.min(...p.map(v=>v.x)),height:Math.max(...p.map(v=>v.y))-Math.min(...p.map(v=>v.y))});
    const b=bounds(initial);c.zoom=Math.min((size.width-(phone?74:124))/b.width,(size.height-(phone?20:35))/b.height);c.updateProjectionMatrix();
    const final=bounds([...envelope(.06),...envelope(-.425)]);
    scene.updateMatrixWorld(true);
    const dicePoints=['REFERENCE_DICE_A','REFERENCE_DICE_B'].flatMap(name=>{const object=scene.getObjectByName(name);if(!object)return[];const box=new Box3().setFromObject(object,true);return[box.min.x,box.max.x].flatMap(x=>[box.min.y,box.max.y].flatMap(y=>[box.min.z,box.max.z].map(z=>projection(x,y,z))))});
    const projectOverlay=(z:number,width:number)=>{const p=projection(0,.05,z),a=projection(-width/2,.05,z),b=projection(width/2,.05,z);return{...p,width:b.x-a.x}};
    const result:Projection={
      viewport:{width:size.width,height:size.height},
      outline:envelope(.021),
      diceBounds:dicePoints.length?bounds(dicePoints):null,
      labels:surfaces.flatMap((surface,i)=>surface.labels.map(label=>{
        const cell=cells[i],footer=size.height<=320?label.shortFooter:undefined,[x,z]=footer?.position??label.fittedPosition??[label.x,label.z],worldWidth=footer?.width??label.widthWorld,p=projection(x,.035,z),end=projection(x+cell.u[0]*worldWidth,.035,z+cell.u[1]*worldWidth),width=Math.hypot(end.x-p.x,end.y-p.y);
        const minimum=label.text.startsWith('R$')?(phone?8:label.fittedPosition?12:14):label.text.length===2?(phone?7.5:14):0;
        let fontSize=Math.min(width/label.textUnits,Math.max(minimum,label.fontWorld*c.zoom));
        if(label.fittedPosition&&label.text.length===2)fontSize=Math.min(width/label.textUnits,phone?6:11,Math.max(phone?5.5:8,label.fontWorld*c.zoom));
        return{id:cell.id,...p,text:label.text,color:label.color,width,fontSize,angle:Math.atan2(end.y-p.y,end.x-p.x)*180/Math.PI};
      })),
      logo:projectOverlay(phone?-3.15:-3.05,phone?2.5:2.9),roll:projectOverlay(.9,3.5),board:final,
      cells:cells.map((cell,i)=>{const p=projection(cell.center[0],.02,cell.center[1]),a=projection(0,.02,0),b=projection(cell.v[0]*surfaces[i].fontWorld,.02,cell.v[1]*surfaces[i].fontWorld);return{id:cell.id,...p,fontPixels:Math.hypot(a.x-b.x,a.y-b.y),polygon:cell.polygon.map(([x,z])=>projection(x,.02,z))}})
    };
    onProject(result);gl.domElement.dataset.ready='true';
  },[camera,size.width,size.height,surfaces,onProject,gl]);
  useEffect(()=>{const pmrem=new PMREMGenerator(gl),room=new RoomEnvironment(),target=pmrem.fromScene(room,.04);scene.environment=target.texture;scene.environmentIntensity=.55;room.dispose();pmrem.dispose();return()=>target.dispose()},[gl,scene]);
  useFrame(()=>{
    (window as any).__referenceStyleRender={width:size.width,height:size.height,drawCalls:gl.info.render.calls,tiles:scene.children.filter(c=>c.name.startsWith('REFERENCE_TILE_')).length};
  });
  return null;
}
function Cell({cell,surface,onSelect}:{cell:ReferenceCell;surface:CellSurface;onSelect?:()=>void}){
  const geometry=useMemo(()=>surfaceGeometry(cell.polygon,surface),[cell,surface]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh name={`REFERENCE_TILE_${cell.id}`} geometry={geometry} rotation={[-Math.PI/2,0,0]} position={[0,.021,0]} onClick={e=>{e.stopPropagation();onSelect?.()}}><meshBasicMaterial map={surface.texture} alphaTest={.4} toneMapped={false}/></mesh>;
}
function Scene({surfaces,onProject,onSelect}:{surfaces:CellSurface[];onProject:(p:Projection)=>void;onSelect?:(id:string)=>void}){
  const {size}=useThree(),diceSize=size.height<=500?.72:.83;
  const [wood,center]=useTexture([woodArt,centerArt]);
  const preparedWood=useMemo(()=>{const t=wood.clone();t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(.12,.12);t.colorSpace=SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;return t},[wood]);
  const foundation=useMemo(()=>new ExtrudeGeometry(shapeOf(REFERENCE_OUTLINE),{depth:.34,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.055,bevelThickness:.045}),[]);
  const trim=useMemo(()=>surfaceGeometry(REFERENCE_OUTLINE.map(([x,z])=>[x*.998,z*.998])),[]);
  const centerGeometry=useMemo(()=>{const image=center.image as HTMLImageElement;return surfaceGeometry(REFERENCE_OUTLINE.map(([x,z])=>[x*(INNER_RATIO-.005),z*(INNER_RATIO-.005)]),undefined,INNER_RATIO-.005,image.width/image.height)},[center]);
  useEffect(()=>{center.colorSpace=SRGBColorSpace;center.anisotropy=8;center.minFilter=LinearMipmapLinearFilter;return()=>{preparedWood.dispose();foundation.dispose();trim.dispose();centerGeometry.dispose()}},[center,preparedWood,foundation,trim,centerGeometry]);
  return <>
    <Rig surfaces={surfaces} onProject={onProject}/>
    <ambientLight intensity={1.3}/><directionalLight position={[-7,15,5]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-normalBias={.025}/>
    <mesh geometry={foundation} rotation={[-Math.PI/2,0,0]} position={[0,-.38,0]} castShadow receiveShadow><meshStandardMaterial color="#d2c9ad" map={preparedWood} roughness={.7}/></mesh>
    <mesh geometry={trim} rotation={[-Math.PI/2,0,0]} position={[0,.006,0]}><meshStandardMaterial color="#c99438" metalness={.48} roughness={.4}/></mesh>
    <mesh geometry={centerGeometry} rotation={[-Math.PI/2,0,0]} position={[0,.015,0]} receiveShadow><meshBasicMaterial map={center} toneMapped={false}/></mesh>
    {cells.map((cell,i)=><Cell key={cell.id} cell={cell} surface={surfaces[i]} onSelect={()=>onSelect?.(cell.id)}/>)}
    {([['CE','avatar-4','#13a26d'],['MG','avatar-1','#ee7741']] as const).map(([id,avatarId,color])=>{const cell=cells.find(c=>c.id===id)!,[x,z]=outlineAt(cell.angle,INNER_RATIO-.035);return <group key={id} position={[x,.04,z]}><mesh position={[0,.035,0]}><cylinderGeometry args={[.21,.24,.07,40]}/><meshStandardMaterial color={color} metalness={.3} roughness={.35}/></mesh><group scale={1.35} rotation={[0,-.2,0]}><AvatarFigure avatarId={avatarId} color={color}/></group></group>})}
    <group name="REFERENCE_DICE_A" position={[-.55,diceSize/2+.055,-.3]} rotation={[0,.3,0]}><DiceVisual face={3} size={diceSize}/></group><group name="REFERENCE_DICE_B" position={[.55,diceSize/2+.055,-.3]} rotation={[0,-.2,0]}><DiceVisual face={5} size={diceSize}/></group>
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.46,0]}><planeGeometry args={[60,60]}/><shadowMaterial transparent opacity={.22}/></mesh>
  </>;
}
/** Standalone art-review renderer. Values and actions are supplied by the host. */
export function ReferenceStyleBoard({players,rentLabels,taxPoolLabel,onSelect,onRoll,onControl}:Props){
  const [surfaces,setSurfaces]=useState<CellSurface[]|null>(null),[projection,setProjection]=useState<Projection|null>(null),[error,setError]=useState<string|null>(null);
  useEffect(()=>{let active=true;let owned:CellSurface[]=[];Promise.all(cells.map(c=>createCellSurface(c,rentLabels[c.id]??'—',taxPoolLabel))).then(result=>{owned=result;if(active)setSurfaces(result);else result.forEach(s=>s.texture.dispose())}).catch(e=>setError(String(e)));return()=>{active=false;owned.forEach(s=>s.texture.dispose())}},[rentLabels,taxPoolLabel]);
  useEffect(()=>{if(projection)(window as any).__referenceStyleReview={projection,ids:cells.map(c=>c.id),models:[],scope:'Standalone 3D art review, no connected game'}},[projection]);
  return <section className="reference-style-board" aria-label="Tabuleiro 3D — revisão da direção de arte">
    {error&&<p role="alert">{error}</p>}
    {surfaces&&<Canvas orthographic shadows dpr={[1,3]} camera={{position:[0,14.5,17],zoom:40,near:.1,far:100}} gl={{alpha:true,antialias:true,preserveDrawingBuffer:true}}><Suspense fallback={null}><Scene surfaces={surfaces} onProject={setProjection} onSelect={onSelect}/></Suspense></Canvas>}
    {projection&&<>
      <div className="reference-style-labels" aria-hidden="true">{projection.labels.map((label,i)=><span key={i} data-tile-label={label.id} data-side-state={label.id.length===2&&(cells.find(c=>c.id===label.id)?.side===1||cells.find(c=>c.id===label.id)?.side===3)||undefined} style={{left:label.x,top:label.y,width:label.width,fontSize:label.fontSize,color:label.color,transform:'translate(-50%,-50%) rotate('+label.angle+'deg)'}}><span className="reference-style-label-text">{label.text.startsWith('R$')?<><small>R$</small><b>{label.text.slice(2).trim()}</b></>:label.text}</span></span>)}</div>
      <img className="reference-style-logo" src={logo} alt="Império Urbano — Edição Brasil" style={{left:projection.logo.x,top:projection.logo.y,width:projection.logo.width}}/>
      <div className="reference-style-roll" style={{left:projection.roll.x,top:projection.roll.y,width:projection.roll.width}}><ApprovedRollButton onClick={onRoll}/></div>
      <div className="reference-style-accessible-cells">{cells.map(c=><button key={c.id} onClick={()=>onSelect?.(c.id)}>{c.id}; aluguel {rentLabels[c.id]??'não se aplica'}</button>)}</div>
    </>}
    <div className="reference-style-players">{players.slice(0,4).map((player,i)=><div key={player.id} data-seat={i}><ReferencePlayerCard {...player}/></div>)}</div>
    <div className="reference-style-controls"><ApprovedRoundControl kind="settings" label="Configurações" onClick={()=>onControl?.('settings')}/><ApprovedRoundControl kind="players" label="Jogadores" onClick={()=>onControl?.('players')}/><ApprovedRoundControl kind="sound" label="Som" onClick={()=>onControl?.('sound')}/></div>
  </section>;
}
