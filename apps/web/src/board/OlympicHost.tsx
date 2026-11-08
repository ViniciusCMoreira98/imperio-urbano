// Olympic host frame; server state still controls which property receives the marker.
import {useFrame,useThree} from '@react-three/fiber';
import {Line,useTexture} from '@react-three/drei';
import {useEffect,useMemo,useState} from 'react';
import {ExtrudeGeometry,MeshStandardMaterial,Path,Shape,ShapeGeometry,Vector2,type BufferGeometry} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {TilePlacement} from './layout';
import {insetOlympicContour,olympicLeaves,OLYMPIC_RELIEF,type OlympicPoint} from './olympicPresentation';
import {olympicFrameGrid} from './olympicFrame';
import frameArtwork from './board34/art/olympic-frame-v2.webp';

type OlympicHostProps={placement:TilePlacement;contour?:readonly OlympicPoint[]};
export function OlympicHost(props:OlympicHostProps){
 const grid=useMemo(()=>olympicFrameGrid(props.placement.index),[props.placement.index]);
 return grid?<OlympicFrame grid={grid} index={props.placement.index}/>:<OlympicLaurelRelief {...props}/>;
}
function OlympicFrame({grid,index}:{grid:NonNullable<ReturnType<typeof olympicFrameGrid>>;index:number}){
 const texture=useTexture(frameArtwork);
 return <group name="OLYMPIC_PROPERTY_FRAME" userData={{tileIndex:index,horizontal:grid.horizontal}}><mesh key={index} name="OLYMPIC_FRAME_ART" renderOrder={5} raycast={()=>undefined}>
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
