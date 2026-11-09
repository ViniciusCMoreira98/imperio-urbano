import{board}from'@imperio/game-data';
import original from'../board/board34/layout.json';
export const COMPOSITION={width:1584,height:904,pad:12,sideWidth:180,topHeight:200,stepX:150,stepY:60,innerLeft:192,innerTop:212,innerWidth:1200,innerHeight:480}as const;
export interface CompositionCell{id:string;index:number;side:string;x:number;y:number;width:number;height:number;orientation:'portrait'|'landscape-edge';specialOrientation:'square'|'portrait'|'wide'|'edge'}
/** Layout of presentation components only. IDs and traversal remain the official catalog. */
export function approvedCompositionCells():CompositionCell[]{
 const c=COMPOSITION,corners:Record<string,[number,number]>={START:[c.pad,c.pad],OLYMPICS:[c.innerLeft+c.innerWidth,c.pad],REST:[c.innerLeft+c.innerWidth,c.innerTop+c.innerHeight],AIRPORT:[c.pad,c.innerTop+c.innerHeight]},result=new Map<string,CompositionCell>();
 for(const[id,[x,y]]of Object.entries(corners)){const tile=board.tiles.find(t=>t.id===id)!;result.set(id,{id,index:tile.index,side:'corner',x,y,width:c.sideWidth,height:c.topHeight,orientation:'portrait',specialOrientation:'square'})}
 for(const side of['north','east','south','west']){
  const horizontal=side==='north'||side==='south';let cursor=0;
  const items=original.tiles.filter(t=>t.side===side&&!corners[t.id]).sort((a,b)=>horizontal?a.anchor.x-b.anchor.x:a.anchor.z-b.anchor.z);
  for(const item of items){const double=(side==='north'||side==='west')&&item.type!=='PROPERTY',weight=double?2:1,x=horizontal?c.innerLeft+cursor*c.stepX:side==='west'?c.pad:c.innerLeft+c.innerWidth,y=horizontal?(side==='north'?c.pad:c.innerTop+c.innerHeight):c.innerTop+cursor*c.stepY,width=horizontal?weight*c.stepX:c.sideWidth,height=horizontal?c.topHeight:weight*c.stepY;
   result.set(item.id,{id:item.id,index:board.tiles.find(t=>t.id===item.id)!.index,side,x,y,width,height,orientation:horizontal?'portrait':'landscape-edge',specialOrientation:double?'wide':horizontal?'portrait':'edge'});cursor+=weight;
  }
  if(cursor!==8)throw new Error(`Faixa ${side} não ocupa os oito intervalos previstos.`);
 }
 return board.tiles.map(t=>{const cell=result.get(t.id);if(!cell)throw new Error(`Casa ausente: ${t.id}`);return cell});
}
/** Use the empty screen corners, choosing the larger safe fit for wide phones. */
export function approvedCompositionFit(width:number,height:number){
 const margin=height<=500?6:10,gap=5,playerWidth=Math.min(230,Math.max(100,width*.14)),playerHeight=playerWidth*.3,controlSize=Math.min(50,Math.max(30,height*.075));
 const maximum=Math.min((width-2*(controlSize+margin+gap))/COMPOSITION.width,(height-24)/COMPOSITION.height);
 const horizontal=Math.min(maximum,(width-2*(playerWidth+margin+gap))/COMPOSITION.width),vertical=Math.min(maximum,(height-2*(playerHeight+margin+gap))/COMPOSITION.height);
 return{scale:Math.max(.05,horizontal,vertical),playerWidth,playerHeight,controlSize,margin};
}
