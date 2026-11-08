import {board} from '@imperio/game-data';
import {isBoard34} from './boardVisualManifest';
import layout from './board34/layout.json';
import {pixelToWorld} from './board34/buildingZone';
import {panelPoint} from './board34/panelProjection';
import {tileAnchor} from './layout';

/** Split the long rails, keeping the rings and corner ornaments proportional on wide tiles. */
export function olympicFrameGrid(index:number){
 if(!isBoard34(board.tiles))return null;
 const anchor=tileAnchor(index),tile=layout.tiles.find(t=>t.id===anchor.id);
 if(!tile||tile.type!=='PROPERTY')return null;
 const sourceX=[0,.12,.35,.65,.88,1],sourceY=[0,.14,.9,1];
 const horizontal=tile.panel.horizontal,ratio=tile.panel.height/tile.panel.width;
 const corner=.12*512/683*ratio*1.12,emblem=.30*512/683*ratio*1.12;
 const xs=horizontal?[-.02,-.02+corner,.5-emblem/2,.5+emblem/2,1.02-corner,1.02]:sourceX.map(x=>-.02+x*1.04);
 const ys=sourceY.map(y=>-.10+y*1.12),world=pixelToWorld(tile);
 const c=Math.cos(anchor.rotationY),s=Math.sin(anchor.rotationY),positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(let row=0;row<ys.length;row++)for(let col=0;col<xs.length;col++){
  const [x,z]=world(...panelPoint(tile.panel,xs[col],ys[row])),dx=x-anchor.x,dz=z-anchor.z;
  positions.push(dx*c-dz*s,.03,dx*s+dz*c);uvs.push(sourceX[col],1-sourceY[row]);
 }
 for(let row=0;row<ys.length-1;row++)for(let col=0;col<xs.length-1;col++){const i=row*xs.length+col;indices.push(i,i+1,i+1+xs.length,i,i+1+xs.length,i+xs.length);}
 return{positions:new Float32Array(positions),uvs:new Float32Array(uvs),indices:new Uint16Array(indices),horizontal};
}
