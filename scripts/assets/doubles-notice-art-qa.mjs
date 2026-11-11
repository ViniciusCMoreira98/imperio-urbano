import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),dir='assets/notices/doubles-v1/';
const boardCaptures=JSON.parse(await readFile(new URL('assets/3d/reviews/v1-adverse/report.json',root))).checks.filter(c=>c.scenario==='hotels-high-values');
await mkdir(new URL(dir+'previews/',root),{recursive:true});
const server=await createServer({root:fileURLToPath(root),configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{host:'127.0.0.1',port:4195,strictPort:true}});
await server.listen();let browser;const checks=[],errors=[];
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({deviceScaleFactor:2});page.setDefaultTimeout(20000);
 await page.goto('http://127.0.0.1:4195/'+dir+'frame-source.png');
 const skin=await page.evaluate(async path=>{const img=new Image();img.src='/'+path;await img.decode();const c=document.createElement('canvas');c.width=1024;c.height=Math.round(img.naturalHeight*1024/img.naturalWidth);const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,c.width,c.height);return{sourceWidth:img.naturalWidth,sourceHeight:img.naturalHeight,width:c.width,height:c.height,data:c.toDataURL('image/webp',.94).split(',')[1]};},dir+'frame-source.png');
 const bytes=Buffer.from(skin.data,'base64');await writeFile(new URL(dir+'frame.webp',root),bytes);const {data,...metrics}=skin;
 await writeFile(new URL(dir+'manifest.json',root),JSON.stringify({date:'2026-11-11',provider:'OpenAI image_gen built-in',source:dir+'frame-source.png',file:dir+'frame.webp',...metrics,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceSha256:createHash('sha256').update(await readFile(new URL(dir+'frame-source.png',root))).digest('hex'),nineSlice:220,cornerPixels:{desktop:20,mobile:17,small:14,artOnly:35},meshyCredits:0,integrated:false},null,2)+'\n');
 page.on('pageerror',e=>errors.push(e.message));
 const cases=[[1000,640,'?art&face=3','notice-art'],[1280,720,'?face=3','board-desktop'],[800,360,'?face=3','board-mobile'],[667,280,'?face=3','board-small'],[667,280,'?rest&face=2','left-rest-small'],[800,360,'?third&face=5','third-mobile'],[667,280,'?third&face=5','third-small'],[800,360,'?other&face=6','other-mobile'],[667,280,'?other&face=6','other-small']];
 for(const [width,height,query,name] of cases){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4195/scripts/assets/doubles-notice-preview/'+query,{waitUntil:'networkidle'});
  const face=Number(new URLSearchParams(query).get('face'));
  const result=await page.evaluate(()=>{const el=document.querySelector('.notice'),r=el.getBoundingClientRect(),rect={left:r.left,top:r.top,right:r.right,bottom:r.bottom};return{panels:[rect],overflow:[...el.querySelectorAll('h1,p,button')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),pips:[...el.querySelectorAll('.die')].map(d=>d.querySelectorAll('.pip').length),message:el.querySelector('.message').textContent,ariaLabel:el.getAttribute('aria-label')};});
  assert.deepEqual(result.overflow,[]);assert.deepEqual(result.pips,[face,face]);assert.ok(result.ariaLabel.includes(`${face} e ${face}`));
  if(query.includes('third'))assert.equal(result.message,'Três duplas seguidas: você vai direto para o Descanso.');else if(query.includes('rest'))assert.equal(result.message,'Você saiu do Descanso.');else assert.equal(result.message,query.includes('other')?'Marina Imperial joga de novo.':'Você joga de novo.');
  assert.ok(result.panels.every(r=>r.left>=0&&r.top>=0&&r.right<=width&&r.bottom<=height));
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
   assert.equal(result.stateClearance.testedStates,26);assert.ok(result.stateClearance.projectionResidual<1);assert.deepEqual(result.stateClearance.overlaps,[],`${name}: notice must not cover any state`);
  }
  await page.screenshot({path:fileURLToPath(new URL(dir+'previews/'+name+'.png',root))});checks.push({name,width,height,face,...result});
 }
 const faces=[];
 for(let face=1;face<=6;face++){await page.goto(`http://127.0.0.1:4195/scripts/assets/doubles-notice-preview/?face=${face}`,{waitUntil:'networkidle'});const counts=await page.locator('.die').evaluateAll(dice=>dice.map(d=>d.querySelectorAll('.pip').length));assert.deepEqual(counts,[face,face]);faces.push({face,counts});}
 await page.getByRole('button',{name:'Fechar aviso'}).click();assert.equal(await page.locator('.notice').isVisible(),false);
 assert.deepEqual(errors,[]);await writeFile(new URL(dir+'previews/report.json',root),JSON.stringify({date:'2026-11-11',scope:'Art prototype on static V1 captures; not integrated gameplay',checks,faces,close:true,errors},null,2)+'\n');console.log(JSON.stringify({frameBytes:bytes.length,captures:checks.length,faces:faces.length,close:true,errors}));
}finally{await browser?.close();await server.close();}
