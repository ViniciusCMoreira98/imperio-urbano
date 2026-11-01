import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = new URL('../../assets/3d/reviews/manifest-integration/', import.meta.url);
await mkdir(output, { recursive: true });
const server = await createServer({ root, configFile: false, esbuild: { jsx: 'automatic' }, publicDir: fileURLToPath(new URL('../../apps/web/public/', import.meta.url)), server: { host: '127.0.0.1', port: 4175, strictPort: true }, optimizeDeps: { include: ['react', 'react-dom/client', 'three', '@react-three/fiber', '@react-three/drei'] } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const checks = [];
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 1000 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('http://127.0.0.1:4175/scripts/assets/manifest-preview/');
    await page.waitForFunction(() => window.manifestQA?.loaded, null, { timeout: 45000 });
    const loaded = await page.evaluate(() => window.manifestQA);
    assert.equal(loaded.modelId, 'steampunk-brasil-v01-textured');
    assert.ok(loaded.instances.every(i => Math.abs(i.minY - .1) < .002 && Math.abs(i.height - .86) < .01));
    assert.ok(loaded.instances.every(i => i.meshes.some(m => m.triangles === 11900)));
    await page.getByRole('button', { name: 'Solicitar caminhada' }).click();
    await page.waitForFunction(() => window.manifestQA?.motion === 'walk');
    await page.getByRole('combobox', { name: 'Avatar' }).selectOption('avatar-2');
    await page.waitForFunction(() => window.manifestQA?.loaded && window.manifestQA.avatarId === 'avatar-2');
    await page.getByRole('combobox', { name: 'Avatar' }).selectOption('avatar-3');
    await page.getByRole('button', { name: 'Parado' }).click();
    await page.waitForFunction(() => window.manifestQA?.loaded && window.manifestQA.avatarId === 'avatar-3' && window.manifestQA.motion === 'idle');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: fileURLToPath(new URL(`manifest-${viewport.width}.png`, output)), fullPage: true });
    checks.push({ viewport, ...loaded, errors, avatarSwitchPassed: true, missingWalkClipHandled: true });
    await page.close();
  }
  const fallbackPage = await browser.newPage();
  let reserveLoaded = false;
  const warnings = [];
  fallbackPage.on('response', r => { if (r.url().endsWith('/character-male-a.glb') && r.ok()) reserveLoaded = true; });
  fallbackPage.on('console', msg => { if (msg.type() === 'warning') warnings.push(msg.text()); });
  await fallbackPage.route('**/steampunk-brasil-v01.glb', route => route.fulfill({ status: 404, body: 'Missing for fallback test' }));
  await fallbackPage.goto('http://127.0.0.1:4175/scripts/assets/manifest-preview/');
  await fallbackPage.waitForFunction(() => window.manifestQA?.loaded, null, { timeout: 30000 });
  assert.equal(reserveLoaded, true);
  assert.ok(warnings.some(w => w.includes('usando o reserva')));
  await fallbackPage.close();
  const report = { checks, fallback: { passed: true, reserveLoaded, expectedWarnings: warnings.length }, mobileHardwareBenchmark: false };
  await writeFile(new URL('integration.json', output), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} finally { await browser?.close(); await server.close(); }
