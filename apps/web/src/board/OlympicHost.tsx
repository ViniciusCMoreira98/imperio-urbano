// Olympic host frame; server state still controls which property receives the marker.
import {useFrame,useThree} from '@react-three/fiber';
import {Line,useTexture} from '@react-three/drei';
import {useEffect,useMemo,useState} from 'react';
import {CanvasTexture,ExtrudeGeometry,MeshStandardMaterial,Path,Shape,ShapeGeometry,Vector2,type BufferGeometry,type Texture} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {TilePlacement} from './layout';
import {insetOlympicContour,olympicLeaves,OLYMPIC_RELIEF,type OlympicPoint} from './olympicPresentation';
import {OLYMPIC_FRAME_TEXT,olympicFrameGrid} from './olympicFrame';
import frameArtwork from './board34/art/olympic-frame-v3.webp';

/** multiplier: o multiplicador atual do aluguel, escrito à parte (o aluguel da casa já vem multiplicado). */
type OlympicHostProps={placement:TilePlacement;contour?:readonly OlympicPoint[];multiplier?:number};
export function OlympicHost(props:OlympicHostProps){
 const grid=useMemo(()=>olympicFrameGrid(props.placement.index),[props.placement.index]);
 return grid?<OlympicFrame grid={grid} index={props.placement.index} multiplier={props.multiplier}/>:<OlympicLaurelRelief {...props}/>;
}

/** A arte não traz texto: "SEDE OLÍMPICA" vai na placa e o multiplicador no trilho de baixo, desenhados aqui. */
function useLabelledFrame(base:Texture,multiplier?:number){
 const texture=useMemo(()=>{
  const image=base.image as CanvasImageSource&{width:number;height:number},canvas=document.createElement('canvas');
  canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d')!,w=canvas.width,h=canvas.height,{plate,multiplier:pill}=OLYMPIC_FRAME_TEXT;
  ctx.drawImage(image,0,0,w,h);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`900 ${Math.round(plate.size*h)}px Arial, sans-serif`;
  ctx.shadowColor='#001349';ctx.shadowBlur=h*.004;ctx.shadowOffsetY=h*.002;ctx.fillStyle='#fff1b3';
  ctx.fillText('SEDE OLÍMPICA',plate.x*w,plate.y*h,plate.maxWidth*w);
  if(multiplier&&multiplier>1){
   const text=`ALUGUEL ×${multiplier}`,size=Math.round(pill.size*h);
   ctx.font=`900 ${size}px Arial, sans-serif`;
   const pw=ctx.measureText(text).width+size*1.1,ph=size*1.45,px=pill.x*w-pw/2,py=pill.y*h-ph/2;
   ctx.shadowColor='transparent';ctx.fillStyle='#f4df90';ctx.strokeStyle='#8a6510';ctx.lineWidth=h*.003;
   ctx.beginPath();ctx.roundRect(px,py,pw,ph,ph*.3);ctx.fill();ctx.stroke();
   ctx.fillStyle='#5e4206';ctx.fillText(text,pill.x*w,pill.y*h+size*.04);
  }
  const t=new CanvasTexture(canvas);t.colorSpace=base.colorSpace;t.anisotropy=base.anisotropy;t.needsUpdate=true;return t;
 },[base,multiplier]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return texture;
}

function OlympicFrame({grid,index,multiplier}:{grid:NonNullable<ReturnType<typeof olympicFrameGrid>>;index:number;multiplier?:number}){
 const texture=useLabelledFrame(useTexture(frameArtwork),multiplier);
 return <group name="OLYMPIC_PROPERTY_FRAME" userData={{tileIndex:index,horizontal:grid.horizontal,orientation:grid.orientation}}><mesh key={index} name="OLYMPIC_FRAME_ART" renderOrder={5} raycast={()=>undefined}>
  <bufferGeometry><bufferAttribute attach="attributes-position" args={[grid.positions,3]}/><bufferAttribute attach="attributes-uv" args={[grid.uvs,2]}/><bufferAttribute attach="index" args={[grid.indices,1]}/></bufferGeometry>
  <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} side={2}/>
 </mesh></group>;
}

function ring(points:readonly OlympicPoint[],outer:number,inner:number){
 const outline=insetOlympicContour(points,outer),hole=insetOlympicContour(points,inner),shape=new Shape(outline.map(([x,z])=>new Vector2(x,-z)));
 const path=new Path(hole.map(([x,z])=>new Vector2(x,-z)));shape.holes.push(path);return shape;
}
function relief(shape:Shape){const g=new ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:1,steps:1,curveSegments:5});g.rotateX(-Math.PI/2);g.translate(0,.016,0);return g;}

function OlympicLaurelRelief({placement,contour}:OlympicHostProps){
 const viewportHeight=useThree(state=>state.size.height);
 const [reduced,setReduced]=useState(()=>typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 const assets=useMemo(()=>{
  const w=placement.width/2,d=placement.depth/2,points=contour??[[-w,-d],[w,-d],[w,d],[-w,d]];
  const parts:BufferGeometry[]=[relief(ring(points,OLYMPIC_RELIEF.outerInset,OLYMPIC_RELIEF.goldInnerInset))];
  for(const leaf of olympicLeaves(points)){
   const length=OLYMPIC_RELIEF.leafLength/2,width=OLYMPIC_RELIEF.leafWidth;
   const shape=new Shape();shape.moveTo(-length,0);shape.quadraticCurveTo(0,width,length,0);shape.quadraticCurveTo(0,-width,-length,0);
   const g=relief(shape);g.rotateY(-leaf.angle);g.translate(leaf.x,.003,leaf.z);parts.push(g);
  }
  const goldGeometry=mergeGeometries(parts,false)!;parts.forEach(g=>g.dispose());
  const greenGeometry=new ShapeGeometry(ring(points,OLYMPIC_RELIEF.greenOuterInset,OLYMPIC_RELIEF.greenInnerInset));greenGeometry.rotateX(-Math.PI/2);greenGeometry.translate(0,.012,0);
  const gold=new MeshStandardMaterial({color:'#edc66c',metalness:.74,roughness:.34,emissive:'#9d6b16',emissiveIntensity:.17});
  const green=new MeshStandardMaterial({color:'#16bd76',metalness:.25,roughness:.48,emissive:'#06744e',emissiveIntensity:.16});
  const inset=insetOlympicContour(points,.032),thread=[...inset,inset[0]].map(([x,z])=>[x,.029,z] as [number,number,number]);
  return{goldGeometry,greenGeometry,gold,green,thread};
 },[placement.width,placement.depth,contour]);
 useEffect(()=>()=>{assets.goldGeometry.dispose();assets.greenGeometry.dispose();assets.gold.dispose();assets.green.dispose();},[assets]);
 useEffect(()=>{assets.gold.emissiveIntensity=.17;assets.green.emissiveIntensity=.16;},[reduced,assets]);
 useFrame(({clock})=>{if(reduced)return;const pulse=Math.sin(clock.elapsedTime*Math.PI/2);assets.gold.emissiveIntensity=.17+pulse*.045;assets.green.emissiveIntensity=.16+pulse*.035;});
 return <group name="OLYMPIC_LAUREL_RELIEF" userData={{tileIndex:placement.index}}><mesh name="OLYMPIC_GOLD_LAURELS" geometry={assets.goldGeometry} material={assets.gold} raycast={()=>undefined}/><mesh name="OLYMPIC_GREEN_INLAY" geometry={assets.greenGeometry} material={assets.green} raycast={()=>undefined}/><Line name="OLYMPIC_GOLD_THREAD" points={assets.thread} color="#ffe078" lineWidth={Math.min(1.4,Math.max(.55,viewportHeight/520))} raycast={()=>undefined}/></group>;
}
useTexture.preload(frameArtwork);
