import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const airport=process.argv.includes('--airport'),illustrated=process.argv.includes('--illustrated'),personalized=process.argv.includes('--personalized'),date=airport||personalized||illustrated?'2026-11-10':'2026-11-09',version=illustrated?'-v3':personalized?'-v2':'-v1',preview=(airport?'airport-choice-preview':'olympic-choice-preview')+(version==='-v1'?'':version);
const root=new URL('../../',import.meta.url),baseDir=airport?'assets/airport/destination-v1/':'assets/olympic-host/selection-v1/',dir=baseDir.replace('-v1/',version+'/'),source=baseDir+'emblem-source.png',file=baseDir+'emblem.webp';
const boardCaptures=JSON.parse(await readFile(new URL('assets/3d/reviews/v1-adverse/report.json',root))).checks.filter(c=>c.scenario==='hotels-high-values');
await mkdir(new URL(dir+'previews/',root),{recursive:true});
const server=await createServer({root:fileURLToPath(root),configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{host:'127.0.0.1',port:4194,strictPort:true}});
await server.listen();let browser;const checks=[],errors=[];
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({deviceScaleFactor:2});page.setDefaultTimeout(20000);
 if(illustrated){
  await page.goto('http://127.0.0.1:4194/'+dir+'frame-source.png');
  const skin=await page.evaluate(async path=>{const image=new Image();image.src='/'+path;await image.decode();const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(image.naturalHeight*1024/image.naturalWidth);const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,canvas.width,canvas.height);return{sourceWidth:image.naturalWidth,sourceHeight:image.naturalHeight,width:canvas.width,height:canvas.height,data:canvas.toDataURL('image/webp',.94).split(',')[1]};},dir+'frame-source.png');
  const skinBytes=Buffer.from(skin.data,'base64');await writeFile(new URL(dir+'frame.webp',root),skinBytes);const{data,...skinMetrics}=skin;
  await writeFile(new URL(dir+'frame-manifest.json',root),JSON.stringify({date,provider:'OpenAI image_gen built-in',source:dir+'frame-source.png',file:dir+'frame.webp',...skinMetrics,bytes:skinBytes.length,sha256:createHash('sha256').update(skinBytes).digest('hex'),sourceSha256:createHash('sha256').update(await readFile(new URL(dir+'frame-source.png',root))).digest('hex'),nineSlice:174,cornerDisplayPixels:{standard:18,small:15,artOnly:30},meshyCredits:0,integrated:false},null,2)+'\n');
 }
 await page.goto('http://127.0.0.1:4194/'+source);
 const encoded=await page.evaluate(async source=>{const image=new Image();image.src='/'+source;await image.decode();const canvas=document.createElement('canvas');canvas.width=640;canvas.height=Math.round(image.naturalHeight*640/image.naturalWidth);const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,solid=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]>=250)solid++;}return{sourceWidth:image.naturalWidth,sourceHeight:image.naturalHeight,width:canvas.width,height:canvas.height,transparent,solid,data:canvas.toDataURL('image/webp',.92).split(',')[1]};},source);
 assert.ok(encoded.transparent&&encoded.solid);const bytes=Buffer.from(encoded.data,'base64');await writeFile(new URL(file,root),bytes);const {data,...metrics}=encoded;
 await writeFile(new URL(dir+'manifest.json',root),JSON.stringify({date,provider:'OpenAI image_gen built-in',source,file,...metrics,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceSha256:createHash('sha256').update(await readFile(new URL(source,root))).digest('hex'),meshyCredits:0,integrated:false,encoder:'Chromium WebP 92; aspect ratio and alpha preserved'},null,2)+'\n');
 page.on('pageerror',e=>errors.push(e.message));
 for(const [width,height,query,name] of [[1000,640,'?art','modal-art'],[1280,720,'','board-desktop'],[800,360,'','board-mobile'],[667,280,'','board-small'],[800,360,'?selected','selected-mobile'],[667,280,'?selected','selected-small'],[667,280,'?event','event-small']]){
  if(airport&&query.includes('event'))continue;
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4194/scripts/assets/'+preview+'/'+query,{waitUntil:'networkidle'});await page.locator('.emblem').evaluate(image=>image.decode());
  const result=await page.evaluate(()=>{const dialog=document.querySelector('.dialog'),r=dialog.getBoundingClientRect(),elements=[...document.querySelectorAll('h1,p,.selection,button')];return{bounds:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},panels:[...document.querySelectorAll('.dialog,.confirm-panel')].map(e=>{const r=e.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom}}),overflow:elements.filter(e=>e.clientWidth>1&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),transparentBackdrop:getComputedStyle(document.querySelector('main')).backgroundColor,selected:!document.querySelector('.confirm').disabled,skip:!!document.querySelector('.skip')};});
  assert.ok(result.bounds.left>=0&&result.bounds.top>=0&&result.bounds.right<=width&&result.bounds.bottom<=height);assert.deepEqual(result.overflow,[]);assert.equal(result.selected,query.includes('selected'));assert.equal(result.skip,!query.includes('event'));
  if(!query.includes('art')){
   const capture=boardCaptures.find(c=>c.width===width&&c.height===height);
   result.stateClearance=await page.evaluate(async({capture,panels})=>{
    const {panelPoint}=await import('/apps/web/src/board/board34/panelProjection.ts'),layout=await fetch('/apps/web/src/board/board34/layout.json').then(r=>r.json()),rows=[],rhs=[],samples=[];
    for(const tag of capture.rents){const tile=layout.tiles.find(t=>t.id===tag.name.replace('RENT_TAG_','')),r=tag.plaque;
     [[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.height],[r.x,r.y+r.height]].forEach(([u,v],i)=>{const p=panelPoint(tile.panel,u/tile.panel.width,v/tile.panel.height),x=p[0]/1024,y=p[1]/1024,a=tag.points[i].x/1024,b=tag.points[i].y/1024;rows.push([x,y,1,0,0,0,-x*a,-y*a],[0,0,0,x,y,1,-x*b,-y*b]);rhs.push(a,b);samples.push({p,target:tag.points[i]});});
    }
    const matrix=Array.from({length:8},(_,i)=>[...Array.from({length:8},(_,j)=>rows.reduce((s,r)=>s+r[i]*r[j],0)),rows.reduce((s,r,k)=>s+r[i]*rhs[k],0)]);
    for(let i=0;i<8;i++){let pivot=i;for(let k=i+1;k<8;k++)if(Math.abs(matrix[k][i])>Math.abs(matrix[pivot][i]))pivot=k;[matrix[i],matrix[pivot]]=[matrix[pivot],matrix[i]];for(let k=0;k<8;k++){if(k===i)continue;const f=matrix[k][i]/matrix[i][i];for(let j=i;j<=8;j++)matrix[k][j]-=f*matrix[i][j];}}
    const h=matrix.map((r,i)=>r[8]/r[i]),project=([px,py])=>{const x=px/1024,y=py/1024,q=h[6]*x+h[7]*y+1;return[(h[0]*x+h[1]*y+h[2])/q*1024,(h[3]*x+h[4]*y+h[5])/q*1024]};
    const residual=Math.max(...samples.map(s=>{const p=project(s.p);return Math.hypot(p[0]-s.target.x,p[1]-s.target.y)}));
    const intersects=(polygon,rect)=>{const box=[[rect.left-3,rect.top-3],[rect.right+3,rect.top-3],[rect.right+3,rect.bottom+3],[rect.left-3,rect.bottom+3]],axes=[[1,0],[0,1],...polygon.map((p,i)=>{const q=polygon[(i+1)%polygon.length];return[-(q[1]-p[1]),q[0]-p[0]]})];return axes.every(([x,y])=>{const a=polygon.map(p=>p[0]*x+p[1]*y),b=box.map(p=>p[0]*x+p[1]*y);return Math.max(...a)>=Math.min(...b)&&Math.max(...b)>=Math.min(...a)});};
    const states=layout.tiles.filter(t=>capture.rents.some(r=>r.name==='RENT_TAG_'+t.id));return{testedStates:states.length,projectionResidual:residual,overlaps:states.filter(t=>panels.some(r=>intersects(t.pixels.map(project),r))).map(t=>t.id)};
   },{capture,panels:result.panels});
   assert.equal(result.stateClearance.testedStates,26);assert.ok(result.stateClearance.projectionResidual<1);assert.deepEqual(result.stateClearance.overlaps,[],`${name}: panels ${JSON.stringify(result.panels)} must not cover any state`);
   assert.ok(result.panels.every(r=>r.left>=0&&r.top>=0&&r.right<=width&&r.bottom<=height));
  }
  await page.screenshot({path:fileURLToPath(new URL(dir+'previews/'+name+'.png',root))});checks.push({width,height,query,name,...result});
 }
 assert.deepEqual(errors,[]);await writeFile(new URL(dir+'previews/report.json',root),JSON.stringify({date,scope:'Art prototype on static V1 captures, not integrated gameplay',checks,errors},null,2)+'\n');console.log(JSON.stringify({file,...metrics,bytes:bytes.length,captures:checks.length,errors}));
}finally{await browser?.close();await server.close();}
