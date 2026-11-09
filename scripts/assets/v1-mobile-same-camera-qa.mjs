import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),out=new URL('assets/3d/reviews/v1-mobile-same-camera/',root);
await mkdir(out,{recursive:true});
const {states}=JSON.parse(await readFile(new URL('packages/game-data/data/states.json',root)));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const makeFixture=count=>({gameId:'hud-visual-fixture',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:1,round:3,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],players:Array.from({length:count},(_,i)=>({id:`visual-${i+1}`,nickname:['Vinícius','Marina','Lucas','Sofia'][i%4],avatarId:`avatar-${i%5+1}`,pawnColor:['ROXO','AZUL','VERDE','VERMELHO'][i%4],credits:1500,position:i===0?17:i*7%34,seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false,restPasses:0,rentWaivers:i===0?1:0})),properties:states.map(s=>({stateId:s.id,ownerId:'visual-1',buildingLevel:2,ownerVisits:4,levelReachedAtVisit:0,blackoutVisitsLeft:s.id==='CE'?2:0})),olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},taxPool:600,gameTimeLeftMs:null,timeUp:false,pendingEventCardId:null,pendingDebt:null,winnerIds:[],turnTimeLeftMs:null});
let playerCount=4,socket,live;const commands=[],errors=[],checks=[];
const server=await createServer({root:fileURLToPath(root),configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('apps/web/public/',root)),server:{host:'127.0.0.1',port:4192,strictPort:true,watch:{ignored:['**/assets/3d/reviews/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({deviceScaleFactor:2,hasTouch:true});
 page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{window.__textPaint=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(...args){window.__textPaint.push({text:String(args[0]),font:this.font});return original.apply(this,args)}});
 await page.route('**/api/**',r=>r.fulfill({json:{google:false,email:null,photoUrl:null}}));
 await page.routeWebSocket('**/ws/games/hud-visual-fixture?*',ws=>{socket=ws;live=makeFixture(playerCount);ws.send(JSON.stringify({kind:'SNAPSHOT',snapshot:live}));ws.onMessage(m=>commands.push(JSON.parse(String(m))))});
 let orientation;
 for(const[width,height]of[[1280,720],[800,360],[667,280],[932,430]]){
  playerCount=width===932?6:4;await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4192/scripts/assets/hud-preview/',{waitUntil:'networkidle',timeout:120000});
  await page.waitForFunction(()=>window.__imperioArtScene&&window.__board34);await page.waitForTimeout(1000);
  await page.waitForFunction(()=>innerHeight>500||window.__board34().atlas.width===6144);
  const measurement=await page.evaluate(()=>{
   const {camera,scene}=window.__imperioArtScene(),board=window.__board34(),r=document.querySelector('canvas').getBoundingClientRect();scene.updateMatrixWorld(true);
   const project=v=>{v.project(camera);return{x:(v.x+1)*r.width/2+r.left,y:(1-v.y)*r.height/2+r.top}};
   const points=board.layout.layers.frame.polygon.map(p=>project(camera.position.clone().set(...p)));
   const rect=selector=>{const b=document.querySelector(selector).getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};
   const tags=[];scene.traverse(o=>{if(!o.name.startsWith('RENT_TAG_'))return;const p=o.geometry.getAttribute('position'),quad=Array.from({length:p.count},(_,i)=>project(camera.position.clone().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld)));tags.push({name:o.name,...o.userData,quad,order:o.renderOrder,depthTest:o.material.depthTest,transparent:o.material.transparent})});
   const glyphs=window.__textPaint;
   return{camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:camera.fov},compactHeaders:board.compactHeaders,atlas:board.atlas,board:{left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))},actions:rect('.hud-action-tray'),tags,glyphs};
  });
  orientation??=measurement.camera;assert.deepEqual(measurement.camera,orientation,'Only viewport fitting can change, not the camera pose');assert.equal(measurement.tags.length,26);
  assert.ok(measurement.tags.some(t=>t.label==='Apagão'));assert.ok(measurement.board.left>=-1&&measurement.board.right<=width+1&&measurement.board.top>=-1&&measurement.board.bottom<=height+1);
  const mobile=height<=500;assert.equal(measurement.compactHeaders,mobile);
  for(const state of states){const tile=await page.evaluate(id=>window.__board34().layout.tiles.find(t=>t.id===id),state.id),tag=measurement.tags.find(t=>t.name==='RENT_TAG_'+state.id);assert.equal(tag.depthTest,false);assert.equal(tag.order,20);assert.equal(tag.transparent,false);assert.ok(Math.abs(tag.plaque.height/tile.panel.rent.height-(mobile?1.6:1))<1e-6);assert.ok(tag.plaque.x>=0&&tag.plaque.x+tag.plaque.width<=tile.panel.width+.01);}
  const fullNames=measurement.glyphs.filter(g=>states.some(s=>normalize(s.name)===normalize(g.text)));
  if(mobile){assert.deepEqual(fullNames,[]);for(const state of states)assert.ok(measurement.glyphs.some(g=>g.text===state.id&&parseFloat(g.font.replace(/^\d+\s+/,''))>=27),'Larger UF '+state.id);assert.ok(measurement.actions.width<=116.5)}else assert.ok(fullNames.length>=26);
  delete measurement.glyphs;checks.push({width,height,...measurement});await page.screenshot({path:fileURLToPath(new URL(`board-${width}x${height}.png`,out)),timeout:60000});console.log(width,height,'passed');
  if(width===800){const target=await page.evaluate(()=>{const{camera}=window.__imperioArtScene(),t=window.__board34().layout.tiles.find(t=>t.id==='RN'),v=camera.position.clone().set(t.anchor.x,t.anchor.surfaceY,t.anchor.z).project(camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2,index:t.index}});await page.mouse.click(target.x,target.y);await page.getByRole('dialog',{name:/Rio Grande do Norte.*consulta/i}).waitFor();checks.at(-1).fullNameOnTap=true;await page.screenshot({path:fileURLToPath(new URL('property-full-name.png',out)),timeout:60000});await page.evaluate(()=>window.hudQA.view.getState().selectTile(null));await page.locator('.hud-cards-button').click();await page.getByRole('dialog',{name:'Cartas guardadas',exact:true}).waitFor();await page.keyboard.press('Escape');await page.getByRole('button',{name:'ROLAR DADOS',exact:true}).click();assert.ok(commands.some(c=>c.command?.type==='ROLL_DICE'));checks.at(-1).drawerAndOfficialRoll=true;}
 }
 await page.setViewportSize({width:390,height:844});await page.getByRole('alertdialog').waitFor();assert.equal(await page.locator('.game-viewport').getAttribute('inert'),'');
 assert.deepEqual(errors,[]);await writeFile(new URL('report.json',out),JSON.stringify({realGameScreen:true,mockedWebSocket:true,sameCameraAngle:true,portraitBlocked:true,checks,errors},null,2)+'\n');console.log('V1 same-camera and mobile lettering QA passed');
}finally{await browser?.close();await server.close()}
