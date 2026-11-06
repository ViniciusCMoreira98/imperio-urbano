import{readFile,writeFile}from'node:fs/promises';import{PerspectiveCamera,Vector3}from'three';import{board34Dice}from'./board34-dice.mjs';
const root=new URL('../../',import.meta.url),path=new URL('apps/web/src/board/board34/layout.json',root),layout=JSON.parse(await readFile(path,'utf8')),c=JSON.parse(await readFile(new URL('apps/web/src/board/camera/fixedCamera.json',root),'utf8'));
const camera=new PerspectiveCamera(c.fov,c.aspect,c.near,c.far);camera.position.fromArray(c.position);camera.up.fromArray(c.up);camera.lookAt(...c.target);camera.setViewOffset(1536,1024,...c.viewOffset,1536,1024);camera.updateMatrixWorld(true);
const project=position=>{const p=new Vector3(...position).project(camera);return[(p.x+1)*768,(1-p.y)*512];};
const updated=board34Dice(layout.layers.center.surfaceY,project);Object.assign(layout,updated);await writeFile(path,JSON.stringify(layout,null,2)+'\n');console.log(JSON.stringify(updated));
