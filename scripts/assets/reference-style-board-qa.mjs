import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),out=new URL('assets/board-mobile/reference-style-3d/review/',root);
await mkdir(out,{recursive:true});
const expected=JSON.parse(await readFile(new URL('packages/game-data/data/board.json',root))).tiles.map(t=>t.id);
const phoneOnly=process.argv.includes('--phone');
const server=await createServer({root:fileURLToPath(root),configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('apps/web/public/',root)),server:{host:'127.0.0.1',port:4191,strictPort:true,watch:{ignored:['**/assets/board-mobile/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei']}});
await server.listen();let browser;
try {
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:phoneOnly?{width:667,height:280}:{width:1672,height:941},deviceScaleFactor:2}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:4191/scripts/assets/reference-style-board-preview/',{waitUntil:'networkidle',timeout:120000});
  await page.waitForFunction(()=>window.__referenceStyleReview?.projection,{timeout:120000});
  await page.waitForTimeout(1500);
  for(const[width,height]of(phoneOnly?[[667,280]]:[[1672,941],[1360,768],[932,430],[800,360],[667,280]])) {
    await page.setViewportSize({width,height});
    await page.waitForFunction(({width,height})=>window.__referenceStyleReview?.projection.viewport.width===width&&window.__referenceStyleReview?.projection.viewport.height===height,{width,height},{timeout:60000});
    await page.waitForFunction(({width,height})=>window.__referenceStyleRender?.width===width&&window.__referenceStyleRender?.height===height&&window.__referenceStyleRender?.drawCalls>34,{width,height},{timeout:60000});
    await page.waitForFunction(()=>document.querySelectorAll('.reference-style-labels>span').length===61&&[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    await page.waitForTimeout(500);
    const coverage=await page.evaluate(()=>{const source=document.querySelector('canvas'),copy=document.createElement('canvas');copy.width=160;copy.height=90;const ctx=copy.getContext('2d');ctx.drawImage(source,0,0,160,90);const rgba=ctx.getImageData(0,0,160,90).data;let occupied=0;for(let i=3;i<rgba.length;i+=4)if(rgba[i]>50)occupied++;return occupied/(160*90)});
    assert.ok(coverage>.3,'WebGL scene must be visibly rendered');
    const review=await page.evaluate(()=>window.__referenceStyleReview),b=review.projection.board;
    assert.deepEqual(review.ids,expected);assert.deepEqual(review.models,[]);
    assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1,JSON.stringify(b));
    assert.equal(review.projection.cells.length,34);assert.equal(review.projection.labels.length,61);
    const clipped=await page.locator('.reference-style-labels>span').evaluateAll(nodes=>nodes.filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>({id:n.dataset.tileLabel,text:n.textContent,width:n.clientWidth,scroll:n.scrollWidth})));
    assert.deepEqual(clipped,[]);
    const collisions=await page.evaluate(()=>{
      const labels=window.__referenceStyleReview.projection.labels;
      const boxes=[...document.querySelectorAll('.reference-style-labels>span')].map((node,i)=>{
        if(!node.hasAttribute('data-side-state'))return null;
        const text=node.querySelector('.reference-style-label-text'),label=labels[i],a=label.angle*Math.PI/180,w=text.offsetWidth/2,h=text.offsetHeight/2;
        return{id:label.id,text:label.text,points:[[-w,-h],[w,-h],[w,h],[-w,h]].map(([x,y])=>[label.x+x*Math.cos(a)-y*Math.sin(a),label.y+x*Math.sin(a)+y*Math.cos(a)])};
      }).filter(Boolean);
      const overlap=(a,b)=>{for(const polygon of[a,b])for(let i=0;i<4;i++){const p=polygon[i],q=polygon[(i+1)%4],nx=q[1]-p[1],ny=p[0]-q[0],length=Math.hypot(nx,ny);const project=poly=>poly.map(v=>(v[0]*nx+v[1]*ny)/length),x=project(a),y=project(b);if(Math.max(...x)<=Math.min(...y)+.4||Math.max(...y)<=Math.min(...x)+.4)return false}return true};
      const result=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(overlap(boxes[i].points,boxes[j].points))result.push([boxes[i].id,boxes[i].text,boxes[j].id,boxes[j].text]);return result;
    });
    assert.deepEqual(collisions,[],'Side property names and prices must not cover each other');
    const rollFits=await page.locator('.reference-style-roll .approved-roll>span').evaluate(el=>el.scrollWidth<=el.clientWidth+1&&el.getBoundingClientRect().height>0);
    assert.ok(rollFits,'Roll label must remain on one line inside its button');
    const hero=await page.evaluate(()=>{const logo=document.querySelector('.reference-style-logo').getBoundingClientRect(),roll=document.querySelector('.reference-style-roll').getBoundingClientRect(),dice=window.__referenceStyleReview.projection.diceBounds;return{logoBottom:logo.bottom,rollTop:roll.top,dice}});
    assert.ok(hero.dice&&hero.logoBottom<=hero.dice.y+1&&hero.dice.y+hero.dice.height<=hero.rollTop+1,JSON.stringify(hero));
    const prices=review.projection.labels.filter(l=>l.text.startsWith('R$')&&l.id!=='TAX');assert.ok(prices.every(l=>l.fontSize>=8),JSON.stringify(prices.filter(l=>l.fontSize<8)));
    checks.push({width,height,board:b,outline:review.projection.outline,logo:review.projection.logo,roll:review.projection.roll,hero,minRentPixels:Math.min(...prices.map(c=>c.fontSize)),maxRentPixels:Math.max(...prices.map(c=>c.fontSize)),webglCoverage:coverage,renderedLabels:review.projection.labels,cells:review.projection.cells});
    await page.screenshot({path:fileURLToPath(new URL(`board-${width}x${height}.png`,out)),timeout:60000});console.log(width,height,'captured');
  }
  const c=await page.evaluate(()=>window.__referenceStyleReview.projection.cells.find(c=>c.id==='RN'));
  await page.mouse.click(c.x,c.y);await page.waitForFunction(()=>window.__referenceEvents?.some(e=>e.kind==='select'&&e.id==='RN'));
  await page.getByRole('button',{name:'Rolar dados',exact:true}).click();await page.getByRole('button',{name:'Configurações',exact:true}).click();
  await page.getByRole('button',{name:'Som',exact:true}).click();
  await page.waitForFunction(()=>window.__referenceEvents?.some(e=>e.kind==='control'&&e.id==='sound'));
  await page.getByRole('button',{name:'PR; aluguel',exact:false}).focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.__referenceEvents?.some(e=>e.kind==='select'&&e.id==='PR'));
  assert.deepEqual(errors,[]);
  await writeFile(new URL(phoneOnly?'phone-report.json':'report.json',out),JSON.stringify({scope:'Native polygon 3D art review; not a connected game',officialIds:expected,checks,errors,interaction:true,newMeshyCredits:0},null,2));console.log('3D review passed');
} finally {await browser?.close();await server.close()}
