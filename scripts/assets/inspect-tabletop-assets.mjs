import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';
const directory='apps/web/src/tabletop-ui/art/';
const items={};
for(const id of['rent-plaque','player-frame','action-dock']){
 const file=`${id}-v1.png`,bytes=fs.readFileSync(directory+file),width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 if(bytes[24]!==8||bytes[25]!==6||bytes[28]!==0)throw Error('PNG precisa ser RGBA8 sem interlace');
 const chunks=[];for(let i=8;i<bytes.length;){const n=bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8);if(type==='IDAT')chunks.push(bytes.subarray(i+8,i+8+n));i+=n+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4;
 let previous=Buffer.alloc(stride),offset=0,minX=width,minY=height,maxX=-1,maxY=-1,transparent=0,solid=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[offset++],row=Buffer.alloc(stride);
  for(let i=0;i<stride;i++){
   const a=i>=4?row[i-4]:0,b=previous[i],c=i>=4?previous[i-4]:0;
   const prediction=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):NaN;
   if(!Number.isFinite(prediction))throw Error('Filtro PNG desconhecido');row[i]=(raw[offset++]+prediction)&255;
  }
  for(let x=0;x<width;x++){const a=row[x*4+3];if(a===0)transparent++;if(a>176){solid++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
  previous=row;
 }
 if(transparent===0||solid===0)throw Error('Asset precisa ter transparência e conteúdo');
 const left=Math.max(0,minX-4),top=Math.max(0,minY-4),right=Math.min(width,maxX+5),bottom=Math.min(height,maxY+5);
 items[id]={file,width,height,viewBox:[left,top,right-left,bottom-top],transparentPixels:transparent,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
fs.writeFileSync(directory+'assets.json',JSON.stringify({schemaVersion:1,assets:items},null,2)+'\n');console.log(JSON.stringify(items,null,2));
