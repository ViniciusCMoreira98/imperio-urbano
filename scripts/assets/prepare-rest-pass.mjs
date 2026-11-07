import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),source='assets/eventos/source/passe-livre-v1.png',file='apps/web/src/event-art/art/passe-livre-v1.webp';
const server=await createServer({root:fileURLToPath(root),configFile:false,server:{host:'127.0.0.1',port:4196,strictPort:true}});await server.listen();let browser;
try {browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto('http://127.0.0.1:4196/');
 const result=await page.evaluate(async source=>{const image=new Image();image.src='/'+source;await image.decode();const c=document.createElement('canvas');c.width=1280;c.height=Math.round(image.naturalHeight*c.width/image.naturalWidth);c.getContext('2d').drawImage(image,0,0,c.width,c.height);return{width:c.width,height:c.height,data:c.toDataURL('image/webp',.92).split(',')[1]};},source);
 const bytes=Buffer.from(result.data,'base64');await writeFile(new URL(file,root),bytes);const original=await readFile(new URL(source,root));
 await writeFile(new URL('assets/eventos/passe-livre-manifest.json',root),JSON.stringify({date:'2026-11-07',provider:'OpenAI image_gen built-in',prompt:'assets/eventos/passe-livre-prompt.json',source,file,width:result.width,height:result.height,sourceBytes:original.length,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceSha256:createHash('sha256').update(original).digest('hex'),encoder:`Chromium ${browser.version()} WebP quality 92`,meshyCredits:0},null,2)+'\n');console.log(JSON.stringify({width:result.width,height:result.height,bytes:bytes.length}));
} finally {await browser?.close();await server.close();}
