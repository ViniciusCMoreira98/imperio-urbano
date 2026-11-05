import fs from 'node:fs';
const root='apps/web/src/tabletop-ui/';const layout=JSON.parse(fs.readFileSync('apps/web/src/board/reference33/layout.json'));
function interval(polygon,y){const xs=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}return[Math.min(...xs),Math.max(...xs)];}
const placements=layout.tiles.filter(t=>t.type==='PROPERTY').map(tile=>{
 const xs=tile.pixels.map(p=>p[0]),ys=tile.pixels.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),maxY=Math.max(...ys);
 const side=tile.side==='east'||tile.side==='west',height=side?18:22,y=maxY-height-7;
 const top=interval(tile.pixels,y),bottom=interval(tile.pixels,y+height);
 const left=Math.max(top[0],bottom[0])+5,right=Math.min(top[1],bottom[1])-5;
 const width=Math.min(side?84:100,(right-left)*.86);
 const desired=tile.side==='east'?minX+(maxX-minX)*.30:tile.side==='west'?minX+(maxX-minX)*.72:(minX+maxX)/2;
 const center=Math.max(left+width/2,Math.min(right-width/2,desired));
 return{stateId:tile.id,x:+(center-width/2).toFixed(4),y:+y.toFixed(4),width:+width.toFixed(4),height};
});
fs.writeFileSync(root+'rentPlacements.json',JSON.stringify({schemaVersion:1,coordinateSpace:'native-camera-pixels',reference:{width:1536,height:1024},placements},null,2)+'\n');
