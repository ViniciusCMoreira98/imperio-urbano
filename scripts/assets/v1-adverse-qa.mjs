import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),out=new URL('assets/3d/reviews/v1-adverse/',root);
await mkdir(out,{recursive:true});
const {states}=JSON.parse(await readFile(new URL('packages/game-data/data/states.json',root))),board=JSON.parse(await readFile(new URL('packages/game-data/data/board.json',root))),rules=JSON.parse(await readFile(new URL('packages/game-data/data/rules.json',root)));
assert.equal(rules.players.max,4,'Review scenarios follow the current server capacity');
const colors=['ROXO','AZUL','VERDE','VERMELHO'],names=['Vinícius do Tabuleiro','Marina Imperial','Lucas','Sofia'];
const scenarios=[{id:'hotels-high-values',host:'SP',blackout:'CE',positions:['RN','MA','MG','SP'],wallets:[1234567,987654,12500,1500],allHotels:true},{id:'crowd-side-blackout',host:'MG',blackout:'MA',group:'MA',wallets:[2500,2500,2500,2500]},{id:'crowd-north',host:'RN',blackout:'MA',group:'RN',wallets:[2500,2500,2500,2500],allHotels:true},{id:'crowd-front',host:'SP',blackout:'CE',group:'SP',wallets:[2500,2500,2500,2500],allHotels:true}];
const index=id=>board.tiles.find(t=>t.id===id).index;
function fixture(s){return{gameId:'hud-visual-fixture',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:1,round:40,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],players:colors.map((pawnColor,i)=>({id:`visual-${i+1}`,nickname:names[i],avatarId:`avatar-${i+1}`,pawnColor,credits:s.wallets[i],position:index(s.group??s.positions[i]),seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false,restPasses:0,rentWaivers:i===0?1:0})),properties:states.map((state,i)=>({stateId:state.id,ownerId:`visual-${i%4+1}`,buildingLevel:s.allHotels||state.id===s.host||state.id===s.group?5:i%6,ownerVisits:30,levelReachedAtVisit:20,blackoutVisitsLeft:state.id===s.blackout?2:0})),olympics:{edition:8,hostStateId:s.host,hostPlayerId:`visual-${states.findIndex(t=>t.id===s.host)%4+1}`,multiplier:Math.max(...rules.olympics.multipliers)},taxPool:60000,gameTimeLeftMs:null,timeUp:false,pendingEventCardId:null,pendingDebt:null,winnerIds:[],turnTimeLeftMs:null}}
const server=await createServer({root:fileURLToPath(root),configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('apps/web/public/',root)),server:{host:'127.0.0.1',port:4193,strictPort:true,watch:{ignored:['**/assets/3d/reviews/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();let browser,active,live;const errors=[],commands=[],checks=[],findings=[];
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({deviceScaleFactor:2,hasTouch:true});await page.emulateMedia({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',r=>r.fulfill({json:{google:false,email:null,photoUrl:null}}));
 await page.routeWebSocket('**/ws/games/hud-visual-fixture?*',ws=>{live=fixture(active);ws.send(JSON.stringify({kind:'SNAPSHOT',snapshot:live}));ws.onMessage(m=>commands.push(JSON.parse(String(m))))});
 let pose;
 for(const scenario of scenarios){active=scenario;for(const[width,height]of(scenario===scenarios[0]?[[1280,720],[800,360],[667,280]]:[[800,360],[667,280]])){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4193/scripts/assets/hud-preview/',{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>window.__imperioArtScene&&window.__board34);await page.waitForTimeout(1500);await page.waitForFunction(()=>innerHeight>500||window.__board34().atlas.width===6144);
  await page.waitForFunction(()=>{const {scene}=window.__imperioArtScene();let buildings=0,pawns=0;scene.traverse(o=>{if(o.name.startsWith('PROPERTY_BUILDING_LEVEL_'))buildings++;if(o.name.startsWith('PAWN_visual-'))pawns++});return buildings===26&&pawns===4},{},{timeout:90000});
  const data=await page.evaluate(()=>{
   const {scene,camera}=window.__imperioArtScene(),b=window.__board34(),r=document.querySelector('canvas').getBoundingClientRect();scene.updateMatrixWorld(true);
   const project=p=>{const v=camera.position.clone().set(...p).project(camera);return{x:(v.x+1)*r.width/2+r.left,y:(1-v.y)*r.height/2+r.top}},box=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
   const rents=[],pawns=[],buildings=[];scene.traverse(o=>{if(o.name.startsWith('RENT_TAG_')){const attr=o.geometry.getAttribute('position'),points=Array.from({length:attr.count},(_,i)=>{const v=camera.position.clone().fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld);return project(v.toArray())}),ctx=o.material.map.image.getContext('2d');ctx.font=`900 ${o.userData.fontAtlas}px Arial,sans-serif`;rents.push({name:o.name,...o.userData,points,textWidthAtlas:ctx.measureText(o.userData.label).width,textFits:ctx.measureText(o.userData.label).width<=o.userData.plaque.width*.84,order:o.renderOrder})}if(o.name.startsWith('PAWN_visual-'))pawns.push({name:o.name,position:o.position.toArray(),scale:o.scale.toArray()});if(o.name.startsWith('PROPERTY_BUILDING_LEVEL_'))buildings.push(o.name)});
   const fields=[...document.querySelectorAll('.hud-player-balance,.hud-player-name')].map(el=>({text:el.textContent,className:el.className,box:box(el),scroll:el.scrollWidth,client:el.clientWidth}));
   const controls=[...document.querySelectorAll('.game-hud-header button,.game-hud-history>button,.hud-action-tray>button')].filter(el=>el.offsetWidth&&el.offsetHeight).map(el=>({name:el.getAttribute('aria-label')||el.textContent,box:box(el)}));
   return{camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov},atlas:b.atlas,rents,pawns,buildings,fields,controls,players:[...document.querySelectorAll('.hud-players>li')].map(box)};
  });
  pose??=data.camera;assert.deepEqual(data.camera,pose);assert.equal(data.rents.length,26);assert.equal(data.buildings.filter(n=>n.endsWith('_5')).length,live.properties.filter(p=>p.buildingLevel===5).length);assert.equal(data.pawns.length,4);
  assert.equal(data.rents.find(t=>t.name==='RENT_TAG_'+scenario.blackout).label,'Apagão');assert.ok(data.rents.every(t=>t.order===20));
  for(const property of live.properties){
   const state=states.find(s=>s.id===property.stateId),amount=state.rent[['base','house1','house2','house3','house4','hotel'][property.buildingLevel]]*(property.stateId===scenario.host?live.olympics.multiplier:1);
   const expected=property.blackoutVisitsLeft?'Apagão':`R$ ${new Intl.NumberFormat('pt-BR').format(amount)}`;
   assert.equal(data.rents.find(t=>t.name==='RENT_TAG_'+property.stateId).label,expected,'Displayed rent follows the scenario and official catalog');
  }
  // Bounds alone miss a control covered by another layer. Exercise real pointer hit testing too.
  for(const name of ['Voltar ao menu','Configurações','Histórico','ROLAR DADOS'])await page.getByRole('button',{name,exact:true}).click({trial:true});
  if(scenario.group){assert.equal(new Set(data.pawns.map(p=>p.position.map(v=>v.toFixed(5)).join(','))).size,4,'Four distinct player bases');}
  for(const field of data.fields)if(field.className.includes('hud-player-balance')&&field.scroll>field.client+1)findings.push({scenario:scenario.id,width,height,kind:'balance-overflow',...field});
  for(const tag of data.rents)if(!tag.textFits)findings.push({scenario:scenario.id,width,height,kind:'rent-clipped',state:tag.name,label:tag.label});
  for(const control of data.controls){const b=control.box;if(b.x<0||b.y<0||b.x+b.width>width+1||b.y+b.height>height+1)findings.push({scenario:scenario.id,width,height,kind:'control-outside-viewport',...control});}
  await page.waitForTimeout(350);
  await page.screenshot({path:fileURLToPath(new URL(`${scenario.id}-${width}x${height}.png`,out)),timeout:60000});
  const target=scenario.group??scenario.host,tile=board.tiles.find(t=>t.id===target);await page.evaluate(i=>window.hudQA.view.getState().selectTile(i),tile.index);await page.getByRole('dialog',{name:new RegExp(states.find(s=>s.id===target).name+'.*consulta','i')}).waitFor();assert.ok(await page.getByRole('dialog').innerText());await page.evaluate(()=>window.hudQA.view.getState().selectTile(null));
  checks.push({scenario:scenario.id,width,height,consultation:true,controlHitTesting:true,officialRents:true,...data});console.log(scenario.id,width,height,'captured');
 }}
 assert.deepEqual(errors,[]);await writeFile(new URL('report.json',out),JSON.stringify({date:'2026-11-09',scope:'Real GameScreen with synthetic server snapshots; no physical phone or multiplayer certification',maxPlayers:rules.players.max,checks,findings,errors},null,2)+'\n');
 console.log(JSON.stringify({captures:checks.length,findings:findings.map(f=>({scenario:f.scenario,width:f.width,kind:f.kind,text:f.text??f.label})),errors}));if(process.argv.includes('--strict'))assert.deepEqual(findings,[]);
}finally{await browser?.close();await server.close()}
