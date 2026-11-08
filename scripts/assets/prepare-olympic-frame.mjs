import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),source='assets/olympic-host/source/olympic-frame-v1.png',file='apps/web/src/board/board34/art/olympic-frame-v1.webp';
const server=await createServer({root:fileURLToPath(root),configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{host:'127.0.0.1',port:4190,strictPort:true}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto('http://127.0.0.1:4190/');
 const result=await page.evaluate(async source=>{const image=new Image();image.src='/'+source;await image.decode();const c=document.createElement('canvas');c.width=512;c.height=Math.round(image.naturalHeight*512/image.naturalWidth);const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,c.width,c.height);const p=ctx.getImageData(0,0,c.width,c.height).data;let transparentPixels=0,solidPixels=0;for(let i=3;i<p.length;i+=4){if(p[i]===0)transparentPixels++;if(p[i]>=250)solidPixels++;}if(!transparentPixels||!solidPixels)throw Error('Expected transparent background and solid artwork');return{width:c.width,height:c.height,transparentPixels,solidPixels,data:c.toDataURL('image/webp',.92).split(',')[1]};},source);
 const bytes=Buffer.from(result.data,'base64');await writeFile(new URL(file,root),bytes);const original=await readFile(new URL(source,root));const {data,...metrics}=result;
 await writeFile(new URL('assets/olympic-host/frame-manifest.json',root),JSON.stringify({date:'2026-11-07',provider:'OpenAI image_gen built-in',source,sourceSha256:createHash('sha256').update(original).digest('hex'),file,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,...metrics,prompt:'assets/olympic-host/frame-prompt.json',encoder:`Chromium ${browser.version()} WebP quality 92`,meshyCredits:0,integrated:false},null,2)+'\n');console.log(JSON.stringify({file,bytes:bytes.length,...metrics}));
}finally{await browser?.close();await server.close();}
