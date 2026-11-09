import{Suspense,useEffect,useMemo}from'react';
import{Canvas,useLoader,type ThreeEvent}from'@react-three/fiber';
import{CanvasTexture,ImageLoader,LinearFilter,LinearMipmapLinearFilter,SRGBColorSpace}from'three';
import layout from'./visualLayout';
import type{Board34SceneProps}from'./Board34Scene';
import{CameraRig}from'../CameraRig';
import{FixedBoardViewport}from'../camera/FixedBoardViewport';
import{TabletopEnvironment}from'./TabletopEnvironment';
import centerUrl from'./art/center-brasil-v2.png';
const files=import.meta.glob('./art/v3/*.png',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const artUrl=(name:string)=>files[Object.keys(files).find(p=>p.endsWith('/'+name+'.png'))!];
const keyFor:Record<string,string>={START:'arrow',OLYMPICS:'flame',REST:'rest',AIRPORT:'airport',EVENT:'event',TAX:'tax',SAQUE:'chest'};
function picture(ctx:CanvasRenderingContext2D,image:CanvasImageSource&{width:number;height:number},x:number,y:number,w:number,h:number,flip:boolean){
 const scale=Math.min(w/image.width,h/image.height);ctx.save();ctx.translate(x+w/2,y+h/2);if(flip)ctx.rotate(Math.PI);ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);ctx.restore();
}
function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,font:number,maxWidth:number,flip:boolean,color='#19353d'){
 ctx.save();ctx.translate(x,y);if(flip)ctx.rotate(Math.PI);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`700 ${font}px Arial,sans-serif`;while(ctx.measureText(value).width>maxWidth&&font>14){font-=1;ctx.font=`700 ${font}px Arial,sans-serif`}ctx.fillText(value,0,0);ctx.restore();
}
function Face({tile,label,onSelect,selected,tax}:{tile:typeof layout.tiles[number];label?:string;tax?:string|null;onSelect?:Board34SceneProps['onSelect'];selected:boolean}){
 const property=tile.type==='PROPERTY',source=useLoader(ImageLoader,artUrl(property?tile.id.toLowerCase()+'-board-v3':keyFor[tile.type]+'-v3'));
 const map=useMemo(()=>{
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!,w=Math.round((tile.anchor.width-.075)*384),h=Math.round((tile.anchor.depth-.075)*384),flip=tile.side==='north'||tile.side==='east';canvas.width=w;canvas.height=h;
  ctx.fillStyle=property?'#fcf4df':tile.type==='START'||tile.type==='SAQUE'?'#0b6841':tile.type==='EVENT'||tile.type==='TAX'?'#ffdf85':'#124a80';ctx.fillRect(0,0,w,h);
  if(property){
   picture(ctx,source,w*.05,h*.25,w*.9,h*.37,flip);
   text(ctx,tile.id,w/2,h*.69,132,w*.85,flip);
   ctx.fillStyle='#eee6cf';ctx.fillRect(0,h*.78,w,h*.22);ctx.fillStyle='#c1ac79';ctx.fillRect(0,h*.78,w,2);
   if(label)text(ctx,label.replace(/^R\$\s*/,''),w/2,h*.89,174,w*.88,flip);
  }else{
   picture(ctx,source,w*.12,h*.12,w*.76,h*.5,flip);
   text(ctx,tile.label.toLocaleUpperCase('pt-BR'),w/2,h*.72,174,w*.85,flip,tile.type==='EVENT'||tile.type==='TAX'?'#45321d':'#fff5da');
   if(tile.type==='TAX'&&tax)text(ctx,tax,w/2,h*.9,54,w*.8,flip,'#45321d');
  }
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter;texture.anisotropy=8;return texture;
 },[source,tile,label,tax]);
 useEffect(()=>()=>map.dispose(),[map]);
 const click=(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onSelect?.(tile.id)};
 const a=tile.anchor;
 return <group position={[a.x,0,a.z]} rotation={[0,a.rotationY,0]} name={`RECT_TILE_${tile.id}`}>
  <mesh position={[0,.04,0]} onClick={click}><boxGeometry args={[a.width-.04,.08,a.depth-.04]}/><meshStandardMaterial color={selected?'#ffe39c':'#d6bc7d'} roughness={.65}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.081,0]} onClick={click} userData={{nativeFace:true,id:tile.id,sourceWidth:source.width,sourceHeight:source.height,faceWidth:a.width-.075,faceDepth:a.depth-.075,textureWidth:(map.image as HTMLCanvasElement).width,textureHeight:(map.image as HTMLCanvasElement).height}}><planeGeometry args={[a.width-.075,a.depth-.075]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
 </group>;
}
function Centre(){
 const source=useLoader(ImageLoader,centerUrl),map=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#177348';ctx.fillRect(0,0,2048,2048);picture(ctx,source,0,0,2048,2048,false);const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;return t;
 },[source]);useEffect(()=>()=>map.dispose(),[map]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,.035,0]}><planeGeometry args={[7.99,7.99]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;
}
export function RectangularBoardStudy({children,framing='mobile-diamond',insets,rentLabels=[],selectedId,onSelect,taxPoolLabel}:Board34SceneProps){
 return <FixedBoardViewport expanded><Canvas shadows dpr={[1,3]} camera={{fov:20,far:250}}>
  <ambientLight intensity={.85}/><directionalLight position={[-8,18,8]} intensity={1.6} color="#fff1dc"/>
  <Suspense fallback={null}><TabletopEnvironment theme="beach"/>
   <mesh position={[0,-.15,0]}><boxGeometry args={[14.35,.25,14.35]}/><meshStandardMaterial color="#67452c" roughness={.6}/></mesh>
   <mesh name="NATIVE_GOLD_TRIM" position={[0,-.005,0]}><boxGeometry args={[14.22,.04,14.22]}/><meshStandardMaterial color="#c5a35c" metalness={.4} roughness={.45}/></mesh>
   <Centre/>{layout.tiles.map(tile=><Face key={tile.id} tile={tile} label={rentLabels.find(l=>l.stateId===tile.id)?.rentLabel} tax={taxPoolLabel} selected={selectedId===tile.id} onSelect={onSelect}/>)}{children}
  </Suspense><CameraRig expanded framing={framing} insets={insets}/><StudyInspector/>
 </Canvas><section aria-label="Valores do tabuleiro" style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)'}}>{rentLabels.map(label=><p key={label.stateId} data-board34-rent={label.stateId}>{label.stateId}: {label.rentLabel}</p>)}<p data-board34-tax>Fundo da Taxa: {taxPoolLabel??'saldo indisponível'}</p></section></FixedBoardViewport>;
}
function StudyInspector(){useEffect(()=>{const inspect=()=>({layout,atlas:{width:0,height:0,url:'native-per-tile'},viewport:{dpr:window.devicePixelRatio},nativeRectangles:true});(window as any).__board34=inspect;return()=>{delete(window as any).__board34}},[]);return null;}
