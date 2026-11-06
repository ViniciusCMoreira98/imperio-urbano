import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = 'apps/web/src/property-evolution/';
const out = `${base}art/optimized/`;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = [];
for (const component of ['PropertyArtwork.tsx', 'StateHeaderArtwork.tsx']) {
  const text = await readFile(new URL(base + component, new URL('../../', import.meta.url)), 'utf8');
  for (const match of text.matchAll(/from '\.\/art\/(?:optimized\/)?([^']+)\.(?:png|webp)'/g)) {
    const name = match[1].replace(/^states\//, '');
    sources.push({ file: `${base}art/${name.includes('header-v1') ? 'states/' : ''}${name}.png`, name });
  }
}
assert.equal(sources.length, 35);
await mkdir(new URL(out, new URL('../../', import.meta.url)), { recursive: true });
const server = await createServer({ root, configFile: false, server: { host: '127.0.0.1', port: 4189, strictPort: true, watch: { ignored: ['**/art/optimized/**'] } } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4189/');
  const assets = [];
  for (const source of sources) {
    const header = source.name.includes('header');
    const icon = /coins|rent-growth|build-tools/.test(source.name);
    const maxWidth = header ? 1600 : icon ? 512 : 1024;
    const encoded = await page.evaluate(async ({ file, maxWidth }) => {
      const image = new Image(); image.src = '/' + file; await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(image.naturalWidth, maxWidth);
      canvas.height = Math.round(image.naturalHeight * canvas.width / image.naturalWidth);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/webp', .92);
      if (!url.startsWith('data:image/webp;')) throw new Error('WebP encoder unavailable');
      const decoded = new Image(); decoded.src = url; await decoded.decode();
      const check = document.createElement('canvas'); check.width = canvas.width; check.height = canvas.height;
      const checkCtx = check.getContext('2d'); checkCtx.drawImage(decoded, 0, 0);
      const original = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const result = checkCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      let alphaExact = true, transparentPixels = 0;
      for (let i = 3; i < original.length; i += 4) { if (original[i] !== result[i]) alphaExact = false; if (result[i] < 255) transparentPixels++; }
      return { data: url.split(',')[1], width: canvas.width, height: canvas.height, sourceWidth: image.naturalWidth, sourceHeight: image.naturalHeight, alphaExact, transparentPixels };
    }, { ...source, maxWidth });
    const bytes = Buffer.from(encoded.data, 'base64'); delete encoded.data;
    const original = await readFile(new URL(source.file, new URL('../../', import.meta.url)));
    assert.ok(encoded.alphaExact, `Alpha changed: ${source.name}`);
    assert.ok(bytes.length < original.length, `No reduction: ${source.name}`);
    const file = `${out}${source.name}.webp`;
    await writeFile(new URL(file, new URL('../../', import.meta.url)), bytes);
    assets.push({ file, source: source.file, sourceSha256: sha(original), sha256: sha(bytes), sourceBytes: original.length, bytes: bytes.length, ...encoded });
  }
  const sourceBytes = assets.reduce((sum, a) => sum + a.sourceBytes, 0);
  const bytes = assets.reduce((sum, a) => sum + a.bytes, 0);
  const manifest = { version: 1, date: '2026-11-06', encoder: `Chromium ${browser.version()} Canvas WebP`, quality: .92, resize: 'High quality, preserve aspect ratio, no enlargement', originals: 'Retained unchanged with original provenance', sourceBytes, bytes, reductionPercent: +(100 * (1 - bytes / sourceBytes)).toFixed(2), assets };
  await writeFile(new URL(out + 'manifest.json', new URL('../../', import.meta.url)), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ assets: assets.length, sourceBytes, bytes, reductionPercent: manifest.reductionPercent }));
} finally { await browser?.close(); await server.close(); }
