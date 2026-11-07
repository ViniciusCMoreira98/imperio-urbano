import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),out=new URL('assets/3d/reviews/praia-tropical/',root);
await mkdir(out,{recursive:true});
const server=await createServer({root:fileURLToPath(root),configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('apps/web/public/',root)),server:{host:'127.0.0.1',port:4194,strictPort:true,watch:{ignored:['**/assets/3d/reviews/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','three/examples/jsm/environments/RoomEnvironment.js']}});
await server.listen();let browser;
try {
 browser=await chromium.launch({headless:true});const page=await browser.newPage(),errors=[],failed=[],screens=[];page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[1280,720],[844,390],[667,375]]) {
  await page.setViewportSize({width,height});
  await page.goto('http://127.0.0.1:4194/scripts/assets/board34-preview/?environment=beach',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__board34&&window.__imperioArtScene?.().scene.getObjectByName('TROPICAL_BEACH_ENVIRONMENT'));
  await page.waitForFunction(()=>window.__imperioArtScene().scene.background?.isTexture);
  const details=await page.evaluate(()=>{const {scene}=window.__imperioArtScene(),b=scene.background;return {tiles:window.__board34().layout.tiles.length,width:b.image.width,height:b.image.height,repeat:b.repeat.toArray(),offset:b.offset.toArray(),oldDecor:!!scene.getObjectByName('TABLETOP_MUG'),shadow:!!scene.getObjectByName('BEACH_CONTACT_SHADOW')};});
  assert.equal(details.tiles,34);assert.equal(details.oldDecor,false);assert.equal(details.shadow,true);assert.ok(details.width>1500);assert.ok(details.repeat.every(n=>n>0&&n<=1));
  const framing=await page.evaluate(async()=>{const {tabletopViewport}=await import('/apps/web/src/board/camera/tabletopViewport.ts');const current=tabletopViewport(innerWidth,innerHeight,'immersive'),previous=tabletopViewport(innerWidth,innerHeight-64);const {camera}=window.__imperioArtScene();const points=window.__board34().layout.tiles.flatMap(t=>t.polygon).map(p=>camera.position.clone().set(...p).project(camera));return {gain:current.scale/previous.scale,allTilesInside:points.every(p=>Math.abs(p.x)<1&&Math.abs(p.y)<1),canvasHeight:document.querySelector('canvas').getBoundingClientRect().height};});
  assert.ok(framing.gain>1);assert.equal(framing.allTilesInside,true);assert.equal(framing.canvasHeight,height);
  const positions=await page.evaluate(()=>{const {camera}=window.__imperioArtScene(),r=document.querySelector('canvas').getBoundingClientRect();return window.__board34().layout.tiles.map(t=>{const v=camera.position.clone().set(t.anchor.x,t.anchor.surfaceY+.001,t.anchor.z).project(camera);return {id:t.id,x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});});
  const sampled=positions.filter((_,index)=>[0,9,17,26].includes(index));for(const p of sampled){await page.mouse.click(p.x,p.y);try{await page.waitForFunction(id=>window.board34QA.selected===id,p.id,{timeout:10000});}catch(e){throw Error(width+'x'+height+' click '+p.id+' at '+p.x+','+p.y+': '+e.message);}}
  await page.screenshot({path:fileURLToPath(new URL(`board-${width}x${height}.png`,out)),clip:await page.locator('.board-composition').boundingBox()});
  screens.push({width,height,...details,...framing,clicks:sampled.length});console.log(JSON.stringify({width,height,gain:framing.gain,clicks:sampled.length}));
 }
 await page.goto('http://127.0.0.1:4194/scripts/assets/board34-preview/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!!window.__imperioArtScene?.().scene.getObjectByName('TABLETOP_ENVIRONMENT'));
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await writeFile(new URL('report.json',out),JSON.stringify({screens,defaultWoodPreserved:true,realBoard:true,noBackend:true,errors,failed},null,2)+'\n');
 console.log(JSON.stringify({screens:screens.length,tileClicks:screens.reduce((total,s)=>total+s.clicks,0),errors:0}));
} finally {await browser?.close();await server.close();}
