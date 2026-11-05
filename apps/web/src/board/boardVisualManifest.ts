import legacy from './reference33/layout.json';
import current from './board34/layout.json';
export type BoardCatalogTile={id:string;index:number;type:string;stateId?:string|null};
function matches(tiles:readonly BoardCatalogTile[],manifest:typeof legacy|typeof current){return tiles.length===manifest.tiles.length&&tiles.every((tile,i)=>{const visual=manifest.tiles[i];return tile.index===i&&tile.id===visual.id&&(tile.type==='NATIONAL_TRAVEL'?'AIRPORT':tile.type)===visual.type&&(visual.type!=='PROPERTY'||tile.stateId===visual.stateId);});}
/** Ativação por catálogo inteiro; contagem sozinha nunca autoriza misturar os percursos. */
export function boardVisualManifest(tiles:readonly BoardCatalogTile[]){
 if(matches(tiles,current))return current;
 if(matches(tiles,legacy))return legacy;
 throw new Error('O catálogo não corresponde aos IDs e índices dos tabuleiros visuais de 33 ou 34 casas.');
}
export function isBoard34(tiles:readonly BoardCatalogTile[]){return boardVisualManifest(tiles)===current;}
