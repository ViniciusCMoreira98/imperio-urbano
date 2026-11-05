import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=new URL('../../assets/3d/reviews/occupancy/',import.meta.url);await mkdir(out,{recursive:true});
const layout=JSON.parse(await readFile(new URL('../../apps/web/src/board/reference33/layout.json',import.meta.url),'utf8'));
let version=0;
function snapshot(tileId,count=4,level=4,avatarShift=0){
 const tile=layout.tiles.find(t=>t.id===tileId);
 return {gameId:'hud-visual-fixture',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:++version,round:3,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],players:Array.from({length:count},(_,i)=>({id:`visual-${i+1}`,nickname:`Jogador ${i+1}`,avatarId:`avatar-${(i+avatarShift)%5+1}`,pawnColor:['ROXO','AZUL','VERDE','VERMELHO'][i],credits:1250,position:tile.index,seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false})),properties:layout.tiles.filter(t=>t.type==='PROPERTY').map(t=>({stateId:t.id,ownerId:t.id===tileId?'visual-1':null,buildingLevel:t.id===tileId?level:0,ownerVisits:6,levelReachedAtVisit:5})),olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},pendingDebt:null,winnerIds:[],turnTimeLeftMs:null};
}
const server=await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4185,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
 const errors=[],warnings=[],api=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning'&&m.text().includes('[personagens]'))warnings.push(m.text());});
 page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))api.push(r.url());});
 const initial=snapshot('AM');
 await page.routeWebSocket('**/ws/games/hud-visual-fixture?*',ws=>ws.send(JSON.stringify({kind:'SNAPSHOT',snapshot:initial})));
 await page.goto('http://127.0.0.1:4185/scripts/assets/hud-preview/',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>!!window.__imperioArtScene&&!!window.__imperioPawns);
 const results=[];
 async function capture(tile,count,level,shift=0){
  const state=snapshot(tile,count,level,shift);
  await page.evaluate(s=>{window.hudQA.view.getState().selectTile(null);window.hudQA.game.getState().receive({kind:'SNAPSHOT',snapshot:s});},state);
  await page.waitForFunction(({n,t})=>Object.keys(window.__imperioPawns??{}).length===n&&Object.values(window.__imperioPawns).every(p=>p.resting&&p.tile===t),{n:count,t:state.players[0].position});
  await page.waitForLoadState('networkidle');
  // Espera a câmera/face acomodarem; não altera nem pausa animações da produção.
  await page.evaluate(()=>new Promise(resolve=>{let n=0;const tick=()=>++n===40?resolve():requestAnimationFrame(tick);requestAnimationFrame(tick);}));
  const result=await page.evaluate(async id=>(await import('/scripts/assets/inspect-occupancy.ts')).inspectOccupancy(id),tile);
  assert.equal(result.pawns.length,count);assert.ok(result.pawns.every(p=>p.vertices>0));assert.equal(result.buildings.length,level===5?1:level);
  const suffix=`${page.viewportSize().width}-${tile}-${count}p-${level}-${shift}`;
  await page.screenshot({path:fileURLToPath(new URL(`${suffix}.png`,out))});
  results.push({...result,viewport:page.viewportSize(),players:count,level,avatarShift:shift,screenshot:`${suffix}.png`});
 }
 for(const id of ['AM','ES','CE','DF','PI'])await capture(id,4,4);
 await capture('ES',4,5,1);
 await capture('AM',1,0);
 await page.setViewportSize({width:390,height:844});
 await capture('AM',4,4);await capture('ES',4,4);await capture('ES',4,5,1);await capture('AM',1,0);
 assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(api,[]);
 const constructionClearance=Math.min(...results.flatMap(r=>r.buildings.map(b=>b.minClearance)));
 assert.ok(constructionClearance>=0,'Algum vértice das construções saiu do polígono real.');
 const report={constructionClearance,limitations:['Vértices capturados numa pose de idle; não cobre todo o ciclo de animação.','Sobreposição visual dos corpos não é medida pelos testes de bases.','Não verifica backend, multiplayer, saltos ou aprovação final da composição.'],source:'GameScreen real com snapshots sintéticos; sem backend e sem comandos.',pawnScale:.75,baseRadius:.1875,results,errors,warnings,apiCalls:api,paidCredits:0};
 await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({scenarios:results.length,pawnPixelHeightRange:[Math.min(...results.flatMap(r=>r.pawns.map(p=>p.heightPixels))),Math.max(...results.flatMap(r=>r.pawns.map(p=>p.heightPixels)))],minPawnClearance:Math.min(...results.flatMap(r=>r.pawns.map(p=>p.minClearance))),minBuildingClearance:Math.min(...results.flatMap(r=>r.buildings.map(b=>b.minClearance))),errors,warnings}));
}finally{await browser?.close();await server.close();}
