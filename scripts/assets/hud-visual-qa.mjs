import { createServer } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../',import.meta.url));
const review = process.env.IMPERIO_ART_REVIEW ?? 'hud-reference';
if(!/^[a-z0-9-]+$/.test(review))throw new Error('Nome de pasta de conferência inválido.');
const output = new URL(`../../assets/3d/reviews/${review}/`,import.meta.url);
const {states} = JSON.parse(await readFile(new URL('../../packages/game-data/data/states.json',import.meta.url),'utf8'));
await mkdir(output,{recursive:true});
const server = await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4180,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();let browser;
const snapshot = {
  gameId:'hud-visual-fixture',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:1,round:3,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],
  players:[['Vinícius','ROXO',1250,1],['Jogador 2','AZUL',980,9],['Jogador 3','VERDE',1450,18],['Jogador 4','VERMELHO',860,27]].map(([nickname,pawnColor,credits,position],i)=>({id:`visual-${i+1}`,nickname,avatarId:`avatar-${i+1}`,pawnColor,credits,position,seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false})),
  properties:states.map(state=>({stateId:state.id,ownerId:null,buildingLevel:0,ownerVisits:0,levelReachedAtVisit:0})),olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},pendingDebt:null,winnerIds:[],turnTimeLeftMs:null,
};
try{
  browser=await chromium.launch({headless:true});const checks=[];
  for(const viewport of [{width:1671,height:941},{width:390,height:844}]){
    const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[],apiCalls=[],commands=[];let socket;
    await page.routeWebSocket('**/ws/games/hud-visual-fixture?*',ws=>{socket=ws;ws.onMessage(message=>commands.push(JSON.parse(String(message))));ws.send(JSON.stringify({kind:'SNAPSHOT',snapshot}));});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiCalls.push(r.url());});
    await page.goto('http://127.0.0.1:4180/scripts/assets/hud-preview/',{waitUntil:'commit',timeout:60000});
    await page.getByRole('list',{name:'Jogadores'}).waitFor({timeout:60000}).catch(async error => {
      console.log(JSON.stringify({errors,body:await page.locator('body').innerText(),socketAttached:!!socket}));
      throw error;
    });
    await page.waitForLoadState('networkidle',{timeout:60000});
    await page.waitForFunction(()=>document.querySelector('canvas')?.width>0);
    assert.equal(await page.locator('.hud-avatar-art:visible').count(),viewport.width>=1024?5:4);
    assert.equal(await page.getByRole('img',{name:'Dados: 4 e 3'}).count(),1);
    await page.getByRole('button',{name:'ROLAR DADOS',exact:true}).click();
    await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===1);
    assert.equal(commands.length,1);assert.equal(commands[0].command.type,'ROLL_DICE');assert.equal(commands[0].expectedVersion,1);
    assert.equal(await page.getByRole('img',{name:'Dados: 4 e 3'}).count(),1);
    await page.screenshot({path:fileURLToPath(new URL(`hud-${viewport.width}.png`,output)),fullPage:true});
    await page.keyboard.press('q');assert.equal(await page.evaluate(()=>window.hudQA.view.getState().quarterTurns),-1);
    socket.send(JSON.stringify({kind:'SNAPSHOT',snapshot:{...snapshot,version:2,lastDice:null,currentPlayerId:'visual-2'}}));
    await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===2);
    assert.equal(await page.getByRole('button',{name:'ROLAR DADOS',exact:true}).count(),0);
    assert.equal(await page.locator('.hud-dice').count(),0);
    await page.evaluate(()=>window.hudQA.view.getState().selectTile(1));
    await page.getByRole('button',{name:'Fechar',exact:true}).waitFor();
    await page.screenshot({path:fileURLToPath(new URL(`hud-property-${viewport.width}.png`,output)),fullPage:true});
    await page.getByRole('button',{name:'Fechar',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.hudQA.view.getState().selectedTile),null);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const boxes=await page.locator('.hud-player-row,.hud-action-tray').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
    assert.ok(boxes.every(r=>r.left>=0&&r.right<=viewport.width&&r.top>=0&&r.bottom<=viewport.height));
    assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
    checks.push({viewport,officialDicePreserved:true,nullDiceHidden:true,rollCommandUnchanged:true,otherTurnNoRoll:true,propertyClose:true,keyboardRotation:true,fitsViewport:true,errors,apiCalls});await context.close();
  }
  await writeFile(new URL('visual.json',output),JSON.stringify({mockedWebSocket:true,realBackend:false,checks},null,2)+'\n');
  console.log(JSON.stringify({viewports:checks.length,officialDicePreserved:true,rollCommandUnchanged:true,apiCalls:0}));
}finally{await browser?.close();await server.close();}
