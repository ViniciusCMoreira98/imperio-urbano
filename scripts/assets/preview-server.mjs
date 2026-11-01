import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const threeRoot = resolve(dirname(require.resolve('three')), '..');
const previews = {
  'steampunk-girl-no-base-v2': 'steampunk-girl-no-base-v2-static-preview-v01.glb',
  'steampunk-girl-no-base-v1': 'steampunk-girl-no-base-v1-textured-preview-v02.glb',
  'steampunk-girl-quality-review': '../../reviews/quality-review/textured-quality-v03.glb',
  'steampunk-brasil-v01': '../../reviews/steampunk-brasil-v01/preview.glb',
  'steampunk-brasil-v01-textured': 'steampunk-brasil-v01-textured-web-v01.glb',
};
const selected = process.env.ASSET_PREVIEW_MODEL ?? 'steampunk-girl-no-base-v2';
if (!previews[selected]) throw new Error('Modelo de prévia desconhecido');
const model = resolve(root, 'assets/3d/optimized/characters', previews[selected]);
const html = await readFile(new URL('./preview.html', import.meta.url));
export const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(html); return; }
    let file;
    if (path === '/model.glb') file = model;
    else if (path.startsWith('/vendor/')) {
      file = resolve(threeRoot, decodeURIComponent(path.slice(8)));
      if (!file.startsWith(threeRoot + sep) || !file.endsWith('.js')) throw new Error();
    } else { res.writeHead(404).end(); return; }
    const info = await stat(file);
    res.writeHead(200, { 'Content-Type': file.endsWith('.glb') ? 'model/gltf-binary' : 'text/javascript', 'Content-Length': info.size, 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
server.listen(4174, '127.0.0.1', () => console.log('Prévia isolada: http://127.0.0.1:4174 (Ctrl+C encerra)'));
