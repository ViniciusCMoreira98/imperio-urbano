import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {PerspectiveCamera,Vector3} from 'three';
const root=new URL('../../',import.meta.url);
const camera=JSON.parse(await readFile(new URL('apps/web/src/board/camera/fixedCamera.json',root),'utf8'));
const {states}=JSON.parse(await readFile(new URL('packages/game-data/data/states.json',root),'utf8'));
const names=Object.fromEntries(states.map(s=>[s.id,s.name]));
const c=new PerspectiveCamera(camera.fov,camera.aspect,camera.near,camera.far);c.position.fromArray(camera.position);c.up.fromArray(camera.up);c.lookAt(...camera.target);c.setViewOffset(1536,1024,...camera.viewOffset,1536,1024);c.updateMatrixWorld(true);
const unproject=([x,y],height)=>{const ray=new Vector3(x/1536*2-1,1-y/1024*2,.5).unproject(c).sub(c.position).normalize();return c.position.clone().addScaledVector(ray,(height-c.position.y)/ray.y).toArray();};
const entries=[
 ['START','START',[[249,44],[364,44],[382,56],[395,157],[384,173],[190,176],[175,154],[206,83]]],
 ['AM','PROPERTY',[[394,61],[507,53],[527,165],[402,177]]],['RR','PROPERTY',[[509,52],[675,42],[713,154],[530,166]]],
 ['EVENT_NORTH','EVENT',[[690,38],[763,8],[778,8],[850,39],[831,151],[711,151]]],
 ['AP','PROPERTY',[[850,47],[954,53],[936,165],[819,155]]],['PA','PROPERTY',[[960,53],[1062,59],[1043,170],[939,165]]],['RO','PROPERTY',[[1065,59],[1166,69],[1162,180],[1044,170]]],
 ['OLYMPICS','OLYMPICS',[[1192,49],[1321,50],[1341,62],[1380,157],[1365,176],[1167,179],[1162,155],[1177,69]]],
 ['AC','PROPERTY',[[1171,183],[1360,185],[1371,235],[1181,237]]],['MT','PROPERTY',[[1183,240],[1370,240],[1384,291],[1194,293]]],['MS','PROPERTY',[[1196,298],[1384,297],[1395,350],[1206,352]]],['GO','PROPERTY',[[1208,356],[1398,356],[1411,413],[1219,416]]],
 ['EVENT_EAST','EVENT',[[1220,419],[1413,417],[1428,493],[1232,496]]],
 ['DF','PROPERTY',[[1235,501],[1429,498],[1443,559],[1244,560]]],['MG','PROPERTY',[[1248,566],[1444,565],[1459,631],[1255,628]]],['ES','PROPERTY',[[1257,633],[1461,635],[1476,698],[1270,700]]],
 ['REST','REST',[[1320,711],[1439,711],[1464,728],[1526,856],[1515,881],[1498,895],[1317,893],[1294,877],[1280,744],[1294,721]]],
 ['RJ','PROPERTY',[[1140,744],[1267,739],[1300,887],[1162,890]]],['PR','PROPERTY',[[997,749],[1133,746],[1156,891],[1010,891]]],['SP','PROPERTY',[[845,755],[991,750],[1004,891],[845,896]]],
 ['TAX','TAX',[[710,766],[758,743],[788,743],[835,766],[851,881],[833,901],[715,900],[696,884]]],
 ['RS','PROPERTY',[[595,758],[706,762],[695,894],[587,893]]],['SC','PROPERTY',[[480,754],[589,758],[583,893],[469,891]]],['PE','PROPERTY',[[369,750],[476,754],[464,891],[350,886]]],['PB','PROPERTY',[[254,745],[362,750],[343,885],[231,878]]],
 ['AIRPORT','AIRPORT',[[58,713],[220,709],[241,724],[224,863],[208,884],[30,886],[4,863],[13,823],[29,740]]],
 ['BA','PROPERTY',[[95,584],[306,596],[289,699],[62,689]]],['SE','PROPERTY',[[117,490],[322,498],[307,588],[97,580]]],['AL','PROPERTY',[[135,412],[335,419],[322,491],[119,486]]],['RN','PROPERTY',[[147,351],[348,356],[336,413],[136,407]]],['CE','PROPERTY',[[160,294],[359,299],[349,352],[148,346]]],['PI','PROPERTY',[[175,240],[375,243],[360,295],[163,290]]],['MA','PROPERTY',[[190,179],[385,181],[374,240],[175,236]]],
];
if(entries.length!==33||new Set(entries.map(e=>e[0])).size!==33)throw new Error('Esperadas 33 casas únicas.');
const tileHeight=.08;
const tiles=entries.map(([id,type,pixels],index)=>{
 const polygon=pixels.map(p=>unproject(p,tileHeight));
 const x=polygon.reduce((s,p)=>s+p[0],0)/polygon.length,z=polygon.reduce((s,p)=>s+p[2],0)/polygon.length;
 const side=index<=7?'north':index<=16?'east':index<=25?'south':'west';
 const rotationY={north:Math.PI,east:Math.PI/2,south:0,west:-Math.PI/2}[side];
 const local=polygon.map(p=>{const dx=p[0]-x,dz=p[2]-z;return [dx*Math.cos(rotationY)-dz*Math.sin(rotationY),dx*Math.sin(rotationY)+dz*Math.cos(rotationY)];});
 const width=Math.max(...local.map(p=>p[0]))-Math.min(...local.map(p=>p[0])),depth=Math.max(...local.map(p=>p[1]))-Math.min(...local.map(p=>p[1]));
 return {id,index,type,stateId:type==='PROPERTY'?id:null,label:names[id]??({START:'Início',OLYMPICS:'Olimpíadas',REST:'Descanso',AIRPORT:'Aeroporto',TAX:'Taxa'}[id]??'Evento'),side,pixels,polygon,anchor:{x,z,surfaceY:tileHeight,rotationY,width,depth,selectedLift:0,pawnArea:{x:0,z:type==='PROPERTY'?depth*.12:0,width:width*.72,depth:depth*(type==='PROPERTY'?.45:.7)},buildingArea:type==='PROPERTY'?{x:0,z:-depth*.32,width:width*.72,depth:depth*.18}:null},modelNode:'TILE_'+id};
});
const framePixels=[[253,43],[1328,47],[1513,872],[1510,903],[1489,920],[49,921],[22,900],[8,872],[175,154],[203,74]];
const centerPixels=[[391,177],[1159,177],[1242,738],[294,738]];
const backdropBoardHole=[[175,85],[249,39],[675,39],[763,3],[781,3],[851,41],[1329,43],[1384,180],[1534,850],[1528,902],[2,902],[0,840],[145,182]];
const diceHole=[[633,914],[869,914],[892,1024],[624,1024]];
const layers={frame:{pixels:framePixels,polygon:framePixels.map(p=>unproject(p,0)),innerPixels:[[267,65],[1312,67],[1491,867],[1480,886],[54,888],[32,860],[191,164]],surfaceY:.025},center:{pixels:centerPixels,polygon:centerPixels.map(p=>unproject(p,.035)),surfaceY:.035},backdrop:{pixels:[[0,0],[1536,0],[1536,1024],[0,1024]],holes:[backdropBoardHole,diceHole],surfaceY:-.42}};
layers.frame.inner=layers.frame.innerPixels.map(p=>unproject(p,layers.frame.surfaceY));
layers.frame.top=framePixels.map(p=>unproject(p,layers.frame.surfaceY));
layers.backdrop.polygon=layers.backdrop.pixels.map(p=>unproject(p,-.42));layers.backdrop.worldHoles=layers.backdrop.holes.map(h=>h.map(p=>unproject(p,-.42)));
layers.gaps={polygon:backdropBoardHole.map(p=>unproject(p,.02)),surfaceY:.02};
const dice=[{face:5,size:.73,pixel:[700,967],yaw:.25},{face:3,size:.73,pixel:[813,974],yaw:-.22}].map(d=>({...d,position:unproject(d.pixel,-.505+d.size/2)}));
const out={schemaVersion:1,source:camera.reference,model:'/models/board/reference33-v01.glb',tileHeight,tiles,layers,dice,integration:{logicalMigration:'Claude: 33 casas, sem TO e com 2 Eventos. IDs visuais não dependem dos índices do motor antigo.',nativeReference:[1536,1024],textureFit:'projective-full-face',cameraLocked:true,backendChanged:false},paidCredits:0};
const destination=new URL('apps/web/src/board/reference33/layout.json',root);await mkdir(new URL('.',destination),{recursive:true});await writeFile(destination,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({tiles:tiles.length,states:tiles.filter(t=>t.type==='PROPERTY').length,events:tiles.filter(t=>t.type==='EVENT').length}));
