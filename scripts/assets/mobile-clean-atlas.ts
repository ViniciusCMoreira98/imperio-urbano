import layout from'../../apps/web/src/board/board34/visualLayout';
import{board,states}from'@imperio/game-data';
import{paintPanel}from'../../apps/web/src/board/board34/panelProjection';

import{mobileCleanLayout}from'../../apps/web/src/board/board34/mobileCleanLayout';

import{mobileSpaciousStudy}from'../../apps/web/src/board/mobileStudy';
import centerUrl from'../../apps/web/src/board/board34/art/center-brasil-v2.png';
const files=import.meta.glob('../../apps/web/src/board/board34/art/v3/*.png',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const load=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url});
const url=(name:string)=>files[Object.keys(files).find(p=>p.endsWith('/'+name+'.png'))!];
function cover(c:CanvasRenderingContext2D,image:HTMLImageElement,x:number,y:number,w:number,h:number){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const scale=Math.max(w/image.width,h/image.height);c.drawImage(image,x+(w-image.width*scale)/2,y+(h-image.height*scale)/2,image.width*scale,image.height*scale);c.restore()}
function path(x:CanvasRenderingContext2D,p:number[][]){x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath()}
function text(x:CanvasRenderingContext2D,s:string,px:number,py:number,size:number,width:number){x.font=`700 ${size}px Arial,sans-serif`;while(x.measureText(s).width>width&&size>8){size-=.5;x.font=`700 ${size}px Arial,sans-serif`}x.fillStyle='#193b45';x.textAlign='center';x.textBaseline='middle';x.fillText(s,px,py)}
function symbol(x:CanvasRenderingContext2D,type:string,cx:number,cy:number,r:number){
 x.save();x.translate(cx,cy);x.scale(r/24,r/24);x.strokeStyle='#19768a';x.fillStyle='#19768a';x.lineWidth=3;x.lineCap='round';x.lineJoin='round';
 if(type==='EVENT'){x.beginPath();x.arc(0,0,22,0,Math.PI*2);x.stroke();text(x,'?',0,1,32,40)}
 else if(type==='START'){x.beginPath();x.moveTo(-22,-6);x.lineTo(5,-6);x.lineTo(5,-17);x.lineTo(24,0);x.lineTo(5,17);x.lineTo(5,6);x.lineTo(-22,6);x.closePath();x.fill()}
 else if(type==='OLYMPICS'){for(const[a,b,c]of[[-16,-5,'#2585b4'],[0,-5,'#34464c'],[16,-5,'#cb604c'],[-8,8,'#d2ab3c'],[8,8,'#4e9c77']]as[number,number,string][]){x.strokeStyle=c;x.beginPath();x.arc(a,b,9,0,Math.PI*2);x.stroke()}}
 else if(type==='AIRPORT'){x.fill(new Path2D('M-22 3L-3 -6L-3 -21Q0 -27 3 -21L3 -6L22 3L22 8L3 3L3 17L10 22L10 25L0 22L-10 25L-10 22L-3 17L-3 3L-22 8Z'))}
 else if(type==='REST'){x.beginPath();x.arc(10,-10,9,0,Math.PI*2);x.stroke();x.beginPath();x.moveTo(-21,-3);x.lineTo(-7,10);x.lineTo(20,10);x.moveTo(-7,10);x.lineTo(-14,23);x.moveTo(15,10);x.lineTo(21,23);x.stroke()}
 else {x.beginPath();x.roundRect(-22,-15,44,33,6);x.stroke();x.beginPath();x.moveTo(-22,-6);x.lineTo(22,-6);x.stroke();text(x,type==='TAX'?'−':'+',0,7,23,35)}
 x.restore();
}
export async function buildMobileCleanAtlas(){
 const pictures=new Map<string,HTMLImageElement>();let center:HTMLImageElement|null=null;
 if(mobileSpaciousStudy){await Promise.all(layout.tiles.filter(t=>t.type==='PROPERTY').map(async t=>pictures.set(t.id,await load(url(t.id.toLowerCase()+'-board-v3')))));center=await load(centerUrl);await Promise.all(['arrow','flame','rest','airport','event','tax','chest'].map(async id=>pictures.set(id,await load(url(id+'-v3')))));}
 const canvas=document.createElement('canvas');canvas.width=6144;canvas.height=4096;const x=canvas.getContext('2d')!;x.scale(4,4);x.fillStyle='#b6c9bb';x.fillRect(0,0,1536,1024);
 const p=layout.layers.center.pixels;x.save();path(x,p);x.clip();x.fillStyle='#b4cbb3';x.fillRect(0,0,1536,1024);
 x.strokeStyle='#e5edda';x.lineWidth=16;x.globalAlpha=.32;for(let i=-500;i<1800;i+=190){x.beginPath();x.moveTo(i,0);x.lineTo(i+400,1024);x.stroke()}x.lineWidth=2;for(let i=0;i<1000;i+=160){x.beginPath();x.moveTo(0,i);x.lineTo(1536,i-150);x.stroke()}x.restore();
 if(center){x.save();path(x,p);x.clip();const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);cover(x,center,Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));x.restore();}
 for(const tile of layout.tiles){x.save();path(x,tile.pixels);x.clip();paintPanel(x,tile.panel,(c,w,h)=>{
  c.fillStyle=tile.type==='PROPERTY'?'#f5f3e9':'#d9e9e5';c.fillRect(0,0,w,h);c.strokeStyle='#b4c1ba';c.lineWidth=2;c.strokeRect(2,2,w-4,h-4);
  if(tile.type==='PROPERTY'){
   const state=states.find(s=>s.id===tile.id)!,color=board.colorGroups.find(g=>g.id===state.colorGroup)!.color;
   const zones=mobileCleanLayout(tile),r=zones.rent;
   if(mobileSpaciousStudy){const image=pictures.get(tile.id)!;if(tile.panel.horizontal){const px=zones.start?w*.42:3;cover(c,image,px,3,w*.58-3,h-6);}else{const py=zones.start?h*.42:3;cover(c,image,3,py,w-6,h*.58-3);}}
   c.fillStyle='#e4e8e1';c.fillRect(r.x,r.y,r.width,r.height);c.strokeStyle='#c3cdc4';c.lineWidth=1;c.strokeRect(r.x,r.y,r.width,r.height);
   c.save();c.translate(zones.nameX,zones.nameY);c.rotate(zones.rotation);text(c,tile.id,0,0,22,tile.panel.horizontal?h*.8:w*.8);c.restore();
   c.strokeStyle=color;c.globalAlpha=.35;c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);c.globalAlpha=1;
  }else{
   const side=Math.min(w,h)*.25;
   if(mobileSpaciousStudy){const key=({START:'arrow',OLYMPICS:'flame',REST:'rest',AIRPORT:'airport',EVENT:'event',TAX:'tax',SAQUE:'chest'}as Record<string,string>)[tile.type],image=pictures.get(key)!;c.fillStyle=tile.type==='EVENT'||tile.type==='TAX'?'#ffe293':tile.type==='START'||tile.type==='SAQUE'?'#137447':'#15508a';c.fillRect(3,3,w-6,h-6);const scale=Math.min(w*.65/image.width,h*.65/image.height);c.drawImage(image,(w-image.width*scale)/2,h*.03,image.width*scale,image.height*scale);}else symbol(c,tile.type,w*.5,h*.35,side);
   const title=tile.type==='TAX'?'TAXA':tile.label.toLocaleUpperCase('pt-BR');if(mobileSpaciousStudy){c.fillStyle='#fff9e4';c.textAlign='center';c.textBaseline='middle';c.font='700 18px Arial,sans-serif';c.fillText(title,w*.5,h*.85,w*.9);}else text(c,title,w*.5,h*.77,18,w*.9);
  }
 });x.restore()}
 const environment=document.createElement('canvas');environment.width=1024;environment.height=512;const e=environment.getContext('2d')!,g=e.createLinearGradient(0,0,0,512);g.addColorStop(0,'#527e86');g.addColorStop(.52,'#accbc6');g.addColorStop(1,'#e9d1a2');e.fillStyle=g;e.fillRect(0,0,1024,512);
 return{width:canvas.width,height:canvas.height,png:canvas.toDataURL('image/png'),webp:canvas.toDataURL('image/webp',.98),environment:environment.toDataURL('image/webp',.98)};
}
(window as any).buildMobileCleanAtlas=buildMobileCleanAtlas;
