import{createServer}from'vite';import{chromium}from'@playwright/test';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const server=await createServer({root,configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4196,strictPort:true,watch:{ignored:['**/assets/3d/**','**/dist/**']}},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','three/examples/jsm/environments/RoomEnvironment.js']}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1536,height:1088},deviceScaleFactor:2});
 page.on('pageerror',e=>console.error(e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
 console.log('Abrindo cena');await page.goto('http://127.0.0.1:4196/scripts/assets/board34-preview/',{waitUntil:'networkidle',timeout:60000});console.log('Página carregada');
 await page.waitForFunction(()=>!!window.__board34,{timeout:30000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const clip=await page.locator('.board-composition').boundingBox();await page.screenshot({clip,path:fileURLToPath(new URL('../../assets/3d/reviews/board34/board34-v3.png',import.meta.url)),timeout:60000});
 for(const[name,ids]of[['north',['RN','AM','RR','EVENT_NORTH']],['tax',['RS','TAX','SP']],['event',['EVENT_EAST','DF']]]){
  const p=await page.evaluate(ids=>window.__board34().layout.tiles.filter(t=>ids.includes(t.id)).flatMap(t=>t.pixels),ids),xs=p.map(v=>v[0]),ys=p.map(v=>v[1]),x=Math.min(...xs)-8,y=Math.min(...ys)-8,width=Math.max(...xs)-x+8,height=Math.max(...ys)-y+8;
  await page.screenshot({clip:{x:clip.x+x,y:clip.y+y,width,height},path:fileURLToPath(new URL(`../../assets/3d/reviews/board34/detail-${name}-v3.png`,import.meta.url))});
 }
 console.log('Capturas reais salvas em resolução 2×');
}finally{await browser?.close();await server.close();}
