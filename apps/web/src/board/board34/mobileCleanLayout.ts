import{pixelToWorld,type ZoneTile}from'./buildingZone';
import{mobileSpaciousStudy}from'../mobileStudy';
import{panelPoint}from'./panelProjection';
/** A dedicated outer rent band, inner name and buildings; independent of the old photograph layout. */
export function mobileCleanLayout(tile:ZoneTile){
 const{width:w,height:h,horizontal}=tile.panel,a=tile.anchor,toWorld=pixelToWorld(tile);
 const extent=(u:number,v:number)=>{const[x,z]=toWorld(...panelPoint(tile.panel,u,v));return(x-a.x)*Math.sin(a.rotationY)+(z-a.z)*Math.cos(a.rotationY)};
 const start=horizontal?extent(0,.5)>extent(1,.5):extent(.5,0)>extent(.5,1);
 const band=mobileSpaciousStudy?.24:.34;
 const rent=horizontal?{x:start?3:w*(1-band),y:3,width:w*band-3,height:h-6}:{x:3,y:start?3:h*(1-band),width:w-6,height:h*band-3};
 return{rent,nameX:horizontal?w*(start?(mobileSpaciousStudy?.33:.49):(mobileSpaciousStudy?.67:.51)):w/2,nameY:horizontal?h/2:h*(start?(mobileSpaciousStudy?.33:.49):(mobileSpaciousStudy?.67:.51)),start,band,rotation:horizontal?Math.PI/2:0};
}
