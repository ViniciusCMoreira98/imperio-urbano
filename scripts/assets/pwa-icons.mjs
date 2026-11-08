// Ícones provisórios do app instalável (PWA): logotipo do menu sobre fundo azul, em PNG.
// Uso: node scripts/assets/pwa-icons.mjs  →  apps/web/public/icon-*.png e apple-touch-icon.png
// "maskable" deixa o logotipo dentro da zona segura (80%) para o Android recortar em círculo/gota.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const logo = readFileSync(`${root}apps/web/src/main-menu/art/logo-v1.webp`).toString('base64');
const out = `${root}apps/web/public/`;

const icons = [
  { file: 'icon-192.png', size: 192, logo: 0.9 },
  { file: 'icon-512.png', size: 512, logo: 0.9 },
  { file: 'icon-maskable-512.png', size: 512, logo: 0.68 },
  { file: 'apple-touch-icon.png', size: 180, logo: 0.86 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const icon of icons) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(`<html><body style="margin:0;width:${icon.size}px;height:${icon.size}px;display:grid;place-items:center;
    background:radial-gradient(circle at 50% 38%,#25a6e6 0%,#0a6aae 48%,#053462 100%)">
    <img src="data:image/webp;base64,${logo}" style="width:${icon.logo * 100}%;height:${icon.logo * 100}%;object-fit:contain;
    filter:drop-shadow(0 ${icon.size / 64}px ${icon.size / 48}px #00152d99)"></body></html>`);
  await page.waitForFunction(() => document.images[0]?.complete);
  await page.screenshot({ path: out + icon.file, omitBackground: false });
  console.log(`${icon.file} ${icon.size}px`);
}
await browser.close();
