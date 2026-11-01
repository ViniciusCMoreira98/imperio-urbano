import React, { Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { DiceVisual } from '../../../apps/web/src/dice/DiceVisual';
import type { DiceFace } from '../../../apps/web/src/dice/diceOrientation';
import asset from '../../../apps/web/src/dice/diceAsset.json';

(window as any).diceQA = { faces: {}, roll: { ready: false } };
function Lighting() {
  return <><ambientLight intensity={.9} /><directionalLight position={[2, 4, 3]} color="#fff0d7" intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-normalBias={.02} /><directionalLight position={[-3, 2, -1]} color="#b4ccff" intensity={.7} /><mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#1b2c4a" roughness={.85} /></mesh></>;
}
function inspect(root: Group, face: DiceFace) {
  root.updateWorldMatrix(true, true);
  const mesh = root.getObjectByName('DicePips');
  if (!mesh) return null;
  const normal = asset.faceNormals[String(face) as keyof typeof asset.faceNormals];
  return new Vector3(...normal as [number, number, number]).transformDirection(mesh.matrixWorld).toArray();
}
function StaticDie({ face }: { face: DiceFace }) {
  const root = useRef<Group>(null);
  useFrame(() => { if (root.current) { const top = inspect(root.current, face); if (top) (window as any).diceQA.faces[face] = { face, normal: top }; } });
  return <group ref={root} position={[0, .45, 0]}><DiceVisual face={face} size={.9} /></group>;
}
const pairs: [DiceFace, DiceFace][] = [[2, 5], [6, 1], [4, 3]];
function DemoPair({ roll }: { roll: number }) {
  const group = useRef<Group>(null);
  const started = useRef<number | null>(null);
  const values = pairs[roll % pairs.length];
  useEffect(() => { started.current = null; }, [roll]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const progress = roll === 0 ? 1 : Math.min(1, (clock.elapsedTime - started.current) / 1.25);
    const remaining = (1 - progress) ** 3;
    const tops: (number[] | null)[] = [];
    group.current.children.forEach((die, index) => {
      const sign = index === 0 ? -1 : 1;
      die.position.set(sign * (.64 + remaining * .45), .37 + Math.abs(Math.sin(progress * Math.PI * 3)) * (1-progress) * .65, index === 0 ? -.07 : .16);
      die.rotation.set(sign * remaining * Math.PI * 6, sign * (.22 + remaining * Math.PI * 4), remaining * Math.PI * 2);
      tops.push(inspect(die as Group, values[index]));
    });
    (window as any).diceQA.roll = { ready: tops.every(Boolean), id: roll, animating: progress < 1, values, normals: tops, demoOnly: true };
  });
  return <group ref={group}>{values.map((face, index) => <group key={index}><DiceVisual face={face} size={.74} /></group>)}</group>;
}
function App() {
  const [roll, setRoll] = useState(0);
  return <main><h1>Império Urbano · dados 3D</h1><p>Corpo marfim, cantos arredondados e pontos escuros em baixo-relevo, como na referência do tabuleiro.</p><section className="hero" aria-label="Par de dados 3D"><Canvas shadows camera={{ position: [2.5, 2.5, 3.7], fov: 35 }} onCreated={({camera}) => camera.lookAt(0,.25,0)}><color attach="background" args={['#14223c']} /><Lighting /><Suspense fallback={null}><DemoPair roll={roll} /></Suspense></Canvas></section><div className="controls"><button onClick={() => setRoll(n => n+1)}>Reproduzir demonstração</button><small>Demonstração de arte com pares predeterminados. Sem sorteio ou conexão com a partida.</small></div><section className="faces" aria-label="Seis faces do dado">{([1,2,3,4,5,6] as DiceFace[]).map(face => <article className="card" key={face}><h2>Face {face}</h2><div className="faceCanvas"><Canvas shadows camera={{position:[1.9,2.8,2.3],fov:32}} onCreated={({camera}) => camera.lookAt(0,.4,0)}><color attach="background" args={['#17233d']} /><Lighting /><Suspense fallback={null}><StaticDie face={face}/></Suspense></Canvas></div></article>)}</section><p><small>Um GLB compartilhado · seis orientações verificadas · integração com o resultado oficial a cargo da engenharia.</small></p></main>;
}
createRoot(document.getElementById('root')!).render(<App />);
