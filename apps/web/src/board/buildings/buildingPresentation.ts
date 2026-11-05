import assets from './buildings.json';
import type{TileArea}from'../layout';
export function buildingAsset(level:number){return assets.models.find(model=>model.level===level)??null;}
/** Uma edificação evolutiva na faixa existente, com proporção física preservada. */
export function propertyBuildingPlacement(area:TileArea|null,level:number){
 const asset=buildingAsset(level);if(!area||!asset)return null;
 const margin=.01,scale=Math.min((area.width-margin*2)/asset.width,(area.depth-margin*2)/asset.depth);if(scale<=0)return null;
 return{x:area.x,z:area.z,scale,width:asset.width*scale,depth:asset.depth*scale,height:asset.height*scale,level};
}
