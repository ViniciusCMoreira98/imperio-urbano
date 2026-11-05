import{chromium}from'@playwright/test';import{readFile,writeFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import assert from'node:assert/strict';
const auth=JSON.parse(await readFile(new URL('../../assets/3d/staging/c8/session.json',import.meta.url),'utf8')),browser=await chromium.launch({headless:true});
try{
 const reports=[];
 for(const[width,height,dpr]of[[3840,2160,1],[2560,1440,2],[1536,1024,2]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr});await context.addInitScript(auth=>{sessionStorage.setItem('imperio.session',JSON.stringify(auth.session));sessionStorage.setItem('imperio.gameId',auth.gameId);},auth);const page=await context.newPage();await page.goto('http://localhost:5183',{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__board34?.().viewport,null,{timeout:60000});
  await page.waitForFunction(()=>{const d=window.__board34();return d.atlas.width===(d.viewport.large?6144:3072);},null,{timeout:60000});
  await page.waitForFunction(()=>{const c=document.querySelector('canvas');return c.width*c.height<8_500_000;});
  const result=await page.evaluate(()=>{const d=window.__board34(),c=document.querySelector('canvas');return{viewport:d.viewport,atlas:d.atlas,pixels:c.width*c.height};});console.log(JSON.stringify(result));if(width>=2560)assert.equal(result.atlas.width,6144);assert.ok(result.pixels<8_500_000);reports.push({width,height,deviceDpr:dpr,...result});await page.screenshot({path:fileURLToPath(new URL(`../../assets/3d/reviews/c8/profile-${width}x${height}-dpr${dpr}.png`,import.meta.url)),fullPage:true,timeout:90000});await context.close();
 }
 await writeFile(new URL('../../assets/3d/reviews/c8/profile-report.json',import.meta.url),JSON.stringify(reports,null,2)+'\n');
}finally{await browser.close();}
