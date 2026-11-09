import{useEffect,useMemo,useRef}from'react';
import{useFrame}from'@react-three/fiber';
import{CanvasTexture,LinearFilter,Mesh,PerspectiveCamera,Quaternion,SRGBColorSpace,Vector3}from'three';
import{rentPlaqueWorld,pixelToWorld,type ZoneTile}from'./board34/buildingZone';
import{panelPoint}from'./board34/panelProjection';
import{RENT_TAG_RENDER_ORDER}from'./renderOrder';

/** A fixed CSS text size avoids flattening the price with the board perspective. */
export const MOBILE_RENT_FONT=10.5;
export function MobileRentTag({tile,label,clean=false}:{tile:ZoneTile&{id:string};label:string;clean?:boolean}){
 const ref=useRef<Mesh>(null);
 const art=useMemo(()=>{
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!,density=4,font=clean?8.5:MOBILE_RENT_FONT,weight=clean?700:900;
  ctx.font=`${weight} ${font}px Arial,sans-serif`;
  const width=Math.ceil(ctx.measureText(label).width+7),height=clean?12:15;
  canvas.width=width*density;canvas.height=height*density;ctx.scale(density,density);
  if(!clean){ctx.fillStyle='#071a31';ctx.strokeStyle='#f4d388';ctx.lineWidth=.85;ctx.beginPath();ctx.roundRect(.5,.5,width-1,height-1,3);ctx.fill();ctx.stroke();}
  ctx.font=`${weight} ${font}px Arial,sans-serif`;ctx.fillStyle=clean?'#173a44':'#fff4c7';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,width/2,height/2+.35);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.minFilter=texture.magFilter=LinearFilter;texture.generateMipmaps=false;
  return{texture,width,height};
 },[label,clean]);
 const pose=useMemo(()=>{
  const quad=rentPlaqueWorld(tile),y=tile.polygon[0][1]+.002;
  const center=new Vector3(quad.reduce((n,p)=>n+p[0]/4,0),y,quad.reduce((n,p)=>n+p[1]/4,0));
  if(clean){const [x,z]=pixelToWorld(tile)(...panelPoint(tile.panel,tile.panel.horizontal?.58:.5,.5));center.set(x,y,z);}
  // Run the text across the property depth, rather than along the crowded row of neighbours.
  const end=center.clone().add(new Vector3(Math.sin(tile.anchor.rotationY),0,Math.cos(tile.anchor.rotationY)));
  return{center,a:center.clone(),b:end,pa:new Vector3(),pb:new Vector3(),depth:new Vector3(),up:new Vector3(),q:new Quaternion(),axis:new Vector3(0,0,1)};
 },[tile,clean]);
 useFrame(({camera,size})=>{
  const mesh=ref.current;if(!mesh||!(camera instanceof PerspectiveCamera))return;
  const a=pose.pa.copy(pose.a).project(camera),b=pose.pb.copy(pose.b).project(camera);
  let angle=Math.atan2((b.y-a.y)*size.height,(b.x-a.x)*size.width);
  if(angle>Math.PI/2)angle-=Math.PI;if(angle<-Math.PI/2)angle+=Math.PI;
  mesh.position.copy(pose.center);mesh.quaternion.copy(camera.quaternion).multiply(pose.q.setFromAxisAngle(pose.axis,angle));
  const depth=-pose.depth.copy(pose.center).applyMatrix4(camera.matrixWorldInverse).z;
  const perPixel=2*depth*Math.tan(camera.fov*Math.PI/360)/camera.zoom/size.height;
  // The two prices beside Início converge at the corner; separate them within their own tiles.
  const cornerOffset=clean?0:tile.id==='RN'?6:tile.id==='MA'?-6:0;
  if(cornerOffset)mesh.position.addScaledVector(pose.up.set(0,1,0).applyQuaternion(camera.quaternion),cornerOffset*perPixel);
  mesh.scale.set(art.width*perPixel,art.height*perPixel,1);
 });
 useEffect(()=>()=>art.texture.dispose(),[art]);
 return <mesh ref={ref} name={`RENT_TAG_${tile.id}`} renderOrder={RENT_TAG_RENDER_ORDER} raycast={()=>null} userData={{mobileRent:true,label,fontPx:MOBILE_RENT_FONT,widthPx:art.width,heightPx:art.height}}>
  <planeGeometry args={[1,1]}/><meshBasicMaterial map={art.texture} transparent={false} alphaToCoverage={clean} alphaTest={clean?.4:.05} depthTest={false} depthWrite={false} toneMapped={false}/>
 </mesh>;
}
