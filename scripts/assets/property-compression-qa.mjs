import { readFile, readdir, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('../../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('apps/web/src/property-evolution/art/optimized/manifest.json', root), 'utf8'));
const inventory = JSON.parse(await readFile(new URL('assets/3d/commercial-licenses.json', root), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const packaged = new Set();
const names = await readdir(new URL('apps/web/dist/assets/', root));
for (const name of names.filter(name => name.endsWith('.webp'))) packaged.add(digest(await readFile(new URL('apps/web/dist/assets/' + name, root))));
assert.equal(manifest.assets.length, 35);
for (const asset of manifest.assets) {
  assert.equal(digest(await readFile(new URL(asset.source, root))), asset.sourceSha256, 'Original changed');
  assert.equal(digest(await readFile(new URL(asset.file, root))), asset.sha256, 'Derivative changed');
  assert.ok(asset.alphaExact, 'Alpha must survive encoding exactly');
  assert.ok(asset.bytes < asset.sourceBytes);
  assert.ok(packaged.has(asset.sha256), `Not packaged: ${asset.file}`);
  assert.ok(inventory.records.some(record => record.file === asset.file && record.sha256 === asset.sha256 && record.commercialUse));
  const originalName = asset.source.split('/').at(-1).replace('.png', '-');
  assert.ok(!names.some(name => name.startsWith(originalName) && name.endsWith('.png')), `Original PNG packaged: ${originalName}`);
}
const groups = {};
for (const [name, filter] of Object.entries({ headers: a => a.file.includes('header'), buildings: a => /terrain|house|hotel/.test(a.file), icons: a => /coins|rent-growth|build-tools/.test(a.file) })) {
  const assets = manifest.assets.filter(filter);
  const sourceBytes = assets.reduce((sum, a) => sum + a.sourceBytes, 0);
  const bytes = assets.reduce((sum, a) => sum + a.bytes, 0);
  groups[name] = { assets: assets.length, sourceBytes, bytes, reductionPercent: +(100 * (1 - bytes / sourceBytes)).toFixed(2) };
}
const output = new URL('assets/3d/reviews/property-compression/', root);
await mkdir(output, { recursive: true });
for (const name of ['owned-desktop', 'owned-844x390']) await copyFile(new URL(`assets/3d/reviews/property-view/${name}.png`, root), new URL(`after-${name}.png`, output));
const report = { assets: 35, originalHashesUnchanged: true, alphaPreserved: true, derivativesInCommercialInventory: true, allDerivativesPackaged: true, originalPNGsNotPackaged: true, sourceBytes: manifest.sourceBytes, bytes: manifest.bytes, reductionPercent: manifest.reductionPercent, groups };
await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
