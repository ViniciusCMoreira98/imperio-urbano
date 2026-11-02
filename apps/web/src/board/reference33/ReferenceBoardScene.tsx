import {Suspense,useEffect,useMemo,useRef,type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import {useGLTF,useTexture} from '@react-three/drei';
import {BufferAttribute,CanvasTexture,DoubleSide,LinearFilter,Matrix4,Mesh,PerspectiveCamera,ShaderMaterial,SRGBColorSpace,Vector3,Vector4,type Object3D,type Texture} from 'three';
import {CameraRig} from '../CameraRig';
import {FixedBoardViewport} from '../camera/FixedBoardViewport';
import {applyFixedCamera,FIXED_CAMERA} from '../camera/fixedCamera';
import {WoodenTableScene} from '../WoodenTableScene';
import {DiceVisual} from '../../dice/DiceVisual';
import type {DiceFace} from '../../dice/diceOrientation';
import referenceUrl from '../../../../../assets/board/tabuleiro-brasil-alvo.png?url';
import layout from './layout.json';

export {layout as reference33Layout};
export type ReferenceTileId=(typeof layout.tiles)[number]['id'];
export function referenceTileAnchor(id:ReferenceTileId){const tile=layout.tiles.find(t=>t.id===id);if(!tile)throw new Error(`Casa visual desconhecida: ${id}`);return tile.anchor;}

function projectedMaterial(texture:Texture,mask:Texture|null=null){
  return new ShaderMaterial({uniforms:{artwork:{value:texture},highlight:{value:0},artMask:{value:mask??texture},masked:{value:mask?1:0}},side:DoubleSide,toneMapped:false,
    vertexShader:'attribute vec3 sourceQ; varying vec3 vSourceQ; void main(){vSourceQ=sourceQ;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform sampler2D artwork; uniform sampler2D artMask; uniform float masked; uniform float highlight; varying vec3 vSourceQ; void main(){vec2 uv=vSourceQ.xy/vSourceQ.z;if(masked>0.5&&texture2D(artMask,uv).r<0.5)discard;vec4 art=texture2D(artwork,uv);gl_FragColor=vec4(art.rgb*(1.0+highlight),art.a);\n#include <colorspace_fragment>\n}'
  });
}
const TILE_NODES=new Set(layout.tiles.map(tile=>tile.modelNode));
function tileId(object:Object3D,root:Object3D):string|null{for(let current:Object3D|null=object;current&&current!==root;current=current.parent)if(TILE_NODES.has(current.name))return current.name.slice(5);return null;}

function Model({selectedId,onSelect}:{selectedId?:string|null;onSelect?:(id:string)=>void}){
  const {scene}=useGLTF(layout.model);
  const texture=useTexture(referenceUrl);
  const highlighted=useRef<string|null>(null);
  const prepared=useMemo(()=>{
    texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;
    const model=scene.clone(true);model.updateMatrixWorld(true);
    const maskCanvas=document.createElement('canvas');maskCanvas.width=1536;maskCanvas.height=1024;
    const maskContext=maskCanvas.getContext('2d')!;maskContext.fillStyle='#fff';maskContext.fillRect(0,0,1536,1024);maskContext.fillStyle='#000';
    for(const polygon of [...layout.tiles.map(tile=>tile.pixels),layout.layers.center.pixels]){maskContext.beginPath();polygon.forEach(([x,y],i)=>i?maskContext.lineTo(x,y):maskContext.moveTo(x,y));maskContext.closePath();maskContext.fill();}
    const gapMask=new CanvasTexture(maskCanvas);gapMask.minFilter=gapMask.magFilter=LinearFilter;gapMask.generateMipmaps=false;
    const camera=new PerspectiveCamera();applyFixedCamera(camera);
    const projector=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    const ownedMaterials:ShaderMaterial[]=[];const ownedGeometry:Mesh['geometry'][]=[];
    model.traverse(object=>{
      if(!(object instanceof Mesh))return;
      const oldMaterials=Array.isArray(object.material)?object.material:[object.material];
      const houseId=tileId(object,model);
      const projectMaterial=(name:string)=>name==='PrintedArtwork'||(houseId!==null&&name==='GoldSides');
      if(oldMaterials.some(material=>projectMaterial(material.name))){
        object.geometry=object.geometry.clone();ownedGeometry.push(object.geometry);
        const positions=object.geometry.getAttribute('position');const q=new Float32Array(positions.count*3);
        for(let i=0;i<positions.count;i++){
          const world=new Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);
          const clip=new Vector4(world.x,world.y,world.z,1).applyMatrix4(projector);
          q[i*3]=(clip.x+clip.w)/2;q[i*3+1]=(clip.y+clip.w)/2;q[i*3+2]=clip.w;
        }
        object.geometry.setAttribute('sourceQ',new BufferAttribute(q,3));
        const materials=oldMaterials.map(material=>{
          if(!projectMaterial(material.name))return material;
          const isGap=object.name==='GAP_ART'||object.parent?.name==='GAP_ART';
          const shader=projectedMaterial(texture,isGap?gapMask:null);shader.userData.tileId=houseId;shader.userData.printedTop=material.name==='PrintedArtwork';ownedMaterials.push(shader);return shader;
        });
        object.material=Array.isArray(object.material)?materials:materials[0];
      }
      object.castShadow=tileId(object,model)!==null;
    });
    return {model,ownedMaterials,ownedGeometry,gapMask};
  },[scene,texture]);
  const highlight=(hovered:string|null)=>prepared.ownedMaterials.forEach(material=>{const id=material.userData.tileId;material.uniforms.highlight.value=id&&id===selectedId?.toString()? .12:id&&id===hovered?.toString()? .045:0;});
  useEffect(()=>{highlight(highlighted.current);},[selectedId,prepared]);
  useEffect(()=>()=>{prepared.ownedMaterials.forEach(m=>m.dispose());prepared.ownedGeometry.forEach(g=>g.dispose());prepared.gapMask.dispose();document.body.style.cursor='';},[prepared]);
  useEffect(()=>{
    if(import.meta.env.DEV){
      const debug=()=>({model:prepared.model,tileIds:layout.tiles.map(t=>t.id),printedFaces:prepared.ownedMaterials.filter(m=>m.userData.tileId&&m.userData.printedTop).length});
      (window as unknown as {__reference33?:typeof debug}).__reference33=debug;
      return()=>{delete (window as unknown as {__reference33?:typeof debug}).__reference33;};
    }
  },[prepared]);
  return <primitive object={prepared.model} onClick={(event:{stopPropagation:()=>void;object:Object3D})=>{const id=tileId(event.object,prepared.model);if(id){event.stopPropagation();onSelect?.(id);}}} onPointerMove={(event:{object:Object3D})=>{const id=tileId(event.object,prepared.model);highlighted.current=id;highlight(id);document.body.style.cursor=id?'pointer':'';}} onPointerOut={()=>{highlighted.current=null;highlight(null);document.body.style.cursor='';}}/>;
}

/** Camada visual de 33 IDs; regras, índices de servidor, peões e construções são injetados pela engenharia. */
export function ReferenceBoardScene({selectedId,onSelect,diceValues=null,children}:{selectedId?:string|null;onSelect?:(id:string)=>void;diceValues?:[DiceFace,DiceFace]|null;children?:ReactNode}){
  return <FixedBoardViewport><Canvas shadows dpr={[1,2]} camera={{position:FIXED_CAMERA.position as [number,number,number],fov:FIXED_CAMERA.fov,far:FIXED_CAMERA.far}}>
    <color attach="background" args={['#6a351c']}/><ambientLight intensity={1.1}/><directionalLight position={[-8,18,8]} intensity={2.1} color="#fff0dc" castShadow shadow-mapSize={[2048,2048]} shadow-normalBias={.03} shadow-bias={-.0001}/>
    <Suspense fallback={null}><group position={[0,-.1,0]}><WoodenTableScene/></group><Model selectedId={selectedId} onSelect={onSelect}/>
      {diceValues&&layout.dice.map((die,i)=><group key={i} position={die.position as [number,number,number]} rotation={[0,die.yaw,0]}><DiceVisual face={diceValues[i]} size={die.size}/></group>)}
      {children}
    </Suspense><CameraRig/>
  </Canvas></FixedBoardViewport>;
}
