// Ícone original do app: coroa e monograma IU em vetor, exportados em PNG.
// Uso: node scripts/assets/pwa-icons.mjs  →  apps/web/public/icon-*.png e apple-touch-icon.png
// O emblema fica dentro da zona segura circular de 80%; o fundo é opaco e sangrado.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const logo = readFileSync(`${root}assets/app-icon/source/app-icon-v1.svg`).toString('base64');
const out = `${root}apps/web/public/`;

const icons = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const icon of icons) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(`<html><body style="margin:0;width:${icon.size}px;height:${icon.size}px;display:grid;place-items:center;
    background:#053462">
    <img src="data:image/svg+xml;base64,${logo}" style="width:100%;height:100%;object-fit:contain"></body></html>`);
  await page.evaluate(()=>document.images[0].decode());
  await page.screenshot({ path: out + icon.file, omitBackground: false });
  console.log(`${icon.file} ${icon.size}px`);
}
await browser.close();
