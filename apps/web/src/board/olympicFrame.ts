import {board} from '@imperio/game-data';
import {isBoard34} from './boardVisualManifest';
import layout from './board34/visualLayout';
import {pixelToWorld} from './board34/buildingZone';
import {panelPoint} from './board34/panelProjection';
import {tileAnchor} from './layout';

/**
 * Malha da moldura da sede (arte do Codex assets/olympic-host/highlight-v3, 768×1024, 11/11/2026).
 *
 * A arte tem um brasão grande (aros + placa SEDE OLÍMPICA) nos 28% de cima. Ele nunca fica por cima do
 * nome nem da foto do estado: a placa termina na borda da casa e o brasão sai para fora dela, do lado em
 * que não há outro estado. Nas casas em pé (norte/sul) isso é para cima, como na arte (no sul, o miolo; no
 * norte, a borda do tabuleiro). Nas deitadas (oeste/leste) em cima e embaixo há vizinhos, então a moldura
 * gira 90° e o brasão aponta para o miolo.
 *
 * Aros, cantos, faixa das cinco cores e louros mantêm a proporção; só os trilhos lisos esticam.
 */
const ART={width:768,height:1024};
/** Colunas da arte: borda externa, trilho, folhagens, brasão, folhagens, trilho, borda externa. */
const SOURCE_X=[.037,.10,.245,.755,.90,.963];
/** Linhas da arte: topo dos aros, fim da placa, trilho liso, faixa das cinco cores, trilho liso, louros. */
const SOURCE_Y=[0,.283,.40,.63,.93,1];
/** Quanto a moldura passa da casa de cada lado (fração da casa). */
const SPILL=.03;
/** Nas casas em pé, o brasão sai no máximo isso da altura da casa (no norte, cabe na borda do tabuleiro). */
const MAX_CREST=.30;

type Orientation='up'|'towardPlusU'|'towardMinusU';

/** Posições (em px da casa) dos cortes ao longo de um eixo: os trechos fixos mantêm a escala, os elásticos repartem o resto. */
function cuts(start:number,total:number,widths:number[],scales:(number|null)[]){
 const fixed=widths.reduce((sum,w,i)=>sum+(scales[i]===null?0:w*scales[i]!),0);
 const elastic=widths.reduce((sum,w,i)=>sum+(scales[i]===null?w:0),0);
 const stretch=Math.max(0,total-fixed)/elastic,out=[start];
 widths.forEach((w,i)=>out.push(out[i]+w*(scales[i]??stretch)));
 return out;
}

export function olympicFrameGrid(index:number){
 if(!isBoard34(board.tiles))return null;
 const anchor=tileAnchor(index),tile=layout.tiles.find(t=>t.id===anchor.id);
 if(!tile||tile.type!=='PROPERTY')return null;
 const {width:W,height:H}=tile.panel;
 const orientation:Orientation=tile.panel.horizontal?(tile.side==='east'?'towardMinusU':'towardPlusU'):'up';
 const upright=orientation==='up';
 // Eixo "através" da moldura (de um trilho lateral ao outro) e eixo "ao longo" (do brasão aos louros).
 const across=upright?W:H,along=upright?H:W;
 const scale=across*(1+2*SPILL)/((SOURCE_X[5]-SOURCE_X[0])*ART.width);
 const colWidths=SOURCE_X.slice(1).map((x,i)=>(x-SOURCE_X[i])*ART.width);
 // Deitada, a casa é baixa e o brasão sai no miolo, onde há espaço: cresce até quase encostar nos trilhos.
 const crestScale=upright
  ?Math.min(scale,MAX_CREST*along/(SOURCE_Y[1]*ART.height))
  :(across*(1+2*SPILL)*.96-2*colWidths[0]*scale)/colWidths[2];
 const xs=cuts(-SPILL*across,across*(1+2*SPILL),colWidths,[scale,null,crestScale,null,scale]);
 const rowHeights=SOURCE_Y.slice(1).map((y,i)=>(y-SOURCE_Y[i])*ART.height);
 const crestHeight=rowHeights[0]*crestScale,bodyStart=-.01*along;
 const ys=[bodyStart-crestHeight,...cuts(bodyStart,along*(1+SPILL)-bodyStart,rowHeights.slice(1),[null,scale,null,scale])];
 // Ponto da moldura (através, ao longo, em px) → ponto da casa (u, v de 0 a 1).
 const toPanel=(a:number,b:number):[number,number]=>orientation==='up'?[a/W,b/H]
  :orientation==='towardPlusU'?[1-b/W,a/H]
  :[b/W,1-a/H];
 const world=pixelToWorld(tile),c=Math.cos(anchor.rotationY),s=Math.sin(anchor.rotationY);
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(let row=0;row<ys.length;row++)for(let col=0;col<xs.length;col++){
  const [x,z]=world(...panelPoint(tile.panel,...toPanel(xs[col],ys[row]))),dx=x-anchor.x,dz=z-anchor.z;
  positions.push(dx*c-dz*s,.03,dx*s+dz*c);uvs.push(SOURCE_X[col],1-SOURCE_Y[row]);
 }
 for(let row=0;row<ys.length-1;row++)for(let col=0;col<xs.length-1;col++){const i=row*xs.length+col;indices.push(i,i+1,i+1+xs.length,i,i+1+xs.length,i+xs.length);}
 return{positions:new Float32Array(positions),uvs:new Float32Array(uvs),indices:new Uint16Array(indices),horizontal:tile.panel.horizontal,orientation};
}

/** Onde escrever na arte (frações da imagem): a placa do brasão e o trilho de baixo, entre os louros. */
export const OLYMPIC_FRAME_TEXT={plate:{x:.5,y:.241,maxWidth:.40,size:.036},multiplier:{x:.5,y:.95,size:.024}};
