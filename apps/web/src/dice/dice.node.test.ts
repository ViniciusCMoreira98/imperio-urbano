import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import asset from './diceAsset.json';
import { diceFaceRotation, type DiceFace } from './diceOrientation';

const path = new URL('../../public' + asset.file, import.meta.url);
const bytes = readFileSync(path);
const jsonLength = bytes.readUInt32LE(12);
const doc = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
const binary = bytes.subarray(28 + jsonLength);
function readAccessor(index: number): number[][] {
  const accessor = doc.accessors[index], view = doc.bufferViews[accessor.bufferView];
  const components = accessor.type === 'SCALAR' ? 1 : 3;
  const componentBytes = accessor.componentType === 5123 ? 2 : accessor.componentType === 5121 ? 1 : 4;
  const result: number[][] = [];
  for (let item = 0; item < accessor.count; item++) {
    const row: number[] = [];
    for (let c = 0; c < components; c++) {
      const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0) + item * (view.byteStride ?? components * componentBytes) + c * componentBytes;
      row.push(accessor.componentType === 5126 ? binary.readFloatLE(offset) : accessor.componentType === 5123 ? binary.readUInt16LE(offset) : accessor.componentType === 5121 ? binary.readUInt8(offset) : binary.readUInt32LE(offset));
    }
    result.push(row);
  }
  return result;
}

describe('asset dos dados 3D', () => {
  it('é um GLB leve, autocontido e com duas superfícies de material', () => {
    expect(bytes.subarray(0, 4).toString()).toBe('glTF');
    expect(doc.asset.version).toBe('2.0');
    expect(statSync(path).size).toBeLessThanOrEqual(128 * 1024);
    expect(doc.materials).toHaveLength(2);
    expect(doc.images ?? []).toHaveLength(0);
    expect(doc.cameras ?? []).toHaveLength(0);
    expect(doc.animations ?? []).toHaveLength(0);
    expect(doc.buffers.every((b: { uri?: string }) => !b.uri)).toBe(true);
    const triangles = doc.meshes.flatMap((m: { primitives: { indices: number }[] }) => m.primitives).reduce((sum: number, p: { indices: number }) => sum + doc.accessors[p.indices].count / 3, 0);
    expect(triangles).toBeLessThanOrEqual(3000);
  });

  it('tem fisicamente 21 pontos, com 1 a 6 nas faces declaradas', () => {
    const pipNode = doc.nodes.find((n: { name: string }) => n.name === 'DicePips');
    const primitive = doc.meshes[pipNode.mesh].primitives[0];
    const positions = readAccessor(primitive.attributes.POSITION);
    const indices = readAccessor(primitive.indices).flat();
    const parent = positions.map((_, i) => i);
    function find(i: number): number { return parent[i] === i ? i : parent[i] = find(parent[i]); }
    for (let i = 0; i < indices.length; i += 3) {
      parent[find(indices[i + 1])] = find(indices[i]);
      parent[find(indices[i + 2])] = find(indices[i]);
    }
    const groups = new Map<number, number[][]>();
    positions.forEach((point, index) => { const root = find(index); if (!groups.has(root)) groups.set(root, []); groups.get(root)!.push(point); });
    expect(groups.size).toBe(21);
    const counts: Record<string, number> = {};
    for (const points of groups.values()) {
      const center = new Vector3(...points.reduce((sum, p) => sum.map((v, i) => v + p[i] / points.length), [0, 0, 0]) as [number, number, number]);
      const axis = [Math.abs(center.x), Math.abs(center.y), Math.abs(center.z)].indexOf(Math.max(Math.abs(center.x), Math.abs(center.y), Math.abs(center.z)));
      const face = Object.entries(asset.faceNormals).find(([, normal]) => normal[axis] * center.getComponent(axis) > .48)?.[0];
      expect(face).toBeDefined();
      counts[face!] = (counts[face!] ?? 0) + 1;
    }
    for (const face of [1, 2, 3, 4, 5, 6]) expect(counts[String(face)]).toBe(face);
  });

  it('coloca qualquer face física para cima e mantém opostas somando sete', () => {
    for (const face of [1, 2, 3, 4, 5, 6] as DiceFace[]) {
      const normal = asset.faceNormals[String(face) as keyof typeof asset.faceNormals];
      const rotated = new Vector3(...normal as [number, number, number]).applyEuler(new Euler(...diceFaceRotation(face)));
      expect(rotated.distanceTo(new Vector3(0, 1, 0))).toBeLessThan(1e-6);
    }
    for (const [a, b] of asset.oppositePairs) expect(a + b).toBe(7);
    for (const invalid of [0, 7, 1.5, NaN]) expect(() => diceFaceRotation(invalid as DiceFace)).toThrow();
  });
});
