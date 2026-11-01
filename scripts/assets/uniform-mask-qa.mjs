import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../',import.meta.url));
const output=new URL('../../assets/3d/reviews/uniform-mask/',import.meta.url);
await mkdir(output,{recursive:true});
const descriptor=JSON.parse(await readFile(new URL('../../apps/web/public/models/characters/steampunk-brasil-v01-uniform-v04.json',import.meta.url)));
const server=await createServer({root,configFile:false,publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4176,strictPort:true},optimizeDeps:{include:['three']}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const checks=[];
 for(const viewport of [{width:1280,height:1150},{width:430,height:1400}]){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4176/scripts/assets/uniform-preview.html');
  await page.waitForFunction(()=>window.uniformQA?.ready,null,{timeout:45000});
  const result=await page.evaluate(()=>window.uniformQA);
  assert.equal(result.uniqueMaterials,6);assert.equal(result.sourceMaterialUnchanged,true);assert.equal(result.maskFlipY,false);assert.equal(result.maskColorSpace,'');assert.deepEqual(result.maskSize,[1024,1024]);assert.equal(result.colors.length,6);assert.ok(Math.abs(result.maskedTexelsAboveHalf-descriptor.maskedTexelsAboveHalf)<=8,'PNG de 8 bits pode arredondar poucos texels na borda de 50%');assert.deepEqual(errors,[]);
  assert.ok(result.pixelChecks.every(c=>c.head.max<=1&&c.face.max<=1&&c.boots.max<=1),'Cabeça, rosto e botas devem preservar sua cor no mesmo viewport');assert.ok(result.pixelChecks.every(c=>c.coat.changed>100),'O casaco precisa mudar visivelmente');
  await page.screenshot({path:fileURLToPath(new URL(`uniform-${viewport.width}.png`,output)),fullPage:true});await page.getByRole('button',{name:'Costas',exact:true}).click();await page.screenshot({path:fileURLToPath(new URL(`uniform-back-${viewport.width}.png`,output)),fullPage:true});checks.push({viewport,...result,errors});await page.close();
 }
 await writeFile(new URL('preview.json',output),JSON.stringify({checks,productionLoaderChanged:false,mobileHardwareBenchmark:false},null,2)+'\n');console.log(JSON.stringify({viewports:checks.length,colors:6,uniqueMaterials:6,protectedPixelDelta:Math.max(...checks.flatMap(c=>c.pixelChecks.flatMap(p=>[p.head.max,p.face.max,p.boots.max]))),productionLoaderChanged:false}));
}finally{await browser?.close();await server.close();}
