import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {OrthographicCamera,Vector3} from 'three';
import {chromium} from '@playwright/test';
const root=new URL('../../',import.meta.url),folder=new URL('assets/board-mobile/reference-style-3d/',root);
const before=JSON.parse(await readFile(new URL('revision-01/report.json',folder))),after=JSON.parse(await readFile(new URL('review/report.json',folder)));
const prior=before.checks.find(c=>c.width===1672&&c.height===941),next=after.checks.find(c=>c.width===1672&&c.height===941);
const oldOutline=[[0,-6.7],[5.3,-4.9],[8,0],[5.3,4.9],[0,6.7],[-5.3,4.9],[-8,0],[-5.3,-4.9]];
const c=new OrthographicCamera(-836,836,470.5,-470.5,.1,100);c.position.set(0,17.5,17);c.lookAt(0,-.16,0);c.zoom=prior.board.width/16;c.updateProjectionMatrix();c.updateMatrixWorld(true);
const previous=oldOutline.map(([x,z])=>{const p=new Vector3(x,.021,z).project(c);return{x:(p.x+1)*836,y:(1-p.y)*470.5}});
const points=values=>[...values,values[0]].map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
const reference=await readFile(new URL('reference-approved.png',folder)),current=await readFile(new URL('review/board-1672x941.png',folder));
const data=b=>'data:image/png;base64,'+b.toString('base64');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="995" viewBox="0 0 1672 995"><image href="${data(reference)}" width="1672" height="941"/><polyline points="${points(previous)}" fill="none" stroke="#e851b5" stroke-width="4" stroke-dasharray="11 7"/><polyline points="${points(next.outline)}" fill="none" stroke="#52f0be" stroke-width="4"/><rect y="941" width="1672" height="54" fill="#102a32"/><text x="24" y="974" font-family="Arial" font-size="20" fill="#e851b5">Contorno anterior</text><text x="260" y="974" font-family="Arial" font-size="20" fill="#52f0be">Contorno revisado</text><text x="570" y="974" font-family="Arial" font-size="18" fill="#fff9e6">Sobreposição na referência — comparação visual de enquadramento</text></svg>`;
const svgFile=new URL('review/alignment-overlay.svg',folder);await writeFile(svgFile,svg);
const pair=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="525" viewBox="0 0 1672 525"><rect width="1672" height="525" fill="#102a32"/><image href="${data(reference)}" x="0" y="54" width="836" height="470.5"/><image href="${data(current)}" x="836" y="54" width="836" height="470.5"/><text x="24" y="36" font-family="Arial" font-size="22" fill="#fff9e6">Referência visual</text><text x="860" y="36" font-family="Arial" font-size="22" fill="#fff9e6">Captura do renderizador</text></svg>`;
// The side-by-side sheet is deliberately separate from runtime assets.
await writeFile(new URL('review/comparison.svg',folder),pair);
let browser;try{browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1672,height:995}});await page.goto(pathToFileURL(fileURLToPath(svgFile)).href);await page.waitForFunction(()=>[...document.querySelectorAll('image')].length===1);await page.screenshot({path:fileURLToPath(new URL('review/alignment-overlay.png',folder))});}finally{await browser?.close()}
await writeFile(new URL('review/alignment.json',folder),JSON.stringify({purpose:'Visual silhouette comparison only, no automated aesthetic approval',reference:'reference-approved.png',previous,current:next.outline,logo:next.logo,roll:next.roll},null,2));
console.log('Alignment overlay and geometry record saved.');
