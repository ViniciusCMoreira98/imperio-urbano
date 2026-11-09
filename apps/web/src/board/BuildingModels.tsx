// Modelos reais da família visual do modal: casa 1–4 e hotel. Frente +Z, apoio Y=0.
import{Suspense,useEffect,useMemo}from'react';
import{useGLTF}from'@react-three/drei';
import{Mesh,MeshStandardMaterial}from'three';
import{buildingAsset}from'./buildings/buildingPresentation';

function PreparedBuilding({level,color,scale}:{level:number;color:string;scale:number}){
 const asset=buildingAsset(level)!,{scene}=useGLTF(asset.model);
 const prepared=useMemo(()=>{
  const model=scene.clone(true),owned:MeshStandardMaterial[]=[];
  model.traverse(object=>{
   if(!(object instanceof Mesh))return;object.castShadow=true;object.receiveShadow=true;
   const materials=Array.isArray(object.material)?object.material:[object.material];
   const next=materials.map(material=>{if(material.name!=='OWNER_ACCENT')return material;const accent=(material as MeshStandardMaterial).clone();accent.color.set(color);owned.push(accent);return accent;});object.material=Array.isArray(object.material)?next:next[0];
  });return{model,owned};
 },[scene,color]);
 useEffect(()=>()=>prepared.owned.forEach(material=>material.dispose()),[prepared]);
 return <group name={`PROPERTY_BUILDING_LEVEL_${level}`} userData={{propertyLevel:level,buildingAsset:asset.model}} scale={scale}><primitive object={prepared.model}/></group>;
}
/** Carregamento isolado: a primeira construção não oculta o restante da cena. */
export function PropertyBuildingModel({level,color,scale=1}:{level:number;color:string;scale?:number}){
 return buildingAsset(level)?<Suspense fallback={null}><PreparedBuilding level={level} color={color} scale={scale}/></Suspense>:null;
}
/** Compatibilidade com consumidores que ainda pedem uma casinha isolada. */
export function HouseModel({color,size=.19,level=1}:{color:string;size?:number;level?:number}){const asset=buildingAsset(level);return asset?<PropertyBuildingModel level={level} color={color} scale={size/Math.max(asset.width,asset.depth)}/>:null;}
/** Compatibilidade com o envelope antigo do hotel; escala sempre uniforme. */
export function HotelModel({color,width=.5,height=.42,depth=.26}:{color:string;width?:number;height?:number;depth?:number}){const a=buildingAsset(5)!;return <PropertyBuildingModel level={5} color={color} scale={Math.min(width/a.width,height/a.height,depth/a.depth)}/>;}
// Pré-carrega casas e hotel: a primeira construção aparece pronta, sem atraso.
for(const level of [1,2,3,4,5]){const asset=buildingAsset(level);if(asset)useGLTF.preload(asset.model);}
