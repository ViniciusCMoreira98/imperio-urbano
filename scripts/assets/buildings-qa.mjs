import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=new URL('../../assets/3d/reviews/buildings/',import.meta.url);
await mkdir(out,{recursive:true});
const server=await createServer({root,configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4198,strictPort:true,watch:{ignored:['**/assets/3d/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','three/examples/jsm/environments/RoomEnvironment.js']}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1536,height:1088},deviceScaleFactor:1}),errors=[],failedRequests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failedRequests.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:4198/scripts/assets/board34-preview/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!!window.__imperioArtScene&&!!window.board34QA);
 const initial=await page.evaluate(()=>window.__imperioStaticCamera());const levels=[];
 for(let level=0;level<=5;level++){
  await page.evaluate(level=>{window.board34QA.setSelected('RN');window.board34QA.setLevel(level);window.board34QA.setCount(4);},level);
  await page.waitForFunction(level=>{const scene=window.__imperioArtScene().scene;return !!scene.getObjectByName(`PROPERTY_BUILDING_LEVEL_${level}`)&&!!scene.getObjectByName('INSPECTION_PAWN_3');},level,{timeout:30000});
  await page.waitForLoadState('networkidle');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const count=await page.evaluate(()=>{let n=0;window.__imperioArtScene().scene.traverse(o=>{if(o.name.startsWith('PROPERTY_BUILDING_LEVEL_'))n++;});return n;});assert.equal(count,1);
  const bound=await page.locator('.board-composition').boundingBox();await page.screenshot({clip:bound,path:fileURLToPath(new URL(`board-level-${level}.png`,out))});levels.push({level,models:count,players:4});
 }
 await page.evaluate(()=>window.board34QA.setLevel(0));
 await page.waitForFunction(()=>!!window.__imperioArtScene().scene.getObjectByName('PROPERTY_BUILDING_LEVEL_0'));
 const mobile=[];
 for(const[width,height]of[[844,390],[932,430],[667,375]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.deepEqual(await page.evaluate(()=>window.__imperioStaticCamera()),initial);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:fileURLToPath(new URL(`terrain-${width}x${height}.png`,out)),fullPage:true});mobile.push({width,height,level:0});
 }
 await page.setViewportSize({width:1700,height:880});await page.goto('http://127.0.0.1:4198/scripts/assets/buildings-preview/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>[0,1,2,3,4,5].every(n=>window.__buildingStudio?.scene.getObjectByName(`PROPERTY_BUILDING_LEVEL_${n}`)));
 const colors=await page.evaluate(()=>{const result=[];window.__buildingStudio.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.name==='OWNER_ACCENT')result.push(m.color.getHexString());});return result;});assert.equal(colors.length,6);
 await page.locator('select').selectOption('#479cec');await page.waitForFunction(()=>{const colors=[];window.__buildingStudio.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.name==='OWNER_ACCENT')colors.push(m.color.getHexString());});return colors.length===6&&colors.every(c=>c==='479cec');});
 assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
 const report={provider:'Meshy 7.1 image-to-3d',levels,ownershipColorChanges:true,cameraUnchanged:true,mobileLandscape:mobile,errors,failedRequests,paidCredits:280,balanceAfter:670};await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await server.close();}
