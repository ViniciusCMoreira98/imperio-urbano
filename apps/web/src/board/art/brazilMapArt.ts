import map from './brazilMap.json';

// Mosaico verde/amarelo/vermelho da referência; nunca representa propriedade ou aluguel.
const COLORS: Record<string,string> = {
  AC:'#168a49',AM:'#159343',RR:'#0c974b',RO:'#41a335',PA:'#38a92f',AP:'#31a342',TO:'#8db630',
  MA:'#dfd22d',PI:'#f5db25',CE:'#ffdb30',RN:'#ffc52c',PB:'#f9b52b',PE:'#eb303d',AL:'#f04435',SE:'#e82e3d',BA:'#f1cb27',
  MT:'#b3c63d',MS:'#309a48',GO:'#70ae36',DF:'#e8d442',MG:'#f4cf27',ES:'#ef3e37',RJ:'#e83d36',SP:'#ef4b35',PR:'#e7bd22',SC:'#f3ca2b',RS:'#e74630',
};

/** Desenho local em alta resolução; cores decorativas, sem relação com posse/preço. */
export function createBrazilMapCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const pad = 56;
  canvas.width = 1024;
  canvas.height = Math.ceil(map.height / map.width * (canvas.width - pad * 2) + pad * 2);
  const ctx = canvas.getContext('2d')!;
  const scale = (canvas.width - pad * 2) / map.width;
  ctx.translate(pad, pad);
  ctx.scale(scale, scale);
  const paths = map.states.map(state => ({ id: state.id, path: new Path2D(state.polygons.map(polygon => polygon.map(ring => ring.map(([x,y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ') + 'Z').join(' ')).join(' ')) }));
  // Halo e lateral inferior sugerem uma peça recortada sobre o piso.
  ctx.save(); ctx.translate(0, 7); ctx.shadowColor = '#51d8e880'; ctx.shadowBlur = 18; ctx.fillStyle = '#163f50';
  paths.forEach(({path}) => ctx.fill(path, 'evenodd')); ctx.restore();
  ctx.save(); ctx.translate(0, 5); ctx.fillStyle = '#9f7742'; ctx.strokeStyle = '#9f7742'; ctx.lineWidth = 3;
  paths.forEach(({path}) => { ctx.fill(path, 'evenodd'); ctx.stroke(path); }); ctx.restore();
  for (const {id, path} of paths) {
    ctx.fillStyle = COLORS[id] ?? '#269a48'; ctx.fill(path, 'evenodd');
    ctx.strokeStyle = '#fff2a8'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke(path);
  }
  return canvas;
}
