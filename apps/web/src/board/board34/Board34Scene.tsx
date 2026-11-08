import{Suspense,useDeferredValue,useEffect,useLayoutEffect,useMemo,useRef,type ReactNode}from'react';
import{Canvas,useThree,type ThreeEvent}from'@react-three/fiber';
import{useGLTF,useTexture}from'@react-three/drei';
import{BufferAttribute,CanvasTexture,DoubleSide,LinearFilter,LinearMipmapLinearFilter,Matrix4,Mesh,PerspectiveCamera,ShaderMaterial,SRGBColorSpace,Vector3,Vector4,type Object3D,type Texture}from'three';
import{CameraRig}from'../CameraRig';import type{BoardInsets,BoardFraming}from'../camera/tabletopViewport';import{FixedBoardViewport}from'../camera/FixedBoardViewport';import{applyFixedCamera,FIXED_CAMERA}from'../camera/fixedCamera';
import{DiceVisual}from'../../dice/DiceVisual';import type{DiceFace}from'../../dice/diceOrientation';
import{TabletopEnvironment}from'./TabletopEnvironment';import layout from'./visualLayout';
import{paintPanel}from'./panelProjection';
import{paintRentalPlaque}from'./rentalPlaque';
import{ownerHeaderRect,paintOwnerHeader}from'./ownerHeader';
import{tabletopViewport}from'../camera/tabletopViewport';
import{mobileCleanStudy,mobileSpaciousStudy,mobileRectangularStudy}from'../mobileStudy';
import{spaciousPoint}from'./spaciousLayout';
import{RectangularBoardStudy}from'./RectangularBoardStudy';

export{layout as board34Layout};
/** ownerColor: cor do dono; repinta a faixa do nome (engenharia, 07/11/2026). */
export interface BoardRentLabel{stateId:string;rentLabel:string;ownerColor?:string}
export interface Board34SceneProps{framing?:BoardFraming;insets?:BoardInsets;environment?:'wood'|'beach';selectedId?:string|null;onSelect?:(id:string)=>void;rentLabels?:BoardRentLabel[];taxPoolLabel?:string|null;diceValues?:[DiceFace,DiceFace]|null;children?:ReactNode}
export function board34TileAnchor(id:string){const tile=layout.tiles.find(t=>t.id===id);if(!tile)throw Error(`Casa desconhecida na cena de 34 casas: ${id}`);return tile.anchor;}
const nodes=new Set(layout.tiles.map(t=>t.modelNode));
function tileOf(object:Object3D,root:Object3D){for(let node:Object3D|null=object;node&&node!==root;node=node.parent)if(nodes.has(node.name))return node.name.slice(5);return null;}
function labelTexture(labels:BoardRentLabel[],taxPoolLabel:string|null,compact=false,clean=false){
 const c=document.createElement('canvas');c.width=3072;c.height=2048;const x=c.getContext('2d')!;x.scale(2,2);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff7d4';
 const values=new Map(labels.map(l=>[l.stateId,l.rentLabel]));
 for(const tile of layout.tiles){const owner=labels.find(l=>l.stateId===tile.id)?.ownerColor;if(clean||(!owner&&!compact))continue;if(!tile.panel.rent)continue;const rect=ownerHeaderRect(tile.panel,tile.id);paintPanel(x,tile.panel,ctx=>paintOwnerHeader(ctx,rect,tile.id,tile.label??tile.id,owner??'#e8eef5',compact),rect);}
 for(const tile of layout.tiles){const rect=tile.panel.rent,label=values.get(tile.id);if(clean||compact||!rect||label===undefined)continue;paintPanel(x,tile.panel,ctx=>{paintRentalPlaque(ctx,rect);let font=rect.height*.66;ctx.font=`900 ${font}px Arial,sans-serif`;while(ctx.measureText(label).width>rect.width*.83&&font>7){font-=.25;ctx.font=`900 ${font}px Arial,sans-serif`;}ctx.fillStyle='#fff5d3';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,rect.x+rect.width/2,rect.y+rect.height/2+.3);},rect);}
 const tax=layout.tiles.find(t=>t.id==='TAX')!;paintPanel(x,tax.panel,ctx=>{const rect=tax.panel.pool!;let size=14;const amount=taxPoolLabel??'—';ctx.font=`900 ${size}px Arial,sans-serif`;while(ctx.measureText(amount).width>rect.width*.88&&size>8){size-=.5;ctx.font=`900 ${size}px Arial,sans-serif`;}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=clean?'#173a44':'#ffe47b';ctx.fillText(amount,rect.x+rect.width/2,rect.y+rect.height*.70);},tax.panel.pool!);
 const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;texture.magFilter=LinearFilter;texture.minFilter=LinearMipmapLinearFilter;texture.generateMipmaps=true;return texture;
}
function material(atlas:Texture,overlay:Texture){return new ShaderMaterial({side:DoubleSide,toneMapped:false,uniforms:{atlas:{value:atlas},overlay:{value:overlay},highlight:{value:0}},vertexShader:'attribute vec3 sourceQ;varying vec3 q;void main(){q=sourceQ;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D atlas;uniform sampler2D overlay;uniform float highlight;varying vec3 q;void main(){vec2 uv=q.xy/q.z;vec4 a=texture2D(atlas,uv,-.5);vec4 b=texture2D(overlay,uv,-.5);gl_FragColor=vec4(mix(a.rgb,b.rgb,b.a)*(1.0+highlight),1.0);\n#include <colorspace_fragment>\n}'});}
function BoardModel({selectedId,onSelect,rentLabels=[],taxPoolLabel=null,framing}:Board34SceneProps){
 const {gl,size}=useThree();
 const large=(framing==='mobile-diamond'||tabletopViewport(size.width,size.height).scale*1536*gl.getPixelRatio()>3072)&&gl.capabilities.maxTextureSize>=6144;
 const clean=mobileCleanStudy&&framing==='mobile-diamond';
 const atlasUrl=useDeferredValue(clean?(mobileSpaciousStudy?'/models/board/board34-mobile-spacious-v1.webp':'/models/board/board34-mobile-clean-v1.webp'):large?layout.atlas.replace('.webp','-6k.webp'):layout.atlas);
 const {scene}=useGLTF(layout.model),atlas=useTexture(atlasUrl),hovered=useRef<string|null>(null);
 const labelsKey=JSON.stringify([rentLabels,taxPoolLabel,framing,clean]);
 const overlay=useMemo(()=>labelTexture(rentLabels,taxPoolLabel,framing==='mobile-diamond',clean),[labelsKey]);
 useEffect(()=>()=>overlay.dispose(),[overlay]);
 const prepared=useMemo(()=>{
  atlas.colorSpace=SRGBColorSpace;atlas.anisotropy=gl.capabilities.getMaxAnisotropy();atlas.generateMipmaps=true;atlas.minFilter=LinearMipmapLinearFilter;atlas.magFilter=LinearFilter;atlas.needsUpdate=true;
  const model=scene.clone(true);model.updateMatrixWorld(true);
  const camera=new PerspectiveCamera();applyFixedCamera(camera);const projector=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const materials:ShaderMaterial[]=[],geometries:Mesh['geometry'][]=[],surfaceMaterials:{dispose:()=>void}[]=[];
  model.traverse(object=>{
   if(!(object instanceof Mesh))return;
   if(mobileSpaciousStudy){const id=tileOf(object,model)??object.name;if(id==='CENTER_ART'||layout.tiles.some(t=>t.id===id)){object.geometry=object.geometry.clone();geometries.push(object.geometry);const positions=object.geometry.getAttribute('position'),inverse=new Matrix4().copy(object.matrixWorld).invert();for(let i=0;i<positions.count;i++){const world=new Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld),p=spaciousPoint(id,[world.x,world.y,world.z]);world.set(...p).applyMatrix4(inverse);positions.setXYZ(i,world.x,world.y,world.z)}object.geometry.computeVertexNormals();object.geometry.computeBoundingSphere();}}

   const originals=(Array.isArray(object.material)?object.material:[object.material]).map(m=>{if(!clean||mobileSpaciousStudy||!['BeveledGold','WalnutBody'].includes(m.name))return m;const next=m.clone() as any;next.color.set(m.name==='BeveledGold'?'#c8d2c6':'#8b9f93');next.metalness=0;next.roughness=.85;surfaceMaterials.push(next);return next;});
   if(clean)object.material=Array.isArray(object.material)?originals:originals[0];
   if(originals.some(m=>m.name==='TileFace'||m.name==='CenterArtwork')){
    object.geometry=object.geometry.clone();geometries.push(object.geometry);const p=object.geometry.getAttribute('position'),q=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const world=new Vector3().fromBufferAttribute(p,i).applyMatrix4(object.matrixWorld),clip=new Vector4(world.x,world.y,world.z,1).applyMatrix4(projector);q[i*3]=(clip.x+clip.w)/2;q[i*3+1]=(clip.y+clip.w)/2;q[i*3+2]=clip.w;}object.geometry.setAttribute('sourceQ',new BufferAttribute(q,3));
    const next=originals.map(m=>{if(m.name!=='TileFace'&&m.name!=='CenterArtwork')return m;const result=material(atlas,overlay);result.userData.tileId=tileOf(object,model);materials.push(result);return result;});object.material=Array.isArray(object.material)?next:next[0];
   }
   object.castShadow=true;object.receiveShadow=true;
  });return{model,materials,geometries,surfaceMaterials};
 },[scene,atlas,gl,clean]);
 useLayoutEffect(()=>{prepared.materials.forEach(m=>{m.uniforms.overlay.value=overlay;});},[prepared,overlay]);
 const highlight=(id:string|null)=>prepared.materials.forEach(m=>{const tile=m.userData.tileId;m.uniforms.highlight.value=tile&&tile===selectedId? .12:tile&&tile===id?.toString()? .04:0;});
 useEffect(()=>{highlight(hovered.current);},[selectedId,prepared]);
 useEffect(()=>()=>{prepared.materials.forEach(m=>m.dispose());prepared.surfaceMaterials.forEach(m=>m.dispose());prepared.geometries.forEach(g=>g.dispose());document.body.style.cursor='';},[prepared]);
 useEffect(()=>{if(import.meta.env.DEV){const inspect=()=>({model:prepared.model,layout,printedFaces:prepared.materials.filter(m=>m.userData.tileId).length,rentalStates:rentLabels.map(l=>l.stateId),viewport:{width:size.width,height:size.height,dpr:gl.getPixelRatio(),large},atlas:{url:atlasUrl,width:(atlas.image as HTMLImageElement).width,height:(atlas.image as HTMLImageElement).height}});(window as any).__board34=inspect;return()=>{delete(window as any).__board34;};}},[prepared,labelsKey,atlasUrl,size.width,size.height,large,gl]);
 const click=(event:ThreeEvent<MouseEvent>)=>{const id=tileOf(event.object,prepared.model);if(id){event.stopPropagation();onSelect?.(id);}};
 const move=(event:ThreeEvent<PointerEvent>)=>{const id=tileOf(event.object,prepared.model);hovered.current=id;highlight(id);document.body.style.cursor=id?'pointer':'';};
 return <primitive object={prepared.model} onClick={click} onPointerMove={move} onPointerOut={()=>{hovered.current=null;highlight(null);document.body.style.cursor='';}}/>;
}
/** A arte projetada usa shader próprio; este receptor separado dá contato real às peças no miolo. */
function CenterShadows(){
 const points=layout.layers.center.polygon,xs=points.map(p=>p[0]),zs=points.map(p=>p[2]);
 const left=Math.min(...xs),right=Math.max(...xs),back=Math.min(...zs),front=Math.max(...zs);
 return <mesh name="CENTER_CONTACT_SHADOW" position={[(left+right)/2,layout.layers.center.surfaceY+.001,(back+front)/2]} rotation={[-Math.PI/2,0,0]} receiveShadow>
  <planeGeometry args={[right-left-.12,front-back-.12]}/><shadowMaterial transparent opacity={.30} depthWrite={false}/>
 </mesh>;
}
/** Cena real de 34 casas. Estado, regras, comandos e peças vêm do host. */
export function Board34Scene({children,diceValues=null,environment='wood',framing='standard',insets,...props}:Board34SceneProps){if(mobileRectangularStudy)return <RectangularBoardStudy {...props} framing={framing} insets={insets} taxPoolLabel={props.taxPoolLabel} children={children}/>;return <FixedBoardViewport expanded><Canvas shadows dpr={[1,2]} camera={{position:FIXED_CAMERA.position as[number,number,number],fov:FIXED_CAMERA.fov,far:FIXED_CAMERA.far}}>
 <color attach="background" args={['#5e321e']}/><ambientLight intensity={.75}/><directionalLight position={[-8,18,8]} intensity={1.8} color="#fff0dc" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-far={60} shadow-normalBias={.03} shadow-bias={-.0001}/>
 <Suspense fallback={null}><TabletopEnvironment theme={environment}/><BoardModel {...props} framing={framing}/><CenterShadows/>{diceValues&&layout.dice.map((die,i)=><group name={`BOARD_STATIC_DIE_${i}`} key={i} position={die.position as[number,number,number]} rotation={[0,die.yaw,0]}><DiceVisual face={diceValues[i]} size={die.size}/></group>)}{children}</Suspense><CameraRig expanded framing={framing} insets={insets}/>
 </Canvas><section aria-label="Valores do tabuleiro" style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)',whiteSpace:'nowrap'}}>{props.rentLabels?.map(label=><p key={label.stateId} data-board34-rent={label.stateId}>{label.stateId}: {label.rentLabel}</p>)}<p data-board34-tax>Fundo da Taxa: {props.taxPoolLabel??'saldo indisponível'}</p></section></FixedBoardViewport>;}
