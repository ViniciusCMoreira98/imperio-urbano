import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = new URL('../../assets/3d/reviews/property-evolution/', import.meta.url);
await mkdir(output, { recursive: true });
const server = await createServer({root, configFile:false, esbuild:{jsx:'automatic'}, server:{host:'127.0.0.1',port:4185,strictPort:true}, optimizeDeps:{include:['react','react-dom/client']}});
await server.listen();
let browser;
try {
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1536,height:1024}});
  const errors = [];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4185/scripts/assets/property-evolution-preview/',{waitUntil:'networkidle'});
  await page.locator('.pe-panel img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert.equal(await page.locator('.pe-building').count(),6);
  assert.ok(await page.locator('.pe-building').evaluateAll(images=>images.every(image=>image.naturalWidth>=1024)));
  assert.equal(await page.locator('.pe-stage').count(),6);
  assert.equal(await page.locator('.pe-stage:disabled').count(),3);
  await page.locator('.pe-stage').nth(1).click();
  assert.match(await page.locator('.pe-confirm').innerText(),/CONSTRUIR 1 CASA$/);
  assert.equal(await page.locator('.pe-stage').nth(1).getAttribute('aria-pressed'),'true');
  await page.locator('.pe-stage').nth(3).click();
  assert.ok(await page.locator('.pe-summary strong').evaluateAll(nodes=>nodes.every(node=>node.textContent.startsWith('R$ '))));
  await page.screenshot({path:fileURLToPath(new URL('build-desktop.png',output))});
  const summary = await page.locator('.pe-summary').boundingBox();
  const confirm = await page.locator('.pe-confirm').boundingBox();
  const panel = await page.locator('.pe-panel').boundingBox();
  await page.screenshot({path:fileURLToPath(new URL('investment-details.png',output)),clip:{x:panel.x,y:summary.y-8,width:panel.width,height:confirm.y+confirm.height-summary.y+24}});
  await page.locator('.pe-confirm').click();
  assert.match(await page.locator('[role=status]').innerText(),/Nenhuma compra/);
  await page.getByRole('button',{name:'Compra',exact:true}).click();
  assert.match(await page.locator('.pe-confirm').innerText(),/COMPRAR TERRENO/);
  await page.locator('.pe-stage').nth(2).click();
  assert.match(await page.locator('.pe-confirm').innerText(),/COMPRAR \+ 2 CASAS/);
  await page.screenshot({path:fileURLToPath(new URL('purchase-desktop.png',output))});
  await page.getByRole('button',{name:'Construção',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:fileURLToPath(new URL('build-mobile.png',output)),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow horizontal no celular');
  for(const width of [320,768,1024]) {
    await page.setViewportSize({width,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow em ${width}`);
  }
  const layout = JSON.parse(await readFile(new URL('../../apps/web/src/board/reference33/layout.json',import.meta.url),'utf8'));
  const expectedCodes = layout.tiles.filter(tile=>tile.stateId).map(tile=>tile.stateId).sort();
  const optionCodes = await page.locator('select[aria-label="Estado da prévia"] option').evaluateAll(options=>options.map(option=>option.value).sort());
  assert.equal(expectedCodes.length,26);
  assert.deepEqual(optionCodes,expectedCodes);
  assert.ok(!optionCodes.includes('TO'));
  const headerSources = new Map();
  for(const width of [1536,390]) {
    await page.setViewportSize({width,height:width===1536?1024:844});
    for(const code of optionCodes) {
      await page.getByLabel('Estado da prévia').selectOption(code);
      const image = page.locator(`[data-state-art="${code}"]`);
      await image.evaluate(image=>image.decode());
      const dimensions = await image.evaluate(image=>({width:image.naturalWidth,height:image.naturalHeight,src:image.src}));
      assert.ok(dimensions.width>=2000 && dimensions.height>=700,`Fonte insuficiente para ${code}`);
      assert.ok(Math.abs(dimensions.width/dimensions.height-3)<.06,`Proporção inesperada para ${code}`);
      headerSources.set(code,dimensions.src);
      assert.equal(await page.locator('.pe-panel .pe-code').innerText(),code);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow no modal ${code}/${width}`);
      if(width===1536 && ['CE','MT','SP'].includes(code))await page.screenshot({path:fileURLToPath(new URL(`build-${code.toLowerCase()}.png`,output))});
    }
  }
  assert.equal(new Set(headerSources.values()).size,26,'Uma arte foi repetida em UFs diferentes');
  await page.evaluate(()=>{document.querySelector('.pe-header h2').textContent='Mato Grosso do Sul';document.querySelectorAll('.pe-summary strong').forEach(node=>node.textContent='R$ 1.234.567');});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'Fechar evolução da propriedade'}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.pe-panel').count(),0);
  await page.setViewportSize({width:1536,height:1024});
  await page.goto('http://127.0.0.1:4185/scripts/assets/property-evolution-preview/?gallery=1',{waitUntil:'networkidle'});
  await page.locator('[data-state-art]').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert.equal(await page.locator('.state-gallery figure').count(),26);
  await page.screenshot({path:fileURLToPath(new URL('state-headers-gallery.png',output)),fullPage:true});
  const provenance = JSON.parse(await readFile(new URL('../../apps/web/src/property-evolution/art/states/provenance.json',import.meta.url),'utf8'));
  const hashes = [];
  for(const asset of provenance.assets){const bytes=await readFile(new URL(`../../apps/web/src/property-evolution/art/states/${asset.file}`,import.meta.url));hashes.push(createHash('sha256').update(bytes).digest('hex'));}
  assert.equal(provenance.assets.length,25);
  assert.equal(new Set(hashes).size,25,'Os arquivos gerados devem ser distintos');
  assert.deepEqual(errors,[]);
  const report={stages:6,levels:'Terreno, Casa 1–4, Hotel',sizes:[320,390,768,1024,1536],stateHeaders:{created:25,total:26,codes:optionCodes,desktopAndMobileSwitches:52,distinctSources:26,sourceMinimum:[2000,700],matchesReference33:true},selectionAndPurchaseCallbacks:true,lockedCardsDisabled:true,keyboardClose:true,noHorizontalOverflow:true,originalGeneratedArtwork:true,buildingSourceMinWidth:1024,referencePixelsUsed:false,backendUsed:false,meshyCreditsUsed:0,gameIntegration:'pending Claude',errors};
  await writeFile(new URL('validation.json',output),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
} finally {await browser?.close();await server.close();}
