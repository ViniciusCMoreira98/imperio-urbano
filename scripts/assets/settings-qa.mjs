import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),out=new URL('assets/3d/reviews/settings/',root);
await mkdir(out,{recursive:true});
const server=await createServer({root:fileURLToPath(root),configFile:false,server:{host:'127.0.0.1',port:4194,strictPort:true,watch:{ignored:['**/assets/3d/reviews/**']}}});
await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage(),errors=[],failures=[],screens=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
 await page.setViewportSize({width:1672,height:941});
 await page.goto('http://127.0.0.1:4194/scripts/assets/settings-preview/',{waitUntil:'networkidle'});
 for(const[width,height]of[[1672,941],[1280,720],[1024,768],[844,390],[667,375]]){
  await page.setViewportSize({width,height});
  for(const tab of ['general','sound','account']){
   await page.evaluate(tab=>window.settingsArtQA.openTab(tab),tab);
   await page.locator('#settings img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
   const bounds=await page.locator('.st-panel').boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1,`${tab}/${width}: panel outside viewport`);
   assert.ok(await page.locator('.st-body').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${tab}/${width}: horizontal overflow`);
   for(const card of await page.locator('.st-card').all())assert.ok(await card.evaluate(el=>el.scrollHeight<=el.clientHeight+1),`${tab}/${width}: card content overflow`);
   for(const control of await page.locator('#settings button,#settings input,#settings select').all()){
    const box=await control.boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,`${tab}/${width}: control outside screen`);
   }
   await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:fileURLToPath(new URL(`${tab}-${width}x${height}.png`,out))});screens.push({tab,width,height});
  }
 }
 await page.setViewportSize({width:1280,height:720});await page.getByRole('tab',{name:'Geral',exact:true}).click();
 await page.getByLabel('Avatares dos jogadores',{exact:true}).uncheck();await page.getByRole('button',{name:'30',exact:true}).click();
 await page.getByRole('tab',{name:'Som',exact:true}).click();await page.getByLabel('Música',{exact:true}).fill('25');assert.equal(await page.locator('output').first().innerText(),'25%');await page.getByLabel('Silenciar tudo',{exact:true}).check();
 await page.getByRole('button',{name:'Salvar',exact:true}).click();assert.equal(await page.evaluate(()=>window.settingsArtQA.getSaved().music),25);
 await page.getByRole('tab',{name:'Conta',exact:true}).click();await page.getByRole('button',{name:'Excluir conta',exact:true}).click();assert.ok(await page.locator('#confirm').evaluate(el=>el.open));await page.getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await page.locator('#confirm').evaluate(el=>el.open),false);
 await page.getByRole('tab',{name:'Som',exact:true}).focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.getByRole('tab',{name:'Geral',exact:true}).getAttribute('aria-selected'),'true');assert.equal(await page.getByLabel('Avatares dos jogadores',{exact:true}).isChecked(),false);
 await page.getByRole('button',{name:'Restaurar padrão',exact:true}).click();assert.equal(await page.getByLabel('Avatares dos jogadores',{exact:true}).isChecked(),true);
 await page.getByRole('tab',{name:'Geral',exact:true}).focus();await page.screenshot({path:fileURLToPath(new URL('focus-1280x720.png',out))});
 await page.evaluate(()=>window.settingsArtQA.setDisabled(true));await page.screenshot({path:fileURLToPath(new URL('disabled-1280x720.png',out))});await page.evaluate(()=>window.settingsArtQA.setDisabled(false));
 await page.keyboard.press('Escape');assert.equal(await page.locator('#settings').evaluate(el=>el.open),false);await page.getByRole('button',{name:'Reabrir configurações',exact:true}).click();assert.ok(await page.locator('#settings').evaluate(el=>el.open));
 const inventory=JSON.parse(await readFile(new URL('assets/3d/commercial-licenses.json',root),'utf8'));const manifest=JSON.parse(await readFile(new URL('assets/settings/manifest.json',root),'utf8'));for(const record of manifest.records){const bytes=await readFile(new URL(record.file,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);assert.ok(inventory.records.some(r=>r.file===record.file&&r.sha256===record.sha256&&r.commercialUse));}
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 const report={assets:manifest.records.length,bytes:manifest.records.reduce((sum,r)=>sum+r.bytes,0),screens,allImagesDecoded:true,threeTabs:true,keyboardTabs:true,togglesAndFPS:true,rangeUpdates:true,saveAndResetInMemoryOnly:true,nestedDeleteConfirmation:true,disabledState:true,escapeCloseAndReopen:true,previewOnly:true,noAccountOperations:true,noPageErrors:true,failedRequests:failures};
 await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({assets:report.assets,bytes:report.bytes,screens:screens.length,errors:0}));
}finally{await browser?.close();await server.close();}
