import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectGlb } from './glb.mjs';
import { safeDownloadUrl } from './pipeline.mjs';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const budget = { maxBytes: 4096, maxTriangles: 12, maxMaterials: 2, maxTextures: 4, maxTextureSize: 1024 };
function fixture(change = () => {}) {
  const doc = { asset: { version: '2.0' }, buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteLength: 36 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], nodes: [{ mesh: 0 }], scenes: [{ nodes: [0] }], scene: 0 };
  change(doc);
  const json = Buffer.from(JSON.stringify(doc));
  const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
  json.copy(padded);
  const bytes = Buffer.alloc(12 + 8 + padded.length + 8 + 36);
  bytes.writeUInt32LE(0x46546c67, 0); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(bytes.length, 8);
  bytes.writeUInt32LE(padded.length, 12); bytes.writeUInt32LE(0x4e4f534a, 16); padded.copy(bytes, 20);
  bytes.writeUInt32LE(36, 20 + padded.length); bytes.writeUInt32LE(0x004e4942, 24 + padded.length);
  return bytes;
}
test('inspeciona GLB e nunca aprova runtime automaticamente', () => {
  const result = inspectGlb(fixture(), budget);
  assert.equal(result.screeningPassed, true);
  assert.equal(result.approvedForRuntime, false);
  assert.equal(result.metrics.triangles, 1);
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
});
test('recusa truncamento, assinatura e chunks inválidos', () => {
  const bytes = fixture();
  assert.throws(() => inspectGlb(bytes.subarray(0, -1), budget));
  bytes.writeUInt32LE(0, 0);
  assert.throws(() => inspectGlb(bytes, budget));
  const chunks = fixture(); chunks.writeUInt32LE(0xffffffff, 12);
  assert.throws(() => inspectGlb(chunks, budget));
});
test('recusa recursos externos e views fora do buffer', () => {
  assert.throws(() => inspectGlb(fixture(d => { d.buffers[0].uri = 'https://example.com'; }), budget));
  assert.throws(() => inspectGlb(fixture(d => { d.images = [{ uri: '../private.png' }]; }), budget));
  assert.throws(() => inspectGlb(fixture(d => { d.bufferViews[0].byteLength = 999; }), budget));
});
test('orçamento e extensões exigem revisão', () => {
  assert.equal(inspectGlb(fixture(), { ...budget, maxTriangles: 0 }).screeningPassed, false);
  assert.equal(inspectGlb(fixture(d => { d.extensionsRequired = ['KHR_draco_mesh_compression']; }), budget).screeningPassed, false);
});
test('download aceita somente o CDN HTTPS sem credenciais ou portas', () => {
  assert.equal(safeDownloadUrl('https://assets.meshy.ai/test.glb?Signature=temporary').hostname, 'assets.meshy.ai');
  for (const value of ['http://assets.meshy.ai/test', 'https://assets.meshy.ai.evil.test/test', 'https://localhost/test', 'https://user:secret@assets.meshy.ai/test', 'https://assets.meshy.ai:444/test']) assert.throws(() => safeDownloadUrl(value));
});
test('asset Kenney atual exige textura externa e não passa no perfil autocontido', () => {
  const bytes = readFileSync(new URL('../../apps/web/public/models/characters/character-male-a.glb', import.meta.url));
  assert.throws(() => inspectGlb(bytes, budget), /Imagens devem estar embutidas/);
});
test('CLI lista catálogo e recusa ID inválido sem rede', () => {
  const cli = fileURLToPath(new URL('./pipeline.mjs', import.meta.url));
  const listed = spawnSync(process.execPath, [cli, 'catalog'], { encoding: 'utf8' });
  assert.equal(listed.status, 0, listed.stderr);
  assert.equal(JSON.parse(listed.stdout).models.length, 4);
  const rejected = spawnSync(process.execPath, [cli, 'download', '../invalid'], { encoding: 'utf8' });
  assert.equal(rejected.status, 1);
  assert.equal(rejected.stdout, '');
});
