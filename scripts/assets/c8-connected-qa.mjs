import{chromium}from'@playwright/test';
import{mkdir,writeFile,readFile}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import assert from'node:assert/strict';
const base=process.env.C8_BASE_URL??'http://localhost:5183',out=new URL('../../assets/3d/reviews/c8/',import.meta.url),staging=new URL('../../assets/3d/staging/c8/',import.meta.url);
await mkdir(out,{recursive:true});await mkdir(staging,{recursive:true});
const api=async(method,path,session,body)=>{const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session.token}:{})},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error(`${method} ${path}: ${r.status}`);return r.json();};
const sessions=[];let browser;const sockets=[];let snapshot;let timer;let bought=false,lastCommandVersion=-1;
try{
 for(const nickname of['Vinícius C8','Marina C8','Lucas C8','Sofia C8'])sessions.push(await api('POST','/sessions',null,{nickname}));
 const lobby=await api('POST','/games',sessions[0],{mode:'CLASSIC'});
 await api('PUT',`/games/${lobby.gameId}/me`,sessions[0],{avatarId:'avatar-1',pawnColor:'ROXO'});
 for(let i=1;i<4;i++){const joined=await api('POST','/games/join',sessions[i],{inviteCode:lobby.inviteCode});const member=joined.players.find(m=>m.playerId===sessions[i].playerId);await api('PUT',`/games/${lobby.gameId}/me`,sessions[i],{avatarId:`avatar-${i+1}`,pawnColor:member.pawnColor});}
 for(const s of sessions)await api('PUT',`/games/${lobby.gameId}/me/ready`,s,{ready:true});
 await api('POST',`/games/${lobby.gameId}/start`,sessions[0]);
 await writeFile(new URL('session.json',staging),JSON.stringify({session:sessions[0],gameId:lobby.gameId}));
 for(const session of sessions){
  const socket=new WebSocket(base.replace('http','ws')+`/ws/games/${lobby.gameId}?token=${encodeURIComponent(session.token)}`);sockets.push({socket,session});socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.kind==='SNAPSHOT')snapshot=m.snapshot;});
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',()=>reject(Error('WebSocket de teste indisponível')),{once:true});});
 }
 const send=command=>{if(!snapshot||snapshot.version===lastCommandVersion)return;const target=sockets.find(s=>s.session.playerId===snapshot.currentPlayerId);if(!target||target.socket.readyState!==1)return;lastCommandVersion=snapshot.version;target.socket.send(JSON.stringify({commandId:crypto.randomUUID(),expectedVersion:snapshot.version,command}));};
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1536,height:1024},deviceScaleFactor:1});
 await context.addInitScript(({session,gameId})=>{sessionStorage.setItem('imperio.session',JSON.stringify(session));sessionStorage.setItem('imperio.gameId',gameId);},{session:sessions[0],gameId:lobby.gameId});
 const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push({path:new URL(r.url()).pathname,status:r.status()});});
 await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__board34&&!!window.__imperioGame?.getState().snapshot,{timeout:60000});
 await page.waitForFunction(()=>document.querySelectorAll('.hud-player-row').length===4);assert.equal(await page.locator('[data-board34-rent]').count(),0);
 await page.screenshot({path:fileURLToPath(new URL('connected-unowned.png',out)),fullPage:true});console.log('Partida conectada: quatro jogadores, nenhuma faixa em estados sem dono.');
 timer=setInterval(()=>{
  if(!snapshot)return;bought=snapshot.properties.some(p=>p.ownerId);
  if(snapshot.phase==='AWAITING_PURCHASE')send(bought?{type:'DECLINE_PURCHASE'}:{type:'BUY_PROPERTY',houses:0});
  else if(snapshot.phase==='AWAITING_BUILD')send({type:'SKIP_BUILD'});
  else if(snapshot.phase==='AWAITING_OLYMPICS_HOST')send({type:'SKIP_OLYMPICS'});
  else if(snapshot.phase==='AWAITING_END_TURN')send({type:'END_TURN'});
  else if(snapshot.phase==='AWAITING_DEBT_RESOLUTION')send({type:'DECLARE_BANKRUPTCY'});
  else if(!bought&&(snapshot.phase==='AWAITING_ROLL'||snapshot.phase==='AWAITING_TRAVEL_DESTINATION'))send({type:'ROLL_DICE'});
 },400);
 await page.waitForFunction(()=>window.__imperioGame.getState().snapshot.properties.some(p=>p.ownerId),null,{timeout:90000});
 await page.waitForFunction(()=>!!window.__imperioArtScene().scene.getObjectByName('PROPERTY_BUILDING_LEVEL_0'));
 console.log('Compra real concluída: terreno e aluguel recebidos do servidor.');
 const pose=await page.evaluate(()=>window.__imperioStaticCamera().world),sizes=[];
 for(const[width,height]of[[1280,720],[1536,1024],[1280,800],[2560,1080],[2560,1440],[3840,2160],[2000,740],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForFunction(()=>window.__imperioGame.getState().snapshot?.phase==='AWAITING_ROLL');
  await page.waitForFunction(({width,height})=>{const d=window.__board34?.(),s=window.__imperioGame.getState(),c=document.querySelector('canvas');return s.connection==='open'&&s.snapshot?.phase==='AWAITING_ROLL'&&d?.viewport?.width===width&&d.viewport.height===height&&d.atlas.width===(d.viewport.large?6144:3072)&&c.width*c.height<8_500_000;},{width,height},{timeout:60000});
  await page.waitForLoadState('networkidle');
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const data=await page.evaluate(()=>{
   const state=window.__imperioGame.getState(),canvas=document.querySelector('.game-hud-board canvas'),rect=canvas.getBoundingClientRect(),board=window.__board34(),{scene,camera}=window.__imperioArtScene(),points=[];
   for(const tile of board.layout.tiles){const root=scene.getObjectByName(tile.modelNode);root.traverse(mesh=>{if(!mesh.isMesh)return;const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const v=camera.position.clone().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).project(camera);points.push([(v.x+1)*rect.width/2,(1-v.y)*rect.height/2]);}});}
   const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
   return{canvas:{width:rect.width,height:rect.height,pixels:canvas.width*canvas.height},atlas:board.atlas,tiles:board.printedFaces,rents:board.rentalStates,owned:state.snapshot.properties.filter(p=>p.ownerId).map(p=>p.stateId),world:camera.matrixWorld.toArray(),boardBounds:{left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))},players:box('.game-hud-players'),actions:box('.hud-action-tray'),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,connection:state.connection};
  });
  assert.equal(data.connection,'open');assert.equal(data.tiles,34);assert.deepEqual(data.world,pose);assert.equal(data.canvas.width,width);assert.equal(data.canvas.height,height);assert.equal(data.horizontalOverflow,false);assert.deepEqual([...data.rents].sort(),[...data.owned].sort());assert.ok(data.owned.length>0&&data.owned.length<26);assert.ok(data.boardBounds.left>=0&&data.boardBounds.right<=width&&data.boardBounds.top>=0&&data.boardBounds.bottom<=height);assert.ok(data.canvas.pixels<8_500_000);
  if(width===3840)assert.equal(data.atlas.width,6144);
  await page.screenshot({path:fileURLToPath(new URL(`connected-${width}x${height}.png`,out)),fullPage:true,timeout:90000});sizes.push({width,height,...data});console.log(JSON.stringify({width,height,atlas:data.atlas.width,boardHeight:Math.round(data.boardBounds.bottom-data.boardBounds.top),owned:data.owned.length}));
 }
 await page.getByRole('button',{name:/Histórico/}).click();await page.getByRole('button',{name:'Fechar histórico'}).waitFor();await page.getByRole('button',{name:'Fechar histórico'}).click();
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await writeFile(new URL('connected-report.json',out),JSON.stringify({gameId:lobby.gameId,connectedToRealApi:true,purchaseViaRealCommand:true,unownedPlaquesAbsent:true,posesPreserved:true,sizes,errors,failed},null,2)+'\n');
}finally{clearInterval(timer);for(const{socket}of sockets)socket.close();await browser?.close();}
