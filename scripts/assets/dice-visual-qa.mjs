import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../',import.meta.url));
const output=new URL('../../assets/3d/reviews/dice/',import.meta.url);
await mkdir(output,{recursive:true});
const server=await createServer({root,configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4177,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei']}});
await server.listen();let browser;
const isUp = normal => normal && Math.abs(normal[0])<1e-5 && Math.abs(normal[1]-1)<1e-5 && Math.abs(normal[2])<1e-5;
try {
 browser=await chromium.launch({headless:true});const checks=[];
 for(const viewport of [{width:1280,height:1000},{width:390,height:1100}]){
  const page=await browser.newPage({viewport});const errors=[],apiCalls=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(/\/(api|ws)\//.test(r.url()))apiCalls.push(r.url());});
  await page.goto('http://127.0.0.1:4177/scripts/assets/dice-preview/',{waitUntil:'commit',timeout:60000});
  await page.waitForFunction(()=>Object.keys(window.diceQA?.faces??{}).length===6&&window.diceQA?.roll.ready,null,{timeout:60000});
  const initial=await page.evaluate(()=>window.diceQA);
  assert.ok(Object.values(initial.faces).every(face=>isUp(face.normal)));assert.ok(initial.roll.normals.every(isUp));
  await page.screenshot({path:fileURLToPath(new URL(`dice-${viewport.width}.png`,output)),fullPage:true});
  await page.getByRole('button',{name:'Reproduzir demonstração'}).click();
  await page.waitForFunction(()=>window.diceQA?.roll.id===1&&window.diceQA.roll.animating,null,{timeout:10000});
  await page.waitForFunction(()=>window.diceQA?.roll.id===1&&!window.diceQA.roll.animating,null,{timeout:15000});
  const result=await page.evaluate(()=>window.diceQA.roll);
  assert.deepEqual(result.values,[6,1]);assert.ok(result.normals.every(isUp));assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
  await page.screenshot({path:fileURLToPath(new URL(`dice-settled-${viewport.width}.png`,output)),fullPage:true});checks.push({viewport,faces:initial.faces,settled:result,errors,apiCalls});await page.close();
 }
 await writeFile(new URL('visual.json',output),JSON.stringify({checks,demoOnly:true,mobileHardwareBenchmark:false},null,2)+'\n');console.log(JSON.stringify({viewports:checks.length,facesVerified:6,demoSettledOnRequestedFaces:true,apiCalls:0}));
} finally {await browser?.close();await server.close();}
