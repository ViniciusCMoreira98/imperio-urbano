import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from '@playwright/test';
import {Matrix4,Vector3} from 'three';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../',import.meta.url));
const output=new URL('../../assets/3d/reviews/fixed-camera/',import.meta.url);await mkdir(output,{recursive:true});
const calibration=JSON.parse(await readFile(new URL('../../apps/web/src/board/camera/fixedCamera.json',import.meta.url),'utf8'));
const referenceBytes=await readFile(new URL(`../../${calibration.reference.file}`,import.meta.url));
assert.equal(createHash('sha256').update(referenceBytes).digest('hex'),calibration.reference.sha256);
const {states}=JSON.parse(await readFile(new URL('../../packages/game-data/data/states.json',import.meta.url),'utf8'));
const snapshot={gameId:'hud-visual-fixture',inviteCode:'VISUAL',mode:'CLASSIC',status:'IN_PROGRESS',version:1,round:3,currentPlayerId:'visual-1',phase:'AWAITING_ROLL',lastDice:[4,3],players:[['Vinícius','ROXO',1250,1],['Jogador 2','AZUL',980,9],['Jogador 3','VERDE',1450,18],['Jogador 4','VERMELHO',860,27]].map(([nickname,pawnColor,credits,position],i)=>({id:`visual-${i+1}`,nickname,avatarId:`avatar-${i+1}`,pawnColor,credits,position,seat:i,ready:true,connected:true,bankrupt:false,skipTurns:0,travelPending:false})),properties:states.map(s=>({stateId:s.id,ownerId:null,buildingLevel:0,ownerVisits:0,levelReachedAtVisit:0})),olympics:{edition:0,hostStateId:null,hostPlayerId:null,multiplier:1},pendingDebt:null,winnerIds:[],turnTimeLeftMs:null};
const server=await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4182,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});await server.listen();let browser;
const frame=page=>page.evaluate(()=>window.__imperioStaticCamera());
const tick=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
function project(world,camera){const p=new Vector3().fromArray(world).applyMatrix4(new Matrix4().fromArray(camera.world).invert()).applyMatrix4(new Matrix4().fromArray(camera.projection));return [(p.x+1)*1536/2,(1-p.y)*1024/2];}
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1536,height:1024},deviceScaleFactor:1,hasTouch:true});
 const page=await context.newPage();const errors=[],apiCalls=[];let socket;
 await page.routeWebSocket('**/ws/games/hud-visual-fixture?*',ws=>{socket=ws;ws.send(JSON.stringify({kind:'SNAPSHOT',snapshot}));});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/'))apiCalls.push(r.url());});
 await page.goto('http://127.0.0.1:4182/scripts/assets/hud-preview/',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>!!window.__imperioStaticCamera&&window.hudQA.game.getState().snapshot);
 await tick(page);const initial=await frame(page);
 const projected=calibration.landmarks.worldPoints.map(point=>project(point,initial));
 const errorsPixels=projected.map(([x,y],i)=>Math.hypot(x-calibration.landmarks.referencePixels[i][0],y-calibration.landmarks.referencePixels[i][1]));
 assert.ok(Math.max(...errorsPixels)<3);
 await page.screenshot({path:fileURLToPath(new URL('game-1536.png',output)),fullPage:true});
 await page.mouse.move(760,440);await page.mouse.wheel(0,-900);await tick(page);assert.deepEqual(await frame(page),initial);
 await page.mouse.move(740,430);await page.mouse.down();await page.mouse.move(940,530,{steps:12});await page.mouse.up();await tick(page);assert.deepEqual(await frame(page),initial);
 await page.keyboard.press('q');await page.keyboard.press('e');await tick(page);assert.deepEqual(await frame(page),initial);
 const click=project([4.8,.08,4.8],initial);await page.mouse.dblclick(click[0],click[1]);
 await page.waitForFunction(()=>window.hudQA.view.getState().selectedTile===0);await tick(page);assert.deepEqual(await frame(page),initial);
 await page.evaluate(()=>window.hudQA.view.getState().clearSelection());
 socket.send(JSON.stringify({kind:'SNAPSHOT',snapshot:{...snapshot,version:2,currentPlayerId:'visual-2'}}));await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===2);await tick(page);assert.deepEqual(await frame(page),initial);
 socket.send(JSON.stringify({kind:'SNAPSHOT',snapshot:{...snapshot,version:3,players:[],currentPlayerId:null,lastDice:null}}));await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===3);await tick(page);
 const hide=await page.addStyleTag({content:'.game-viewport > :not(.board-stage){visibility:hidden!important}'});
 const stateArt=await page.evaluate(async()=>{const {inspectStateArtwork}=await import('/scripts/assets/inspect-state-art.ts');return inspectStateArtwork();});
 assert.equal(stateArt.length,27);
 const clipped=stateArt.filter(state=>!state.ratioPreserved||state.corners.some(c=>!c.insideTexture||!c.insideFrame||!c.visible));
 await writeFile(new URL('state-art-visibility.json',output),JSON.stringify({states:stateArt,clipped},null,2)+'\n');
 assert.deepEqual(clipped,[],'Há artes cortadas ou encobertas na cena real.');
 const rendered=await page.locator('.board-composition').screenshot({path:fileURLToPath(new URL('render-1536.png',output))});
 await hide.evaluate(el=>el.remove());
 const comparison=await page.evaluate(async({rendered,reference,expected,actual})=>{
  const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
  const [a,b]=await Promise.all([load(reference),load(rendered)]);
  if(a.naturalWidth!==1536||a.naturalHeight!==1024||b.naturalWidth!==1536||b.naturalHeight!==1024)throw new Error('Comparação exige imagens nativas 1536×1024.');
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(a,0,0);const original=ctx.getImageData(0,0,1536,1024);ctx.drawImage(b,0,0);const current=ctx.getImageData(0,0,1536,1024);
  ctx.drawImage(a,0,0);ctx.globalAlpha=.5;ctx.drawImage(b,0,0);ctx.globalAlpha=1;const overlay=canvas.toDataURL('image/png');
  ctx.font='700 18px system-ui';ctx.lineWidth=2;
  for(const [points,color] of [[expected,'#ff384f'],[actual,'#00edff']]){ctx.strokeStyle=color;for(const [x,y]of points){ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.moveTo(x,y-10);ctx.lineTo(x,y+10);ctx.stroke();}}
  ctx.fillStyle='#101522';ctx.fillRect(420,970,700,38);ctx.fillStyle='#fff';ctx.fillText('Vermelho: referência · Ciano: projeção real da câmera',435,996);const landmarks=canvas.toDataURL('image/png');
  const inside=(x,y,polygon)=>{let odd=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)odd=!odd;}return odd;};
  const center=[[391,177],[1159,177],[1242,738],[294,738]];
  const regions={all:{count:0,sum:0,squared:0},center:{count:0,sum:0,squared:0},tilesAndFrame:{count:0,sum:0,squared:0},tableAndDecor:{count:0,sum:0,squared:0}};
  const diff=ctx.createImageData(1536,1024);
  for(let y=0;y<1024;y++)for(let x=0;x<1536;x++){
   const i=(y*1536+x)*4;let total=0,squared=0;
   for(let c=0;c<3;c++){const d=Math.abs(original.data[i+c]-current.data[i+c]);total+=d;squared+=d*d;diff.data[i+c]=Math.min(255,d*2);}diff.data[i+3]=255;
   const region=inside(x,y,center)?'center':inside(x,y,expected)?'tilesAndFrame':'tableAndDecor';
   for(const key of ['all',region]){regions[key].count+=3;regions[key].sum+=total;regions[key].squared+=squared;}
  }
  ctx.putImageData(diff,0,0);const difference=canvas.toDataURL('image/png');
  const side=document.createElement('canvas');side.width=3072;side.height=1024;const s=side.getContext('2d');s.drawImage(a,0,0);s.drawImage(b,1536,0);
  return {overlay,landmarks,difference,sideBySide:side.toDataURL('image/png'),metrics:Object.fromEntries(Object.entries(regions).map(([id,m])=>[id,{maeRgb255:m.sum/m.count,rmseRgb255:Math.sqrt(m.squared/m.count)}]))};
 },{rendered:'data:image/png;base64,'+rendered.toString('base64'),reference:'http://127.0.0.1:4182/'+calibration.reference.file,expected:calibration.landmarks.referencePixels,actual:projected});
 for(const [key,name]of [['overlay','overlay.png'],['landmarks','landmarks.png'],['difference','difference-x2.png'],['sideBySide','side-by-side.png']])await writeFile(new URL(name,output),Buffer.from(comparison[key].split(',')[1],'base64'));
 // Ensaio de material: mantém os donos para a faixa de aluguel, mas oculta peões no snapshot.
 // Um peão em casa vizinha pode encobrir a arte em perspectiva; isso não é recorte de textura.
 socket.send(JSON.stringify({kind:'SNAPSHOT',snapshot:{...snapshot,version:4,players:snapshot.players.map(player=>({...player,bankrupt:true})),properties:snapshot.properties.map((property,i)=>({...property,ownerId:snapshot.players[i%4].id}))}}));
 await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===4);await tick(page);
 const ownedStateArt=await page.evaluate(async()=>{const {inspectStateArtwork}=await import('/scripts/assets/inspect-state-art.ts');return inspectStateArtwork();});
 assert.equal(ownedStateArt.length,27);
 const ownedClipped=ownedStateArt.filter(state=>!state.ratioPreserved||state.corners.some(c=>!c.insideTexture||!c.insideFrame||!c.visible));
 await writeFile(new URL('state-art-visibility-owned.json',output),JSON.stringify({actorsHiddenInTestSnapshot:true,states:ownedStateArt,clipped:ownedClipped},null,2)+'\n');
 assert.deepEqual(ownedClipped,[],'Há artes cortadas em propriedades compradas.');
 socket.send(JSON.stringify({kind:'SNAPSHOT',snapshot:{...snapshot,version:5}}));await page.waitForFunction(()=>window.hudQA.game.getState().snapshot.version===5);
 await page.setViewportSize({width:390,height:844});await tick(page);await page.waitForFunction(()=>Math.abs(document.querySelector('.board-composition').getBoundingClientRect().width-390)<1);await tick(page);
 assert.deepEqual(await frame(page),initial);
 const bounds=await page.locator('.board-composition').boundingBox();assert.ok(Math.abs(bounds.width/bounds.height-1.5)<.001);
 const cdp=await context.newCDPSession(page);const cy=bounds.y+bounds.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:140,y:cy,id:1},{x:250,y:cy,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:90,y:cy,id:1},{x:300,y:cy,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await tick(page);assert.deepEqual(await frame(page),initial);
 await page.screenshot({path:fileURLToPath(new URL('game-390.png',output)),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);assert.deepEqual(apiCalls,[]);
 const report={reference:calibration.reference,actualBrowserScreenshot:'render-1536.png',source:'GameScreen real com WebSocket interceptado e snapshot de teste; não usa backend real.',staticCapture:'HUD oculto e peças removidas apenas do snapshot de teste para a comparação estática; game-1536.png registra a tela completa.',postCaptureWarp:false,projectedPixels:projected,errorsPixels,maxErrorPixels:Math.max(...errorsPixels),metrics:comparison.metrics,cameraInvariant:{wheel:true,drag:true,keyboardQE:true,doubleClickSelection:true,turnChange:true,resize:true,touchPinch:true},mobile:{viewport:[390,844],composition:bounds,aspectPreserved:true},legacyCameraUi:'Controles/foco já retirados pela engenharia no commit 7f002d5; seleção abre o painel sem mover a câmera.',fidelityAccepted:false,remainingDifferences:['Contorno arredondado e espessura da moldura ainda não reconstruídos no Blender.','Percurso/ordem e composição das casas ainda refletem o catálogo atual.','Texturas centrais e recortes ainda são a implementação anterior; integrar as artes separadas mantendo enquadramento.','Vegetação, caneca, moedas e acabamento da mesa ainda divergem.','Iluminação, sombras e escala de personagens/construções exigem próximas etapas.'],errors,apiCalls,paidCredits:0};
 await writeFile(new URL('comparison.json',output),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({maxErrorPixels:report.maxErrorPixels,metrics:report.metrics,cameraInvariant:report.cameraInvariant,fidelityAccepted:false}));
 await context.close();
}finally{await browser?.close();await server.close();}
