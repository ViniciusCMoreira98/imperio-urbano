import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { server } from './preview-server.mjs';

const qualityReview = process.env.ASSET_PREVIEW_MODEL === 'steampunk-girl-quality-review';
const recreatedReview = process.env.ASSET_PREVIEW_MODEL === 'steampunk-brasil-v01';
const texturedReview = process.env.ASSET_PREVIEW_MODEL === 'steampunk-brasil-v01-textured';
const output = new URL(texturedReview ? '../../assets/3d/reports/steampunk-brasil-v01-textured/' : recreatedReview ? '../../assets/3d/reports/steampunk-brasil-v01/' : qualityReview ? '../../assets/3d/reports/quality-review/' : process.env.ASSET_PREVIEW_MODEL === 'steampunk-girl-no-base-v1' ? '../../assets/3d/reports/textured-review/' : '../../assets/3d/reports/phase-c/', import.meta.url);
await mkdir(output, { recursive: true });
if (!server.listening) await once(server, 'listening');
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const checks = [];
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('http://127.0.0.1:4174');
    await page.waitForFunction(() => window.assetQA?.loaded || window.assetQA?.errors?.length, null, { timeout: 30000 });
    const data = await page.evaluate(() => window.assetQA);
    assert.equal(data.loaded, true);
    assert.equal(data.cloneSucceeded, true);
    assert.ok(Math.abs(data.height - 1) < .02);
    assert.ok(Math.abs(data.bounds.min[1]) < .001);
    assert.ok(data.textureSizes.every(size => size.every(d => d > 0 && d <= (texturedReview ? 4096 : qualityReview ? 2048 : 1024))));
    if (texturedReview) assert.ok(data.textures >= 1);
    if (process.env.ASSET_PREVIEW_MODEL === 'steampunk-girl-no-base-v1') assert.equal(data.textures, 3);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: fileURLToPath(new URL(`browser-${viewport.width}.png`, output)) });
    checks.push({ viewport, ...data, errors });
    await page.close();
  }
  await writeFile(new URL('browser.json', output), JSON.stringify({ checks, mobileHardwareBenchmark: false }, null, 2));
  console.log(JSON.stringify(checks));
} finally { await browser?.close(); server.close(); }
