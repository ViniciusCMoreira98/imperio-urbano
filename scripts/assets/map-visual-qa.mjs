import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = new URL('../../assets/3d/reviews/map-cards/', import.meta.url);
const {cards} = JSON.parse(await readFile(new URL('../../packages/game-data/data/events.json', import.meta.url),'utf8'));
await mkdir(output,{recursive:true});
const server = await createServer({root,configFile:false,esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:4179,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber']}});
await server.listen(); let browser;
try {
  browser = await chromium.launch({headless:true});
  const checks = [];
  for (const viewport of [{width:1280,height:1000},{width:390,height:1000}]) {
    const page = await browser.newPage({viewport}); const errors=[],apiCalls=[];
    page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    page.on('request',r=>{if(/\/(api|ws)(\/|\?|$)/.test(new URL(r.url()).pathname)) apiCalls.push(r.url());});
    await page.goto('http://127.0.0.1:4179/scripts/assets/map-preview/',{waitUntil:'commit',timeout:60000});
    await page.waitForFunction(()=>window.mapQA?.ready && window.mapQA.triangles>0,null,{timeout:60000});
    assert.equal((await page.evaluate(()=>window.mapQA.states)).length,27);
    const target = await page.evaluate(()=>window.mapQA.click);
    await page.mouse.click(target.x,target.y);
    await page.waitForFunction(()=>window.mapQA.selectedTile===0,null,{timeout:10000});
    for (const card of cards) {
      await page.getByLabel('Conferir carta').selectOption(card.id);
      assert.equal(await page.locator('.iu-event-card h3').textContent(),card.title);
      assert.equal(await page.locator('.iu-event-card__text').textContent(),card.text);
      assert.equal(await page.locator('.iu-event-card__illustration').count(),1);
    }
    await page.getByLabel('Conferir carta').selectOption('reforma-urbana');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:fileURLToPath(new URL(`map-cards-${viewport.width}.png`,output)),fullPage:true});
    const canvases = await page.locator('.art canvas').evaluateAll(nodes=>nodes.map(canvas=>({name:canvas.getAttribute('aria-label'),width:canvas.width,height:canvas.height,bytes:canvas.width*canvas.height*4})));
    assert.ok(canvases.every(canvas=>canvas.width>0&&canvas.height>0));
    if(viewport.width===1280){
      await page.locator('.art--map').screenshot({path:fileURLToPath(new URL('brazil-map.png',output))});
      await page.locator('.scene').screenshot({path:fileURLToPath(new URL('board-map.png',output))});
    }
    assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
    checks.push({viewport,states:27,cards:cards.length,selectedTile:0,noHorizontalOverflow:true,canvases,errors,apiCalls});
    await page.close();
  }
  await writeFile(new URL('visual.json',output),JSON.stringify({checks,hardwareBenchmark:false},null,2)+'\n');
  console.log(JSON.stringify({viewports:checks.length,states:27,cards:cards.length,tileSelection:true,apiCalls:0}));
} finally {await browser?.close();await server.close();}
