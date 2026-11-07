import assets from './buildings.json';
import type{TileArea}from'../layout';
export function buildingAsset(level:number){return assets.models.find(model=>model.level===level)??null;}
const MARGIN=.01;
function fitScale(area:TileArea,level:number){const asset=buildingAsset(level);return asset?Math.min((area.width-MARGIN*2)/asset.width,(area.depth-MARGIN*2)/asset.depth):0;}
/**
 * Uma edificação evolutiva na faixa existente, com proporção física preservada. Com escala única
 * (area.scale), todas as casas do tabuleiro mostram a construção do mesmo tamanho.
 */
export function propertyBuildingPlacement(area:TileArea|null,level:number){
 const asset=buildingAsset(level);if(!area||!asset)return null;
 const fit=fitScale(area,level);if(fit<=0)return null;
 const scale=Math.min(fit,area.scale??fit);
 return{x:area.x,z:area.z,scale,width:asset.width*scale,depth:asset.depth*scale,height:asset.height*scale,level};
}
/**
 * Escala única das construções no tabuleiro (pedido do usuário, 06/11/2026: mesma proporção em todos
 * os estados): a maior que cabe em todas as faixas, em todos os níveis. Onde um prédio alto passa na
 * frente da placa de aluguel vizinha, a etiqueta do aluguel é desenhada por cima (RentTags).
 */
export function uniformBuildingScale(areas:TileArea[]){
 let scale=Infinity;
 for(const area of areas)for(const model of assets.models)scale=Math.min(scale,fitScale(area,model.level));
 return scale;
}
