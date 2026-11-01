import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = new URL('../../assets/3d/reviews/olympics/', import.meta.url);
await mkdir(output, { recursive: true });
const server = await createServer({ root, configFile: false, esbuild: { jsx: 'automatic' }, server: { host: '127.0.0.1', port: 4178, strictPort: true } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const checks = [];
  for (const viewport of [{ width: 1280, height: 1000 }, { width: 390, height: 1000 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => { if (/\/(api|ws)(\/|\?|$)/.test(new URL(request.url()).pathname)) requests.push(request.url()); });
    await page.goto('http://127.0.0.1:4178/scripts/assets/olympics-preview/');
    const hero = page.locator('.host');
    await hero.getByRole('img', { name: /Rio de Janeiro.*vezes 3/ }).waitFor();
    await page.getByRole('combobox').selectOption('10');
    await hero.getByRole('img', { name: /vezes 10/ }).waitFor();
    await page.getByRole('button', { name: 'Celebrar edição' }).click();
    assert.equal(await hero.locator('.iu-olympic__confetti i').count(), 24);
    await hero.evaluate(element => { element.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 450; }); });
    await page.screenshot({ path: fileURLToPath(new URL(`olympics-${viewport.width}.png`, output)), fullPage: true });
    await hero.evaluate(element => { element.getAnimations({ subtree: true }).forEach(animation => animation.finish()); });
    assert.equal(await hero.locator('.iu-olympic__headline').isVisible(), false);
    assert.equal(await hero.getByRole('img').isVisible(), true);
    await page.getByRole('button', { name: 'Celebrar edição' }).click();
    await page.getByRole('checkbox', { name: 'Sem movimento' }).check();
    assert.equal(await hero.locator('.iu-olympic__confetti').isVisible(), false);
    assert.equal(await hero.locator('.iu-olympic__badge').evaluate(el => getComputedStyle(el).animationName), 'none');
    await page.getByRole('checkbox', { name: 'Sem movimento' }).uncheck();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await hero.locator('.iu-olympic__confetti').isVisible(), false);
    assert.equal(await hero.locator('.iu-olympic__badge').evaluate(el => getComputedStyle(el).animationName), 'none');
    const bounds = await page.locator('.iu-olympic__badge').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; }));
    assert.ok(bounds.every(r => r.left >= 0 && r.right <= viewport.width));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await hero.locator('.iu-olympic').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    await page.screenshot({ path: fileURLToPath(new URL(`olympics-still-${viewport.width}.png`, output)), fullPage: true });
    checks.push({ viewport, multiplier: 10, confettiCount: 24, badgePersists: true, reducedMotionProp: true, reducedMotionMedia: true, fitsViewport: true, errors, apiCalls: requests });
    await page.close();
  }
  await writeFile(new URL('visual.json', output), JSON.stringify({ demoOnly: true, checks }, null, 2) + '\n');
  console.log(JSON.stringify({ viewports: checks.length, badgePersists: true, reducedMotion: true, apiCalls: 0 }));
} finally { await browser?.close(); await server.close(); }
