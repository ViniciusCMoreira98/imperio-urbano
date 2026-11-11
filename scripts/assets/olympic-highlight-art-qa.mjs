import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),dir='assets/olympic-host/highlight-v3/';
await mkdir(new URL(dir+'previews/',root),{recursive:true});
const server=await createServer({root:fileURLToPath(root),configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{host:'127.0.0.1',port:4197,strictPort:true}});await server.listen();let browser;const assets=[],errors=[],checks=[];
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({deviceScaleFactor:2});page.setDefaultTimeout(20000);
 for(const [name,width] of [['frame',768],['badge',768]]){
  const source=dir+name+'-source.png',file=dir+name+'.webp';await page.goto('http://127.0.0.1:4197/'+source);
  const encoded=await page.evaluate(async({source,width,name})=>{const img=new Image();img.src='/'+source;await img.decode();const c=document.createElement('canvas');c.width=width;c.height=Math.round(img.naturalHeight*width/img.naturalWidth);const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,c.width,c.height);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let transparent=0,solid=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]>=250)solid++;}const safeAreas=name==='frame'?[[.2,.32],[.8,.32],[.2,.42],[.8,.42],[.2,.75],[.8,.75],[.25,.88],[.75,.88]]:[];const protectedAlpha=safeAreas.map(([x,y])=>pixels[(Math.floor(y*c.height)*c.width+Math.floor(x*c.width))*4+3]);return{sourceWidth:img.naturalWidth,sourceHeight:img.naturalHeight,width:c.width,height:c.height,transparent,solid,protectedAlpha,data:c.toDataURL('image/webp',.95).split(',')[1]};},{source,width,name});
  assert.ok(encoded.transparent>0&&encoded.solid>0);assert.ok(encoded.protectedAlpha.every(a=>a<10),'Name, picture and rent area must stay transparent');const bytes=Buffer.from(encoded.data,'base64');await writeFile(new URL(file,root),bytes);const{data,...metrics}=encoded;assets.push({name,source,file,...metrics,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceSha256:createHash('sha256').update(await readFile(new URL(source,root))).digest('hex')});
 }
 page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height,query,name] of [[1000,820,'','comparison'],[700,700,'?single','host-closeup'],[800,360,'','comparison-small']]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4197/scripts/assets/olympic-highlight-preview/'+query,{waitUntil:'networkidle'});await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
  const info=await page.evaluate(()=>{const photo=document.querySelector('.host .photo'),frame=document.querySelector('.frame'),r=photo.getBoundingClientRect();return{label:document.querySelector('.host-title').textContent,state:document.querySelector('.host .state-name').textContent,rent:document.querySelector('.host-rent').textContent,baseRent:document.querySelector('.base-rent').textContent,photoAspect:r.width/r.height,sourceAspect:photo.naturalWidth/photo.naturalHeight,frameAspect:frame.clientWidth/frame.clientHeight,frameSourceAspect:frame.naturalWidth/frame.naturalHeight,overflow:[...document.querySelectorAll('.host-title,.host .state-name,.host .rent')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)}});
  assert.equal(info.label,'SEDE OLÍMPICA');assert.ok(info.state.includes('São Paulo'));assert.ok(Math.abs(info.photoAspect/info.sourceAspect-1)<.01);assert.ok(Math.abs(info.frameAspect/info.frameSourceAspect-1)<.01);assert.deepEqual(info.overflow,[]);await page.screenshot({path:fileURLToPath(new URL(dir+'previews/'+name+'.png',root))});checks.push({width,height,name,...info});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL(dir+'manifest.json',root),JSON.stringify({date:'2026-11-11',provider:'OpenAI image_gen built-in',assets,photo:'apps/web/src/board/board34/art/v3/sp-board-v3.png',newImageGenerations:2,meshyCredits:0,integrated:false},null,2)+'\n');await writeFile(new URL(dir+'previews/report.json',root),JSON.stringify({date:'2026-11-11',scope:'Frontal art study using existing state image; not a gameplay capture',checks,errors},null,2)+'\n');console.log(JSON.stringify({assets:assets.map(a=>({name:a.name,bytes:a.bytes,width:a.width,height:a.height})),captures:checks.length,errors}));
}finally{await browser?.close();await server.close();}
