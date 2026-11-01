import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Regenera somente o descriptor de arte; nunca modifica o catálogo do jogo.
const source = new URL('../../assets/board/sources/brazil-uf-ibge.geojson', import.meta.url);
const bytes = await readFile(source);
const geo = JSON.parse(bytes);
const codes = {11:'RO',12:'AC',13:'AM',14:'RR',15:'PA',16:'AP',17:'TO',21:'MA',22:'PI',23:'CE',24:'RN',25:'PB',26:'PE',27:'AL',28:'SE',29:'BA',31:'MG',32:'ES',33:'RJ',35:'SP',41:'PR',42:'SC',43:'RS',50:'MS',51:'MT',52:'GO',53:'DF'};
const points = geo.features.flatMap(f => f.geometry.coordinates.flat(f.geometry.type === 'MultiPolygon' ? 2 : 1));
const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
// Projeção equiretangular corrigida na latitude média, norte para cima. Uso ilustrativo.
const aspect = Math.cos((minY + maxY) / 2 * Math.PI / 180);
const width = 900, height = (maxY - minY) / ((maxX - minX) * aspect) * width;
const project = ([x,y]) => [Math.round((x-minX)/(maxX-minX)*width*10)/10, Math.round((maxY-y)/(maxY-minY)*height*10)/10];
const states = geo.features.map(feature => ({
  id: codes[feature.properties.codarea],
  polygons: (feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [feature.geometry.coordinates]).map(polygon => polygon.map(ring => ring.map(project))),
}));
if (states.length !== 27 || states.some(s => !s.id) || new Set(states.map(s => s.id)).size !== 27) throw new Error('Esperadas 27 UFs distintas.');
const output = new URL('../../apps/web/src/board/art/brazilMap.json', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
await writeFile(output, JSON.stringify({schemaVersion:1,source:'IBGE — API de Malhas Geográficas, qualidade mínima, divisão por UF',sourceUrl:'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=UF',sourceSha256:createHash('sha256').update(bytes).digest('hex'),projection:'Equiretangular com correção na latitude média; mapa decorativo simplificado',width,height:Math.round(height*10)/10,states})+'\n');
console.log(JSON.stringify({states:states.length,points:points.length,width,height:Math.round(height*10)/10}));
