import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=new URL('../../assets/3d/reviews/surroundings/',import.meta.url);await mkdir(out,{recursive:true});
const layout=JSON.parse(await readFile(new URL('../../apps/web/src/board/reference33/layout.json',import.meta.url),'utf8'));
const server=await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4187,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
 const errors=[],apiCalls=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiCalls.push(r.url());});
 await page.goto('http://127.0.0.1:4187/scripts/assets/surroundings-preview/',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>!!window.__reference33&&!!window.__imperioArtScene&&Object.keys(window.__imperioPawns??{}).length===4);
 const initial=await page.evaluate(()=>window.__imperioStaticCamera());
 const results=[];
 for(const [width,height] of [[1536,1024],[1920,1080],[1366,768],[1024,768],[844,390],[390,844],[768,1024],[320,568]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(async()=>{
   const {surroundingsLayout}=await import('/apps/web/src/board/surroundings/surroundingsLayout.ts');
   const expected=surroundingsLayout(innerWidth,innerHeight).boardViewport;
   const real=document.querySelector('.board-composition')?.getBoundingClientRect();
   return real&&Math.abs(real.width-expected.width)<1&&Math.abs(real.height-expected.height)<1&&Math.abs(real.x-expected.x)<1&&Math.abs(real.y-expected.y)<1;
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const geometry=await page.evaluate(()=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
   const board=rect(document.querySelector('.board-composition'));
   const safe=Object.fromEntries([...document.querySelectorAll('[data-hud-safe]')].map(el=>[el.dataset.hudSafe,{...rect(el),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}]));
   return {board,safe,documentOverflow:document.documentElement.scrollWidth>innerWidth,players:document.querySelectorAll('[aria-label="Jogadores"] li').length};
  });
  assert.equal(geometry.documentOverflow,false);assert.equal(geometry.players,4);
  const overlaps=(a,b)=>a.x<b.x+b.width-.1&&a.x+a.width>b.x+.1&&a.y<b.y+b.height-.1&&a.y+a.height>b.y+.1;
  for(const area of Object.values(geometry.safe))assert.equal(overlaps(geometry.board,area),false);
  for(const area of Object.values(geometry.safe))assert.ok(area.scrollWidth<=area.clientWidth+1,'Painel precisa caber horizontalmente no slot.');
  assert.ok(geometry.safe.top.scrollHeight<=geometry.safe.top.clientHeight+1,'Jogadores devem ficar visíveis sem rolagem vertical.');
  assert.ok(geometry.safe.bottom.scrollHeight<=geometry.safe.bottom.clientHeight+1,'Barra e prazo devem ficar visíveis sem corte: '+JSON.stringify({width,height,bottom:geometry.safe.bottom}));
  const roll=await page.getByRole('button',{name:'ROLAR DADOS'}).boundingBox();
  assert.ok(roll&&roll.y>=geometry.safe.bottom.y&&roll.y+roll.height<=geometry.safe.bottom.y+geometry.safe.bottom.height+1,'Botão de rolar deve ficar inteiro na área inferior.');
  assert.equal(await page.getByLabel(/segundos restantes/).count(),1);
  assert.deepEqual(await page.evaluate(()=>window.__imperioStaticCamera()),initial);
  const filename=`surroundings-${width}x${height}.png`;
  await page.screenshot({path:fileURLToPath(new URL(filename,out))});results.push({viewport:{width,height},...geometry,screenshot:filename});
 }
 await page.setViewportSize({width:1536,height:1024});
 await page.waitForFunction(()=>document.querySelector('.board-composition').getBoundingClientRect().width>1100);
 const bounds=await page.locator('.board-composition').boundingBox();
 for(const tile of layout.tiles){
  const x=tile.pixels.reduce((sum,p)=>sum+p[0],0)/tile.pixels.length,y=tile.pixels.reduce((sum,p)=>sum+p[1],0)/tile.pixels.length;
  await page.mouse.click(bounds.x+x/1536*bounds.width,bounds.y+y/1024*bounds.height);
  await page.waitForFunction(index=>window.surroundingsQA.view.getState().selectedTile===index,tile.index);
 }
 await page.getByRole('button',{name:'ROLAR DADOS'}).click();
 assert.deepEqual(await page.evaluate(()=>window.surroundingsQA.commands),[{type:'ROLL_DICE'}]);
 await page.getByRole('button',{name:'Fechar',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.surroundingsQA.view.getState().selectedTile),null);
 // Reabre ES para conferir rolagem do painel e captura final da referência.
 await page.evaluate(()=>window.surroundingsQA.view.getState().selectTile(15));
 await page.setViewportSize({width:390,height:844});
 const side=page.locator('[data-hud-safe="side"]');
 await side.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 assert.ok(await side.evaluate(el=>el.scrollTop>0),'A carta alta deve poder rolar no celular.');
 await side.evaluate(el=>{el.scrollTop=0;});
 assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
 const report={source:'BoardSurroundings com GameBoard e painéis reais; snapshot sintético sem backend.',results,clicksVerified:33,cameraInvariant:true,rollCommandPreserved:true,countdownVisible:true,closePreserved:true,mobileSideScroll:true,paidCredits:0,integrationPending:true,errors,apiCalls};
 await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({viewports:results.length,clicks:33,cameraInvariant:true,errors}));
}finally{await browser?.close();await server.close();}
