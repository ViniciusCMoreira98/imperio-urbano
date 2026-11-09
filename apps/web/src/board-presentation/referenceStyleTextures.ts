import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { board } from '@imperio/game-data';
import { approvedStateArtwork } from './ApprovedBoardKit';
import crops from './art/special-icon-crops.json';
import type { Point, ReferenceCell } from './referenceStyleLayout';

const icons=import.meta.glob('../board/board34/art/v3/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const special:Record<string,{label:string;icon:keyof typeof crops;color:string}>={START:{label:'INÍCIO',icon:'arrow',color:'#087863'},OLYMPICS:{label:'OLIMPÍADAS',icon:'flame',color:'#135981'},REST:{label:'DESCANSO',icon:'rest',color:'#135981'},AIRPORT:{label:'AEROPORTO',icon:'airport',color:'#135981'},EVENT_NORTH:{label:'EVENTO',icon:'event',color:'#edbf50'},EVENT_EAST:{label:'EVENTO',icon:'event',color:'#edbf50'},TAX:{label:'TAXA',icon:'tax',color:'#edbf50'},SAQUE:{label:'SAQUE',icon:'chest',color:'#087863'}};
function load(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Missing artwork ${src}`));image.src=src})}
function cover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,x:number,y:number,w:number,h:number){const scale=Math.max(w/image.width,h/image.height),sw=w/scale,sh=h/scale;ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,w,h)}
export interface SurfaceLabel {text:string;color:string;x:number;z:number;fontWorld:number;widthWorld:number;textUnits:number;fittedPosition?:Point;shortFooter?:{position:Point;width:number}}
export interface CellSurface { labels:SurfaceLabel[]; texture:CanvasTexture; local:Point[]; minU:number; minV:number; width:number; height:number; fontWorld:number }
export async function createCellSurface(cell:ReferenceCell,rent:string,amount:string):Promise<CellSurface>{
  const local=cell.polygon.map(([x,z])=>[x*cell.u[0]+z*cell.u[1],x*cell.v[0]+z*cell.v[1]] as Point);
  const minU=Math.min(...local.map(p=>p[0])),minV=Math.min(...local.map(p=>p[1])),width=Math.max(...local.map(p=>p[0]))-minU,height=Math.max(...local.map(p=>p[1]))-minV;
  const density=340, canvas=document.createElement('canvas');canvas.width=Math.ceil(width*density);canvas.height=Math.ceil(height*density);
  const ctx=canvas.getContext('2d')!;ctx.scale(canvas.width/width,canvas.height/height);ctx.translate(-minU,-minV);
  const path=new Path2D(),last=local[local.length-1];
  path.moveTo((last[0]+local[0][0])/2,(last[1]+local[0][1])/2);
  local.forEach(([x,y],i)=>{const next=local[(i+1)%local.length];path.arcTo(x,y,next[0],next[1],.095)});
  path.closePath();ctx.save();ctx.clip(path);
  const metadata=special[cell.id], tile=board.tiles[cell.index];
  const span=(y:number)=>{const xs:number[]=[];local.forEach((p,i)=>{const q=local[(i+1)%local.length];if((p[1]<=y&&q[1]>y)||(q[1]<=y&&p[1]>y))xs.push(p[0]+(y-p[1])*(q[0]-p[0])/(q[1]-p[1]))});return xs.length?[Math.min(...xs),Math.max(...xs)]:[minU,minU+width]};
  const labels:SurfaceLabel[]=[];
  const text=(value:string,y:number,size:number,color:string,anchorX?:number,bandWidth?:number)=>{
    const upper=span(y-size*.48),lower=span(y+size*.48);
    const left=Math.max(upper[0],lower[0]),right=Math.min(upper[1],lower[1]);
    ctx.font=`900 ${size}px Arial`;
    const middle=anchorX??(left+right)/2,available=Math.max(.15,bandWidth??(2*Math.min(middle-left,right-middle)-.09)),actual=Math.min(size,size*available/ctx.measureText(value).width);
    const textUnits=value.startsWith('R$')?(ctx.measureText('R$').width*.65+ctx.measureText(value.slice(2).trim()).width)/size+.1:ctx.measureText(value).width/size;
    labels.push({text:value,color,x:middle*cell.u[0]+y*cell.v[0],z:middle*cell.u[1]+y*cell.v[1],fontWorld:actual,widthWorld:available,textUnits});
    return actual;
  };
  let fontWorld=.22;
  if(!metadata&&tile.type==='PROPERTY'){
    ctx.fillStyle='#fff8e8';ctx.fillRect(minU,minV,width,height);
    const half=local.length/2,oa=local[0],ob=local[half-1],ib=local[half],ia=local[local.length-1];
    const top=(cell.side===0?[oa,ob]:cell.side===2?[ia,ib]:cell.side===1?[oa,ia]:[ob,ib]).sort((a,b)=>a[0]-b[0]);
    const bottom=(cell.side===0?[ia,ib]:cell.side===2?[oa,ob]:cell.side===1?[ob,ib]:[oa,ia]).sort((a,b)=>a[0]-b[0]);
    const row=(t:number)=>top.map((p,i)=>[p[0]*(1-t)+bottom[i][0]*t,p[1]*(1-t)+bottom[i][1]*t] as Point);
    const imageQuad=[...row(.19),...row(.75).reverse()],imagePath=new Path2D();
    imageQuad.forEach(([x,y],i)=>i?imagePath.lineTo(x,y):imagePath.moveTo(x,y));imagePath.closePath();
    const bx=Math.min(...imageQuad.map(p=>p[0])),by=Math.min(...imageQuad.map(p=>p[1])),bw=Math.max(...imageQuad.map(p=>p[0]))-bx,bh=Math.max(...imageQuad.map(p=>p[1]))-by;
    const image=await load(approvedStateArtwork(cell.id));
    ctx.save();ctx.clip(imagePath);cover(ctx,image,bx,by,bw,bh);ctx.restore();
    const anchor=(t:number)=>{const line=row(t);return[(line[0][0]+line[1][0])/2,(line[0][1]+line[1][1])/2]};
    const namePoint=anchor(.1),rentPoint=anchor(.86);
    const usableWidth=(t:number)=>{const [a,b]=row(t);return Math.abs(b[0]-a[0])-.16};
    text(cell.id,namePoint[1],Math.min(.27,height*.17),'#122d47',namePoint[0],usableWidth(.1));
    fontWorld=text(rent,rentPoint[1],Math.min(.25,height*.18),'#102b45',rentPoint[0],usableWidth(.86));
    // Keep adjacent side labels apart at small projected heights; the art itself is unchanged.
    if(cell.side===1||cell.side===3){
      for(const[index,t]of[[labels.length-2,.25],[labels.length-1,.75]]){
        const [x,y]=anchor(t);labels[index].fittedPosition=[x*cell.u[0]+y*cell.v[0],x*cell.u[1]+y*cell.v[1]];
      }
      const [a,b]=row(.81),fullWidth=Math.abs(b[0]-a[0])-.12;
      for(const[index,t,fraction]of[[labels.length-2,.16,.3],[labels.length-1,.66,.66]]){
        const x=a[0]*(1-t)+b[0]*t,y=a[1]*(1-t)+b[1]*t;
        labels[index].shortFooter={position:[x*cell.u[0]+y*cell.v[0],x*cell.u[1]+y*cell.v[1]],width:fullWidth*fraction};
      }
    }
    ctx.strokeStyle='#ddbe6e';ctx.lineWidth=.017;
    for(const t of[.19,.75]){const [a,b]=row(t);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
  }else if(metadata){
    const gradient=ctx.createLinearGradient(minU,minV,minU+width,minV+height);gradient.addColorStop(0,metadata.color);gradient.addColorStop(1,metadata.color==='#edbf50'?'#ffe697':'#073e4b');ctx.fillStyle=gradient;ctx.fillRect(minU,minV,width,height);
    const image=await load(icons[`../board/board34/art/v3/${metadata.icon}-v3.png`]), crop=crops[metadata.icon];
    if(cell.id==='SAQUE'||cell.id==='EVENT_EAST'){
      const y=minV+height*.51,[left,right]=span(y),contentWidth=right-left-.16,iconWidth=Math.min(contentWidth*.34,height*.76*crop.width/crop.height),iconHeight=iconWidth*crop.height/crop.width;
      ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,left+.07,y-iconHeight/2,iconWidth,iconHeight);
      text(metadata.label,y,.25,metadata.color==='#edbf50'?'#152d46':'#fff9de',left+contentWidth*.7,contentWidth*.54);
    }else{
    const corner=['START','OLYMPICS','REST','AIRPORT'].includes(cell.id),iconHeight=height*(cell.id==='TAX'?.43:corner?.38:.57);
    const [left,right]=span(minV+height*(corner?.42:.38)),iconWidth=Math.min((right-left)*(corner?.77:.9),iconHeight*crop.width/crop.height),actualHeight=iconWidth*crop.height/crop.width;
    ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,(left+right-iconWidth)/2,minV+height*(corner?.17:.12),iconWidth,actualHeight);
    text(metadata.label,minV+height*(corner?.66:.77),Math.min(.25,height*.15),metadata.color==='#edbf50'?'#152d46':'#fff9de');
    if(cell.id==='TAX')text(amount,minV+height*.91,Math.min(.18,height*.1),'#152d46');
    }
  }
  ctx.restore();ctx.lineJoin='round';
  ctx.strokeStyle='#745022';ctx.lineWidth=.085;ctx.stroke(path);
  const metal=ctx.createLinearGradient(minU,minV,minU+width,minV+height);metal.addColorStop(0,'#fff6d1');metal.addColorStop(.28,'#f4d37a');metal.addColorStop(.53,'#c5943e');metal.addColorStop(.77,'#fff2bc');metal.addColorStop(1,'#ad782c');
  ctx.strokeStyle=metal;ctx.lineWidth=.062;ctx.stroke(path);
  ctx.strokeStyle='#fffbe7';ctx.lineWidth=.017;ctx.stroke(path);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.minFilter=LinearMipmapLinearFilter;texture.anisotropy=8;
  return{labels,texture,local,minU,minV,width,height,fontWorld};
}
