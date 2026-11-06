import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = new URL('../../', import.meta.url);
const server = await createServer({root:fileURLToPath(root),configFile:false,server:{host:'127.0.0.1',port:4191,strictPort:true}});
await server.listen(); let browser;
try {
  browser = await chromium.launch({headless:true}); const page=await browser.newPage();await page.goto('http://127.0.0.1:4191/');
  const records=[];
  for(const [name,width] of [['background',2560],['logo',1280],['mascot',800],['dice',512]]) {
    const source=`assets/menu-inicial/source/${name}-v1.png`,file=`apps/web/src/main-menu/art/${name}-v1.webp`;
    const result=await page.evaluate(async({source,width})=>{const im=new Image();im.src='/'+source;await im.decode();const c=document.createElement('canvas');c.width=Math.min(width,im.naturalWidth);c.height=Math.round(im.naturalHeight*c.width/im.naturalWidth);const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(im,0,0,c.width,c.height);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let transparent=0,clear=0,minAlpha=255,maxAlpha=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]<255)transparent++;if(pixels[i]===0)clear++;minAlpha=Math.min(minAlpha,pixels[i]);maxAlpha=Math.max(maxAlpha,pixels[i]);}return {base64:c.toDataURL('image/webp',.93).split(',')[1],width:c.width,height:c.height,transparentPixels:transparent,clearPixels:clear,minAlpha,maxAlpha,cornerAlpha:pixels[3]};},{source,width});
    if(name!=='background'&&result.transparentPixels===0)throw new Error(`${name} has no alpha`);
    const buffer=Buffer.from(result.base64,'base64');delete result.base64;await writeFile(new URL(file,root),buffer);
    const original=await readFile(new URL(source,root));records.push({name,file,source,...result,bytes:buffer.length,sourceBytes:original.length,sha256:createHash('sha256').update(buffer).digest('hex'),sourceSha256:createHash('sha256').update(original).digest('hex')});
  }
  const vectors=[];for(const name of (await readdir(new URL('apps/web/src/main-menu/art/',root))).filter(n=>n.endsWith('.svg')).sort()){const file='apps/web/src/main-menu/art/'+name,bytes=await readFile(new URL(file,root));vectors.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),provider:'Imperio Urbano original SVG pipeline',source:'scripts/assets/main-menu-vectors.mjs'});}
  await writeFile(new URL('assets/menu-inicial/manifest.json',root),JSON.stringify({date:'2026-11-06',provider:'OpenAI image_gen built-in',prompts:'assets/menu-inicial/prompts.json',referenceUsage:'Style and composition reference; no portrait crop reused',encoder:`Chromium ${browser.version()} Canvas WebP quality 93`,meshyCredits:0,vectors,records},null,2)+'\n');console.log(JSON.stringify(records.map(({name,bytes,width,height,transparentPixels,clearPixels,minAlpha,maxAlpha,cornerAlpha})=>({name,bytes,width,height,transparentPixels,clearPixels,minAlpha,maxAlpha,cornerAlpha}))));
}finally{await browser?.close();await server.close();}
