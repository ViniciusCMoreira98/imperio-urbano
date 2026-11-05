import{chromium}from'@playwright/test';import{readFile,writeFile,mkdir,copyFile}from'node:fs/promises';import{fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=new URL('../../',import.meta.url),plan=JSON.parse(await readFile(new URL('assets/3d/requests/c8-portraits.json',root),'utf8')),output=new URL('apps/web/src/hud/art/avatars-c8/',root),sources=new URL('assets/3d/calibration/c8/portraits/',root);
await mkdir(output,{recursive:true});await mkdir(sources,{recursive:true});const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage(),records=[];
 for(const entry of plan.entries){
  const bytes=await readFile(entry.source),sourceName=`avatar-${entry.avatar}-source.png`;await copyFile(entry.source,new URL(sourceName,sources));
  const data=await page.evaluate(async data=>{const img=new Image();img.src=data;await img.decode();const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');const s=512/Math.max(img.width,img.height);x.drawImage(img,(512-img.width*s)/2,(512-img.height*s)/2,img.width*s,img.height*s);return c.toDataURL('image/webp',.94);},'data:image/png;base64,'+bytes.toString('base64'));
  const encoded=Buffer.from(data.split(',')[1],'base64'),file=`avatar-${entry.avatar}.webp`;await writeFile(new URL(file,output),encoded);records.push({avatar:`avatar-${entry.avatar}`,file,source:`assets/3d/calibration/c8/portraits/${sourceName}`,sourceSha256:createHash('sha256').update(bytes).digest('hex'),sha256:createHash('sha256').update(encoded).digest('hex'),bytes:encoded.length,width:512,height:512,prompt:entry.prompt});
 }
 await writeFile(new URL('provenance.json',output),JSON.stringify({created:'2026-11-05',provider:'OpenAI image_gen built-in',originalGeneration:true,referenceImageUsed:false,commercialUse:'Output ownership under OpenAI Terms; no third-party reference pixels',terms:'https://openai.com/policies/row-terms-of-use/',records},null,2)+'\n');console.log(JSON.stringify(records.map(({avatar,bytes})=>({avatar,bytes}))));
}finally{await browser.close();}
