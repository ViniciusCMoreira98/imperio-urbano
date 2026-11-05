export interface PanelRect{x:number;y:number;width:number;height:number}
export interface Panel{quad:number[][];width:number;height:number;horizontal:boolean;rent?:PanelRect|null;pool?:PanelRect}
function matrix(panel:Panel){
 const[a,b,c,d]=panel.quad,dx1=b[0]-c[0],dx2=d[0]-c[0],dx3=a[0]-b[0]+c[0]-d[0],dy1=b[1]-c[1],dy2=d[1]-c[1],dy3=a[1]-b[1]+c[1]-d[1],det=dx1*dy2-dx2*dy1;
 const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
 return[b[0]-a[0]+g*b[0],d[0]-a[0]+h*d[0],a[0],b[1]-a[1]+g*b[1],d[1]-a[1]+h*d[1],a[1],g,h,1];
}
/** A mesma homografia serve à arte, aos preços e ao saldo, incluindo pontos interiores. */
export function panelPoint(panel:Panel,u:number,v:number):[number,number]{const[a,b,c,d,e,f,g,h]=matrix(panel),q=1+g*u+h*v;return[(a*u+b*v+c)/q,(d*u+e*v+f)/q];}

/** Rasterização única: evita as costuras diagonais de uma malha de triângulos Canvas2D. */
export function paintPanel(ctx:CanvasRenderingContext2D,panel:Panel,paint:(ctx:CanvasRenderingContext2D,w:number,h:number)=>void,region?:PanelRect){
 const rasterScale=Math.max(1,Math.abs(ctx.getTransform().a));
 const image=document.createElement('canvas');image.width=Math.ceil(panel.width*rasterScale);image.height=Math.ceil(panel.height*rasterScale);const local=image.getContext('2d')!;local.scale(image.width/panel.width,image.height/panel.height);paint(local,panel.width,panel.height);
 const source=local.getImageData(0,0,image.width,image.height).data,[a,b,c,d,e,f,g,h]=matrix(panel);
 // Adjugada da matriz; o determinante cancela ao dividir por q.
 const ia=e-f*h,ib=c*h-b,ic=b*f-c*e,id=f*g-d,ie=a-c*g,iff=c*d-a*f,ig=d*h-e*g,ih=b*g-a*h,ii=a*e-b*d;
 const rect=region??{x:0,y:0,width:panel.width,height:panel.height},corners=[[rect.x,rect.y],[rect.x+rect.width,rect.y],[rect.x+rect.width,rect.y+rect.height],[rect.x,rect.y+rect.height]].map(([x,y])=>panelPoint(panel,x/panel.width,y/panel.height));
 const scale=Math.max(1,Math.abs(ctx.getTransform().a)),left=Math.floor(Math.min(...corners.map(p=>p[0]))*scale),top=Math.floor(Math.min(...corners.map(p=>p[1]))*scale),right=Math.ceil(Math.max(...corners.map(p=>p[0]))*scale),bottom=Math.ceil(Math.max(...corners.map(p=>p[1]))*scale);
 const warped=document.createElement('canvas');warped.width=right-left;warped.height=bottom-top;const destination=warped.getContext('2d')!,pixels=destination.createImageData(warped.width,warped.height),data=pixels.data,sw=image.width,sh=image.height;
 for(let y=0;y<warped.height;y++)for(let x=0;x<warped.width;x++){
  const px=(left+x+.5)/scale,py=(top+y+.5)/scale,q=ig*px+ih*py+ii,u=(ia*px+ib*py+ic)/q,v=(id*px+ie*py+iff)/q;if(u<0||u>1||v<0||v>1)continue;
  const sx=Math.max(0,Math.min(sw-1,u*sw-.5)),sy=Math.max(0,Math.min(sh-1,v*sh-.5)),x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(sw-1,x0+1),y1=Math.min(sh-1,y0+1),fx=sx-x0,fy=sy-y0;
  const indices=[(y0*sw+x0)*4,(y0*sw+x1)*4,(y1*sw+x0)*4,(y1*sw+x1)*4],weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];let alpha=0,r=0,green=0,blue=0;
  for(let i=0;i<4;i++){const n=indices[i],aw=source[n+3]*weights[i];alpha+=aw;r+=source[n]*aw;green+=source[n+1]*aw;blue+=source[n+2]*aw;}
  if(alpha>0){const n=(y*warped.width+x)*4;data[n]=r/alpha;data[n+1]=green/alpha;data[n+2]=blue/alpha;data[n+3]=alpha;}
 }
 destination.putImageData(pixels,0,0);ctx.drawImage(warped,left/scale,top/scale,warped.width/scale,warped.height/scale);
}
