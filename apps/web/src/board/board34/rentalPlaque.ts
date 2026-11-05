import type{PanelRect}from './panelProjection';
/** Faixa dinâmica: só é desenhada quando o host fornece aluguel de uma propriedade comprada. */
export function paintRentalPlaque(ctx:CanvasRenderingContext2D,r:PanelRect){
 const gradient=ctx.createLinearGradient(0,r.y,0,r.y+r.height);
 gradient.addColorStop(0,'#32447b');gradient.addColorStop(.5,'#171d43');gradient.addColorStop(1,'#070e27');
 ctx.fillStyle=gradient;ctx.strokeStyle='#edc25e';ctx.lineWidth=1.4;ctx.beginPath();ctx.roundRect(r.x,r.y,r.width,r.height,Math.min(6,r.height/3));ctx.fill();ctx.stroke();
}
