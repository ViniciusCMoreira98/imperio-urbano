// Conferência local usando os componentes reais, sem sessão/backend ou alteração de movimento.
import React, { Suspense, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box3, Group } from 'three';
import type { AvatarId } from '../../../packages/shared-types/src/index';
import { AvatarPreview } from '../../../apps/web/src/avatars/AvatarPreview';
import { AvatarFigure } from '../../../apps/web/src/avatars/AvatarFigure';
import { characterFor, characterManifest } from '../../../apps/web/src/avatars/characterManifest';

const colors = ['#2e9e5b', '#f2c230', '#3d7dd8', '#e63946'];
function Figures({ avatarId, motion }: { avatarId: AvatarId; motion: 'idle' | 'walk' }) {
  const figures = useRef<Group>(null);
  useFrame(() => {
    if (!figures.current) return;
    const instances = figures.current.children.map(group => {
      const bounds = new Box3().setFromObject(group);
      const meshes: { name: string; triangles: number }[] = [];
      group.traverse((node: any) => {
        if (node.isMesh && node.name) meshes.push({ name: node.name, triangles: (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3 });
      });
      return { minY: bounds.min.y, height: bounds.max.y - bounds.min.y, meshes };
    });
    (window as any).manifestQA = { avatarId, modelId: characterFor(avatarId).id, motion, instances, loaded: instances.length === 4 && instances.every(i => i.meshes.length > 0) };
  });
  return <group ref={figures}>{colors.map((color, index) => <group key={index} position={[(index - 1.5) * 1.05, .1, 0]}><AvatarFigure avatarId={avatarId} color={color} motion={motion} /></group>)}</group>;
}

function App() {
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-3');
  const [motion, setMotion] = useState<'idle' | 'walk'>('idle');
  const asset = characterFor(avatarId);
  return <main><h1>Império Urbano · personagem no manifesto</h1><p>Conferência local com o carregador e a prévia de seleção do jogo.</p><div className="layout"><section className="panel"><h2>Seleção do personagem</h2><label>Avatar <select aria-label="Avatar" value={avatarId} onChange={e => setAvatarId(e.target.value as AvatarId)}>{characterManifest.characters.filter(c => c.avatarId).map(c => <option key={c.id} value={c.avatarId!}>{c.avatarId === 'avatar-3' ? 'Luana · Meshy' : c.avatarId}</option>)}</select></label><div className="previewSlot"><AvatarPreview avatarId={avatarId} color="#a86fe5" label={avatarId === 'avatar-3' ? 'Luana' : avatarId} /></div><p>{asset.id}</p><div className="buttons"><button aria-pressed={motion === 'idle'} onClick={() => setMotion('idle')}>Parado</button><button aria-pressed={motion === 'walk'} onClick={() => setMotion('walk')}>Solicitar caminhada</button></div><p><small>O GLB Meshy é estático: pedidos de animação não alteram sua pose.</small></p></section><section className="panel"><h2>Quatro cópias · bases independentes</h2><div className="board"><Canvas camera={{ position: [1.4, 2, 4.5], fov: 44 }} dpr={[1, 2]}><ambientLight intensity={1.1} /><directionalLight position={[2, 3, 2]} intensity={1.6} /><Suspense fallback={null}><Figures avatarId={avatarId} motion={motion} /></Suspense>{colors.map((_, index) => <mesh key={index} position={[(index - 1.5) * 1.05, 0, 0]}><boxGeometry args={[1, .2, 1]} /><meshStandardMaterial color="#3e4460" /></mesh>)}</Canvas></div><p>Altura, orientação e pivô vêm do manifesto. Esta cena não simula uma partida nem mede desempenho móvel.</p></section></div></main>;
}
createRoot(document.getElementById('root')!).render(<App />);
