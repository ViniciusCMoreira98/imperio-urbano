import React from 'react';
import {createRoot} from 'react-dom/client';
import {BoardArtworkSprite,BoardCenterArtwork,boardArtManifest,type BoardArtworkId} from '../../../apps/web/src/board/art/BoardArtwork';
import './preview.css';

createRoot(document.getElementById('root')!).render(<main><header><small>IMPÉRIO URBANO · ARTES FORNECIDAS</small><h1>Fontes definitivas do tabuleiro</h1><p>Imagens originais, com recortes que preservam as proporções. A adaptação do percurso fica com a engenharia.</p></header><section className="center-art"><BoardCenterArtwork/></section><h2>27 unidades da federação</h2><div className="grid states">{Object.keys(boardArtManifest.states).map(id=><div key={id} data-art={id}><BoardArtworkSprite artId={id as BoardArtworkId}/></div>)}</div><h2>Artes especiais</h2><div className="grid specials">{Object.keys(boardArtManifest.specials).map(id=><div key={id} data-art={id}><BoardArtworkSprite artId={id as BoardArtworkId}/><small>{id}</small></div>)}</div><footer>Os IDs AIRPORT e TAX identificam artes; não definem regras, número de casas ou ordem do percurso. Nenhuma partida ou servidor é usado nesta prévia.</footer></main>);
