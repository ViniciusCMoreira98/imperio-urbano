import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base=new URL('../../assets/board/',import.meta.url);
const files={center:'rio-em-cores.png',atlas:'estados-brasileiros-atlas.png'};
const sources={};
for(const [id,file] of Object.entries(files)){
  const bytes=await readFile(new URL(file,base));
  sources[id]={file,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),origin:'Imagem fornecida pelo usuário; original sem alterações'};
}
const rows=[
  {y:21,h:183,items:[['AC',17,240],['AL',263,216],['AP',482,211],['AM',697,207],['BA',909,205],['CE',1117,204],['DF',1323,204]]},
  {y:216,h:185,items:[['ES',16,237],['GO',257,218],['MA',479,212],['MT',695,211],['MS',910,204],['MG',1117,204],['PA',1325,201]]},
  {y:411,h:181,items:[['PB',9,241],['PR',254,217],['PE',475,215],['PI',696,205],['RJ',905,208],['RN',1117,204],['RS',1324,202]]},
  {y:604,h:183,items:[['RO',6,246],['RR',255,252],['SC',510,255],['SP',769,244],['SE',1018,254],['TO',1277,253]]},
];
const states={};
for(const {y,h,items} of rows)for(const [id,x,w] of items)states[id]={rect:[x,y,w,h],aspectRatio:w/h};
const specials={};
for(const [id,x,w] of [['START',237,207],['EVENT',446,202],['AIRPORT',650,210],['TAX',865,202],['REST',1070,217],['OLYMPICS',1290,237]])specials[id]={rect:[x,802,w,193],aspectRatio:w/193};
const {states:catalog}=JSON.parse(await readFile(new URL('../../packages/game-data/data/states.json',import.meta.url),'utf8'));
if(JSON.stringify(Object.keys(states).sort())!==JSON.stringify(catalog.map(s=>s.id).sort()))throw new Error('UFs da prancha diferem do catálogo.');
for(const {rect:[x,y,w,h]} of [...Object.values(states),...Object.values(specials)])if(x<0||y<0||x+w>sources.atlas.width||y+h>sources.atlas.height)throw new Error('Janela fora da prancha.');
const manifest={schemaVersion:1,sources,center:{aspectRatio:sources.center.width/sources.center.height,fit:'contain'},states,specials,logo:{rect:[8,796,226,192],aspectRatio:226/192},integration:{status:'awaiting-engineering-layout',preserveArtworkAspect:true,artworkIdsAreNotRuleTypes:true,notes:['27 UFs: nenhuma exclusão indicada pela prancha','AIRPORT/TAX são IDs de arte; regra e associação ao percurso ficam com Claude','Quantidade de sprites não determina número de casas ou repetições de Evento']},paidCredits:0};
await writeFile(new URL('board-art-manifest.json',base),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({states:Object.keys(states).length,specials:Object.keys(specials).length,centerAspect:manifest.center.aspectRatio,paidCredits:0}));
