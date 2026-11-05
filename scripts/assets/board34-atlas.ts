import layout from '../../apps/web/src/board/board34/layout.json';
import{board,states}from'@imperio/game-data';
import{paintPanel,type PanelRect}from'../../apps/web/src/board/board34/panelProjection';
import centerUrl from '../../apps/web/src/board/board34/art/center-brasil-v2.png';
const files=import.meta.glob('../../apps/web/src/board/board34/art/v3/*.png',{eager:true,query:'?url',import:'default'})as Record<string,string>;
const url=(name:string)=>{const key=Object.keys(files).find(p=>p.endsWith('/'+name+'.png'));if(!key)throw Error('Arte ausente: '+name);return files[key];};
const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error(src));image.src=src;});
function path(ctx:CanvasRenderingContext2D,points:number[][]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function cover(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number){const s=Math.max(w/img.width,h/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);ctx.restore();}
const alphaCache=new Map<HTMLImageElement,PanelRect>();
function alphaBounds(img:HTMLImageElement){if(alphaCache.has(img))return alphaCache.get(img)!;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d')!;x.drawImage(img,0,0);const data=x.getImageData(0,0,c.width,c.height).data;let left=c.width,top=c.height,right=0,bottom=0;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++)if(data[(y*c.width+xx)*4+3]>48){left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,y);bottom=Math.max(bottom,y);}const rect={x:left,y:top,width:right-left+1,height:bottom-top+1};alphaCache.set(img,rect);return rect;}
const placements:{id:string;asset:string;source:PanelRect;destination:PanelRect;uniformScale:number}[]=[];
function icon(ctx:CanvasRenderingContext2D,img:HTMLImageElement,r:PanelRect,id:string,asset:string){const crop=alphaBounds(img),s=Math.min(r.width/crop.width,r.height/crop.height),w=crop.width*s,h=crop.height*s,d={x:r.x+(r.width-w)/2,y:r.y+(r.height-h)/2,width:w,height:h};ctx.drawImage(img,crop.x,crop.y,crop.width,crop.height,d.x,d.y,w,h);placements.push({id,asset,source:crop,destination:d,uniformScale:s});}
function text(ctx:CanvasRenderingContext2D,label:string,x:number,y:number,size:number,width:number,color='#172747'){
 ctx.fillStyle=color;ctx.font=`900 ${size}px Arial,sans-serif`;while(ctx.measureText(label).width>width&&size>7){size-=.25;ctx.font=`900 ${size}px Arial,sans-serif`;}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y);
}
function name(ctx:CanvasRenderingContext2D,label:string,x:number,y:number,size:number,width:number){
 ctx.font=`700 ${size}px Arial,sans-serif`;const words=label.split(' '),lines:string[]=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 if(lines.length>2)return name(ctx,label,x,y,size-.5,width);ctx.fillStyle='#152139';ctx.textAlign='center';ctx.textBaseline='middle';lines.forEach((l,i)=>ctx.fillText(l,x,y+i*size*1.05));
}
function plaque(ctx:CanvasRenderingContext2D,r:PanelRect){const g=ctx.createLinearGradient(0,r.y,0,r.y+r.height);g.addColorStop(0,'#32447b');g.addColorStop(.5,'#171d43');g.addColorStop(1,'#070e27');ctx.fillStyle=g;ctx.strokeStyle='#edc25e';ctx.lineWidth=1.4;ctx.beginPath();ctx.roundRect(r.x,r.y,r.width,r.height,Math.min(6,r.height/3));ctx.fill();ctx.stroke();}
function frame(ctx:CanvasRenderingContext2D,w:number,h:number,color:string){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#fff6bd');g.addColorStop(.25,'#e0b34b');g.addColorStop(.5,'#fff2a8');g.addColorStop(1,'#a76b19');ctx.strokeStyle=g;ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(2,2,w-4,h-4,7);ctx.stroke();ctx.lineWidth=1.5;ctx.strokeStyle=color;ctx.beginPath();ctx.roundRect(5,5,w-10,h-10,5);ctx.stroke();}

export async function buildBoard34Atlas(){
 placements.length=0;const center=await load(centerUrl),pictures=new Map(await Promise.all(layout.tiles.filter(t=>t.type==='PROPERTY').map(async t=>[t.id,await load(url(t.id.toLowerCase()+'-board-v3'))]as const)));
 const art=new Map(await Promise.all(['arrow','flame','rest','airport','event','tax','chest'].map(async k=>[k,await load(url(k+'-v3'))]as const)));
 const canvas=document.createElement('canvas');canvas.width=3072;canvas.height=2048;const ctx=canvas.getContext('2d')!;ctx.scale(2,2);ctx.fillStyle='#2d1a11';ctx.fillRect(0,0,1536,1024);
 const poly=layout.layers.center.pixels,xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);ctx.save();path(ctx,poly);ctx.clip();cover(ctx,center,Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));ctx.restore();
 for(const tile of layout.tiles){ctx.save();path(ctx,tile.pixels);ctx.clip();paintPanel(ctx,tile.panel,(x,w,h)=>{
  if(tile.type==='PROPERTY'){
   const image=pictures.get(tile.id)!,state=states.find(s=>s.id===tile.id)!,group=board.colorGroups.find(g=>g.id===state.colorGroup)!;
   x.fillStyle='#ffffff';x.fillRect(0,0,w,h);
   if(tile.panel.horizontal){
    cover(x,image,w*.34,4,w*.64,h-8);const wash=x.createLinearGradient(w*.28,0,w*.61,0);wash.addColorStop(0,'#fffefa');wash.addColorStop(.4,'#fffefaed');wash.addColorStop(1,'#fffefa00');x.fillStyle=wash;x.fillRect(4,4,w*.62,h-8);
    text(x,tile.id,w*.225,h*.31,22,w*.37);name(x,tile.label,w*.225,h*.53,10,w*.38);
   }else{
    cover(x,image,4,34,w-8,h-38);const wash=x.createLinearGradient(0,4,0,55);wash.addColorStop(0,'#fffefa');wash.addColorStop(.65,'#fffefa');wash.addColorStop(1,'#fffefa00');x.fillStyle=wash;x.fillRect(4,4,w-8,53);
    text(x,tile.id,w/2,18,23,w-16);name(x,tile.label,w/2,33,10.2,w-16);
   }
   plaque(x,tile.panel.rent!);frame(x,w,h,group.color);
  }else{
   const dark=tile.type==='START'||tile.type==='SAQUE'?'#084d2b':'#082458',light=tile.type==='START'||tile.type==='SAQUE'?'#16a158':'#1360b9',gold=tile.type==='TAX'||tile.type==='EVENT';
   const g=x.createRadialGradient(w*.45,h*.25,1,w*.5,h*.5,Math.max(w,h)*.7);g.addColorStop(0,gold?'#fff3a3':light);g.addColorStop(1,gold?'#e7a731':dark);x.fillStyle=g;x.fillRect(0,0,w,h);
   if(tile.type==='EVENT'&&tile.panel.horizontal){
    const side=Math.min(h-14,w*.30);icon(x,art.get('event')!,{x:13,y:(h-side)/2,width:side,height:side},tile.id,'event');text(x,'EVENTO',w*.65,h*.52,23,w*.53,'#292046');
   }else if(tile.type==='SAQUE'){
    icon(x,art.get('chest')!,{x:8,y:8,width:w*.43,height:h-16},tile.id,'chest');text(x,'SAQUE',w*.73,h*.51,25,w*.45,'#fffce5');
   }else if(tile.type==='TAX'){
    const r=tile.panel.pool!;icon(x,art.get('tax')!,{x:w*.16,y:8,width:w*.68,height:r.y-35},tile.id,'tax');text(x,'TAXA',w/2,r.y-13,23,w*.82,'#32213a');plaque(x,r);text(x,'ACUMULADO',w/2,r.y+7,7.2,r.width-10,'#ead098');
   }else{
    const key={START:'arrow',OLYMPICS:'flame',REST:'rest',AIRPORT:'airport',EVENT:'event'}[tile.type]as string;
    icon(x,art.get(key)!,{x:12,y:10,width:w-24,height:h-47},tile.id,key);
    const base=x.createLinearGradient(0,h-38,0,h);base.addColorStop(0,gold?'#e7a73100':'#06173600');base.addColorStop(1,gold?'#e7a731':'#061736');x.fillStyle=base;x.fillRect(6,h-38,w-12,32);text(x,tile.label.toLocaleUpperCase('pt-BR'),w/2,h-20,23,w-20,gold?'#292046':'#fffce8');
   }
   frame(x,w,h,gold?'#b67811':'#60c0ed');
  }
 });ctx.restore();}
 const brand=await load(url('brand-v3')),brandCanvas=document.createElement('canvas');brandCanvas.width=512;brandCanvas.height=Math.ceil(512*brand.height/brand.width);brandCanvas.getContext('2d')!.drawImage(brand,0,0,512,512*brand.height/brand.width);
 return{dataUrl:canvas.toDataURL('image/png'),webpDataUrl:canvas.toDataURL('image/webp',.94),brandDataUrl:brandCanvas.toDataURL('image/webp',.94),width:canvas.width,height:canvas.height,stateCount:pictures.size,sourcePhotoPixelsUsed:false,placements};
}
(window as any).buildBoard34Atlas=buildBoard34Atlas;
