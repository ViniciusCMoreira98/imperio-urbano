import{useEffect,useLayoutEffect,useMemo}from'react';
import{useThree}from'@react-three/fiber';
import{useGLTF,useTexture}from'@react-three/drei';
import{CanvasTexture,Euler,Mesh,MirroredRepeatWrapping,PMREMGenerator,SRGBColorSpace,Vector3}from'three';
import{DecalGeometry}from'three/examples/jsm/geometries/DecalGeometry.js';
import{RoomEnvironment}from'three/examples/jsm/environments/RoomEnvironment.js';
import woodUrl from './art/table-wood-v1.png';

function StudioReflections(){
 const{gl,scene}=useThree();
 useLayoutEffect(()=>{
  const room=new RoomEnvironment(),generator=new PMREMGenerator(gl),target=generator.fromScene(room,.04);
  const previous=scene.environment,previousIntensity=scene.environmentIntensity;scene.environment=target.texture;scene.environmentIntensity=.5;room.dispose();generator.dispose();
  return()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;target.dispose();};
 },[gl,scene]);return null;
}
function DecorModel({name,position,rotation=0}:{name:'plant'|'mug';position:[number,number,number];rotation?:number}){
 const{scene}=useGLTF(`/models/decor/${name}-v3.glb`);
 const brand=useTexture('/models/decor/brand-v3.webp');brand.colorSpace=SRGBColorSpace;
 const model=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o instanceof Mesh){o.castShadow=true;o.receiveShadow=true;}});return copy;},[scene]);
 const decal=useMemo(()=>{if(name!=='mug')return null;model.updateMatrixWorld(true);const mesh=model.getObjectByProperty('isMesh',true)as Mesh;return new DecalGeometry(mesh,new Vector3(-.22,.62,.45),new Euler(0,0,0),new Vector3(.73,.49,.25));},[model,name]);
 useEffect(()=>()=>decal?.dispose(),[decal]);
 return <group name={`TABLETOP_${name.toUpperCase()}`} position={position} rotation={[0,rotation,0]} scale={name==='plant'?1.15:1}><primitive object={model}/>{decal&&<mesh geometry={decal}><meshBasicMaterial map={brand} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} toneMapped={false}/></mesh>}{name==='mug'&&<group position={[-.2676,1.14,0]}><mesh><cylinderGeometry args={[.475,.475,.008,64]}/><meshPhongMaterial color="#30160b" specular="#9a6a3a" shininess={90}/></mesh><mesh position={[0,.005,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.462,.009,6,64]}/><meshStandardMaterial color="#b47c40" roughness={.5}/></mesh></group>}</group>;
}
function coinTexture(){
 const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d')!;const g=x.createRadialGradient(180,130,20,256,256,260);g.addColorStop(0,'#fff8b2');g.addColorStop(.5,'#f7c54d');g.addColorStop(1,'#aa681b');x.fillStyle=g;x.fillRect(0,0,512,512);x.strokeStyle='#ae731d';x.lineWidth=8;for(const r of[211,231]){x.beginPath();x.arc(256,256,r,0,Math.PI*2);x.stroke();}x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?70:145,px=256+Math.cos(a)*r,py=256+Math.sin(a)*r;i?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();x.shadowColor='#fff3af';x.shadowOffsetY=4;x.fillStyle='#e8b43f';x.fill();x.stroke();const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;
}
export function TabletopEnvironment(){
 const source=useTexture(woodUrl);
 const texture=useMemo(()=>{const map=source.clone();map.colorSpace=SRGBColorSpace;map.wrapS=map.wrapT=MirroredRepeatWrapping;map.repeat.set(9,9);map.anisotropy=8;return map;},[source]);
 const coin=useMemo(coinTexture,[]);useEffect(()=>()=>{texture.dispose();coin.dispose();},[texture,coin]);
 return <group name="TABLETOP_ENVIRONMENT"><StudioReflections/>
  <mesh position={[0,-.505,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[120,120]}/><meshBasicMaterial map={texture} color="#b4a18e" toneMapped={false}/></mesh>
  <mesh position={[0,-.504,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[120,120]}/><shadowMaterial transparent opacity={.24}/></mesh>
  <DecorModel name="plant" position={[-7.0,-.505,-3.0]} rotation={.3}/>
  <DecorModel name="mug" position={[7.0,-.505,-4.5]} rotation={-.12}/>
  <group name="DECOR_COINS" position={[-7.05,-.47,-.1]}>{[0,1].map(stack=><group key={stack} position={[stack*.43,0,stack*.20]}>{Array.from({length:3+stack*2},(_,i)=><group key={i} position={[0,i*.058,0]}><mesh castShadow><cylinderGeometry args={[.24,.24,.052,48]}/><meshStandardMaterial attach="material-0" color="#e9b633" metalness={.7} roughness={.24}/><meshStandardMaterial attach="material-1" map={coin} metalness={.45} roughness={.28}/><meshStandardMaterial attach="material-2" color="#d49a22" metalness={.6}/></mesh><mesh position={[0,.022,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.229,.007,5,48]}/><meshStandardMaterial color="#ffe6a0" metalness={.7} roughness={.23}/></mesh></group>)}</group>)}</group>
 </group>;
}
