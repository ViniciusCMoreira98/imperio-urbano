import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AnimatedBalance,useMoneyFlights} from '../../../apps/web/src/hud/MoneyMotion';
import './preview.css';
function Preview(){
 const [state,setState]=useState({shown:{vinicius:1500,marina:1500},resync:0});
 useMoneyFlights(state.shown,state.resync);
 (window as any).moneyQA={set:setState,transfer:(kind:string)=>setState(s=>({resync:s.resync,shown:kind==='player'?{vinicius:s.shown.vinicius-120,marina:s.shown.marina+120}:kind==='pay-bank'?{...s.shown,vinicius:s.shown.vinicius-100}:{...s.shown,vinicius:s.shown.vinicius+300}}))};
 return <main><header><h1>Dinheiro do Império</h1><p>Prévia da arte usando a animação real da interface</p></header><section className="stage">
  <article className="player first"><span className="avatar">V</span><div><h2>Vinícius</h2><strong><AnimatedBalance playerId="vinicius" value={state.shown.vinicius} resync={state.resync}/></strong></div></article>
  <article className="player second"><span className="avatar">M</span><div><h2>Marina</h2><strong><AnimatedBalance playerId="marina" value={state.shown.marina} resync={state.resync}/></strong></div></article>
  <div className="board-center-slot"><span>IMPÉRIO<br/><b>URBANO</b></span><small>Banco · centro do tabuleiro</small></div>
 </section><footer>Estudo da cédula e dos voos • valores e regras preservados</footer></main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
