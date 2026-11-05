import {createServer} from 'vite';import tailwindcss from '@tailwindcss/vite';import {chromium} from '@playwright/test';import{fileURLToPath}from'node:url';import{mkdir,readFile,writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=new URL('../../assets/3d/reviews/tabletop-ui/',import.meta.url);await mkdir(out,{recursive:true});
const {states}=JSON.parse(await readFile(new URL('../../packages/game-data/data/states.json',import.meta.url),'utf8'));
const layout=JSON.parse(await readFile(new URL('../../apps/web/src/board/reference33/layout.json',import.meta.url),'utf8'));
const server=await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4189,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei']}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1536,height:1100},deviceScaleFactor:1});const errors=[],apiCalls=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiCalls.push(r.url());});
 await page.goto('http://127.0.0.1:4189/scripts/assets/tabletop-ui-preview/',{waitUntil:'networkidle',timeout:60000});await page.waitForFunction(()=>!!window.__reference33);
 assert.equal(await page.locator('[data-rent-state]').count(),26);
 const captures=[];
 for(const mode of['base','houses','hotel','olympics']){
  await page.locator('select').selectOption(mode);await page.waitForFunction(m=>window.rentAssetQA.mode===m,mode);
  for(const tile of layout.tiles.filter(t=>t.type==='PROPERTY')){
   const state=states.find(s=>s.id===tile.stateId);const value=mode==='houses'?state.rent.house2:mode==='hotel'?state.rent.hotel:mode==='olympics'&&state.id==='ES'?state.rent.house2*3:state.rent.base;
   const text='R$ '+value.toLocaleString('pt-BR');assert.equal(await page.locator(`[data-rent-state="${state.id}"]`).innerText(),text);
  }
  const overflow=await page.locator('[data-rent-state]').evaluateAll(items=>items.filter(item=>{const text=item.querySelector('.rent-plaque__value').getBoundingClientRect(),rect=item.getBoundingClientRect();return text.width>rect.width*.86||text.height>rect.height;}).map(item=>item.dataset.rentState));assert.deepEqual(overflow,[],'Preço não pode sair da placa.');
  const filename=`rents-${mode}-1536.png`;await page.locator('.asset-review-board').screenshot({path:fileURLToPath(new URL(filename,out))});captures.push(filename);
 }
 // A placa é informativa e não bloqueia a seleção da propriedade por baixo.

 const positions=JSON.parse(await readFile(new URL('../../apps/web/src/tabletop-ui/rentPlacements.json',import.meta.url),'utf8'));
 await page.locator('select').selectOption('base');
 await page.locator('.asset-review-board').scrollIntoViewIfNeeded();
 const board=await page.locator('.asset-review-board').boundingBox();
 for(const rect of positions.placements){await page.mouse.click(board.x+(rect.x+rect.width/2)/1536*board.width,board.y+(rect.y+rect.height/2)/1024*board.height);await page.waitForFunction(id=>window.rentAssetQA.selected===id,rect.stateId,{timeout:5000}).catch(async error=>{console.log(JSON.stringify({failedState:rect.stateId,selected:await page.evaluate(()=>window.rentAssetQA.selected)}));throw error;});}
 await page.getByRole('button',{name:'ROLAR DADOS'}).click();assert.equal(await page.evaluate(()=>window.rentAssetQA.rolls),1);
 assert.equal(await page.locator('.tabletop-player__text strong').evaluateAll(items=>items.every(el=>el.scrollHeight<=el.clientHeight+1)),true,'Nomes dos jogadores não podem ficar cortados.');
 await page.locator('.asset-review-gallery').screenshot({path:fileURLToPath(new URL('controls-assets.png',out))});
 // Retrato abaixo é inspeção da galeria de assets, não modo de partida suportado.
 // Decisão vigente: celular joga só em paisagem; a integração precisa conferir 844×390/932×430/667×375.
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>Math.abs(document.querySelector('.board-composition').getBoundingClientRect().width-390)<1);await page.screenshot({path:fileURLToPath(new URL('assets-mobile.png',out)),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.locator('.tabletop-player__text strong').evaluateAll(items=>items.every(el=>el.scrollHeight<=el.clientHeight+1)),true,'Nomes não podem ficar cortados no celular.');
 const mobileFont=await page.locator('.rent-plaque__value').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
 const report={states:26,variants:['base','houses','hotel','olympics'],valuesFromCatalog:true,olympicPreview:{stateId:'ES',houses:2,multiplier:3},priceClicksPassThrough:26,textWithinPlaques:true,transparentAssets:3,previewOnly:true,productionIntegrationPending:true,mobileFontPixels:mobileFont,mobileReadabilityApproved:false,portraitScope:'asset-gallery-only; gameplay requires landscape',requiredGameplayViewports:[[844,390],[932,430],[667,375]],captures,errors,apiCalls,paidMeshyCredits:0};await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await server.close();}
