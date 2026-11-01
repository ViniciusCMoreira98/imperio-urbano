import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const manifest=JSON.parse(await readFile(new URL('../../assets/board/board-art-manifest.json',import.meta.url),'utf8'));
for(const source of Object.values(manifest.sources)){
  const bytes=await readFile(new URL(`../../assets/board/${source.file}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256);
}
const output=new URL('../../assets/3d/reviews/board-atlas/',import.meta.url);await mkdir(output,{recursive:true});
const server=await createServer({root:fileURLToPath(new URL('../../',import.meta.url)),configFile:false,esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:4181,strictPort:true}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const checks=[];
 for(const viewport of [{width:1536,height:1100},{width:390,height:844}]){
  const page=await browser.newPage({viewport});const errors=[],apiCalls=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/\/(api|ws)(\/|\?|$)/.test(new URL(r.url()).pathname))apiCalls.push(r.url());});
  await page.goto('http://127.0.0.1:4181/scripts/assets/board-atlas-preview/',{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('.center-art img')?.complete);
  assert.equal(await page.locator('.states svg').count(),27);assert.equal(await page.locator('.specials svg').count(),6);
  const dimensions=await page.locator('svg').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect(),v=el.viewBox.baseVal;return {width:r.width,height:r.height,ratio:v.width/v.height};}));
  assert.ok(dimensions.every(r=>Math.abs(r.width/r.height-r.ratio)<.01));
  const center=await page.locator('.center-art img').evaluate(el=>({naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,ratio:el.width/el.height}));
  assert.equal(center.naturalWidth,1536);assert.equal(center.naturalHeight,1024);assert.ok(Math.abs(center.ratio-1.5)<.01);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
  await page.screenshot({path:fileURLToPath(new URL(`atlas-${viewport.width}.png`,output)),fullPage:true});
  checks.push({viewport,states:27,specials:6,proportionsPreserved:true,center,errors,apiCalls});await page.close();
 }
 await writeFile(new URL('visual.json',output),JSON.stringify({sourceHashesVerified:true,previewOnly:true,checks},null,2)+'\n');console.log(JSON.stringify({viewports:checks.length,states:27,specials:6,proportionsPreserved:true}));
}finally{await browser?.close();await server.close();}
