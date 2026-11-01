import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { board, states, eventCards } from '@imperio/game-data';
import { BoardCenter } from '../../../apps/web/src/board/BoardCenter';
import { CenterInfo } from '../../../apps/web/src/board/CenterInfo';
import { boardLength, CORNER_SIZE, tilePlacement } from '../../../apps/web/src/board/layout';
import { Tile } from '../../../apps/web/src/board/Tile';
import { useBoardArt } from '../../../apps/web/src/board/boardArt';
import { createBrazilMapCanvas } from '../../../apps/web/src/board/art/brazilMapArt';
import map from '../../../apps/web/src/board/art/brazilMap.json';
import { EventCardVisual } from '../../../apps/web/src/cards/EventCardVisual';
import { createEventCardBack } from '../../../apps/web/src/cards/eventCardBack';
import { useViewStore } from '../../../apps/web/src/store/viewStore';
import './preview.css';

const LENGTH = boardLength(board.tilesPerSide);
(window as any).mapQA = { ready: false };
function Probe() {
  const art = useBoardArt();
  useFrame(({ camera, gl }) => {
    const target = tilePlacement(0, board.tilesPerSide);
    const point = new Vector3(target.x, .08, target.z).project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    (window as any).mapQA = {ready: !!art, states:map.states.map(s => s.id), selectedTile:useViewStore.getState().selectedTile, click:{x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2}, triangles:gl.info.render.triangles};
  });
  return null;
}
function CanvasArt({ kind }: { kind: 'map' | 'back' }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const canvas = kind === 'map' ? createBrazilMapCanvas() : createEventCardBack(); canvas.setAttribute('aria-label', kind === 'map' ? 'Mapa decorativo do Brasil com 27 UFs' : 'Verso de Eventos'); canvas.setAttribute('role','img'); root.current?.replaceChildren(canvas); }, [kind]);
  return <div ref={root} className={`art art--${kind}`}/>;
}
function Preview() {
  const [id, setId] = useState(eventCards[0].id);
  const card = eventCards.find(c => c.id === id)!;
  return <main><header><small>IMPÉRIO URBANO · E27</small><h1>Brasil em destaque.</h1><p>Mapa central com contornos das 27 UFs, acabamento verde e dourado e cartas com ilustrações próprias.</p></header>
    <section className="scene" aria-label="Prévia real do tabuleiro"><Canvas shadows camera={{position:[0,15,11],fov:43}} dpr={[1,2]}><color attach="background" args={['#151d36']}/><ambientLight intensity={1.1}/><directionalLight position={[-6,15,7]} intensity={2.3} color="#ffe8cb" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8}/>
      <mesh position={[0,-.14,0]} receiveShadow><boxGeometry args={[LENGTH+.4,.28,LENGTH+.4]}/><meshStandardMaterial color="#252e50"/></mesh>
      {board.tiles.map(tile => { const state = states.find(s => s.id === tile.stateId); return <Tile key={tile.index} tile={tile} state={state} group={board.colorGroups.find(g => g.id === state?.colorGroup)} placement={tilePlacement(tile.index,board.tilesPerSide)}/>; })}
      <BoardCenter size={LENGTH - 2*CORNER_SIZE}/><CenterInfo size={LENGTH-2*CORNER_SIZE}/><Probe/>
    </Canvas></section>
    <div className="studies"><section><h2>Arte do mapa</h2><div className="map-study"><CanvasArt kind="map"/></div><p className="note">Contornos simplificados: IBGE. Cores decorativas; não indicam posse nem preço.</p></section>
    <section><h2>Frente e verso de Eventos</h2><label htmlFor="card">Conferir carta</label><select id="card" value={id} onChange={e => setId(e.target.value)}>{eventCards.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><div className="card-pair"><EventCardVisual card={card} who="Prévia de arte"/><CanvasArt kind="back"/></div></section></div>
    <footer>Prévia isolada. Seleção das casas preservada; textos das cartas vêm do catálogo do jogo. Sem comandos ao servidor.</footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
