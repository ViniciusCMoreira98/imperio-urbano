/** Verso autoral em canvas, reutilizável no baralho 3D, sem informação de jogo. */
export function createEventCardBack(width = 512, height = 640): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(width / 512, height / 640);
  const gradient = ctx.createLinearGradient(0, 0, 512, 640);
  gradient.addColorStop(0, '#554074'); gradient.addColorStop(1, '#211d39');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 640);
  ctx.strokeStyle = '#c9afe4'; ctx.lineWidth = 5; ctx.strokeRect(16, 16, 480, 608);
  ctx.strokeStyle = '#efd49b'; ctx.lineWidth = 2; ctx.strokeRect(29, 29, 454, 582);
  ctx.save(); ctx.beginPath(); ctx.rect(35, 35, 442, 570); ctx.clip();
  ctx.strokeStyle = '#c5afe01c'; ctx.lineWidth = 2;
  for (let x = -640; x < 1152; x += 52) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 640, 640); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 640, 640); ctx.stroke(); }
  ctx.restore();
  ctx.translate(256, 290); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#332b4e'; ctx.fillRect(-115, -115, 230, 230); ctx.strokeStyle = '#efce84'; ctx.lineWidth = 4; ctx.strokeRect(-115, -115, 230, 230); ctx.rotate(-Math.PI / 4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe3a1'; ctx.font = '900 145px system-ui, sans-serif'; ctx.fillText('?', 0, -5);
  ctx.font = '850 44px system-ui, sans-serif'; ctx.fillText('EVENTOS', 0, 205);
  ctx.fillStyle = '#d7c4e5'; ctx.font = '700 17px system-ui, sans-serif'; ctx.fillText('IMPÉRIO URBANO', 0, 253);
  ctx.font = '600 14px system-ui, sans-serif'; ctx.fillText('EDIÇÃO BRASIL', 0, -208);
  return canvas;
}
