import { createHash } from 'node:crypto';

// Triagem local, sem carregar código, buscar URIs ou aprovar publicação.
export function inspectGlb(bytes, budget) {
  const errors = [];
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  check(bytes.length >= 20, 'GLB truncado');
  check(bytes.readUInt32LE(0) === 0x46546c67, 'Assinatura GLB inválida');
  check(bytes.readUInt32LE(4) === 2, 'Exigido GLB versão 2');
  check(bytes.readUInt32LE(8) === bytes.length, 'Comprimento GLB divergente');
  let document;
  let binLength = 0;
  let chunks = 0;
  for (let offset = 12; offset < bytes.length;) {
    check(offset + 8 <= bytes.length, 'Cabeçalho de chunk truncado');
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    check(length % 4 === 0 && offset + 8 + length <= bytes.length, 'Chunk inválido');
    check(chunks !== 0 || type === 0x4e4f534a, 'Primeiro chunk deve ser JSON');
    if (type === 0x4e4f534a) {
      check(!document, 'JSON duplicado');
      document = JSON.parse(bytes.subarray(offset + 8, offset + 8 + length).toString('utf8'));
    } else if (type === 0x004e4942) {
      check(chunks === 1, 'Chunk BIN fora de ordem');
      binLength = length;
    } else check(false, 'Chunk não suportado nesta triagem');
    offset += 8 + length;
    chunks++;
  }
  check(document?.asset?.version === '2.0', 'Exigido glTF 2.0');
  check((document.buffers ?? []).every(b => !b.uri), 'Buffers externos não permitidos');
  check((document.images ?? []).every(i => !i.uri && Number.isInteger(i.bufferView)), 'Imagens devem estar embutidas');
  check((document.buffers ?? []).length === 1, 'Exigido um buffer embutido');
  const declaredLength = document.buffers[0].byteLength;
  check(Number.isInteger(declaredLength) && declaredLength > 0 && declaredLength <= binLength && binLength - declaredLength <= 3, 'Tamanho BIN inválido');
  for (const view of document.bufferViews ?? []) {
    check(view.buffer === 0 && Number.isInteger(view.byteLength) && view.byteLength > 0 && Number.isInteger(view.byteOffset ?? 0) && (view.byteOffset ?? 0) >= 0 && (view.byteOffset ?? 0) + view.byteLength <= declaredLength, 'bufferView fora do BIN');
  }
  // Extensões/compressão precisam passar pelo validador completo e pelo loader real.
  if ((document.extensionsRequired ?? []).length) errors.push('Extensões obrigatórias exigem validação com decoder no navegador');
  let triangles = 0;
  let primitives = 0;
  for (const mesh of document.meshes ?? []) for (const primitive of mesh.primitives ?? []) {
    primitives++;
    const position = document.accessors?.[primitive.attributes?.POSITION];
    check(position?.type === 'VEC3' && Number.isInteger(position.count) && position.count > 0, 'POSITION inválido');
    const accessor = primitive.indices === undefined ? position : document.accessors?.[primitive.indices];
    check(accessor && Number.isInteger(accessor.count) && accessor.count > 0, 'Contagem de geometria inválida');
    if ((primitive.mode ?? 4) !== 4) errors.push('Topologia deve ser TRIANGLES');
    else {
      check(accessor.count % 3 === 0, 'Contagem TRIANGLES inválida');
      triangles += accessor.count / 3;
    }
  }
  check(primitives > 0, 'Nenhuma geometria encontrada');
  const metrics = {
    bytes: bytes.length, triangles, meshPrimitives: primitives,
    materials: document.materials?.length ?? 0,
    textures: document.textures?.length ?? 0,
    images: document.images?.length ?? 0,
    skins: document.skins?.length ?? 0,
    animations: (document.animations ?? []).map((a, i) => a.name ?? `unnamed-${i}`),
  };
  for (const [metric, limit] of [['bytes', 'maxBytes'], ['triangles', 'maxTriangles'], ['materials', 'maxMaterials'], ['textures', 'maxTextures']]) {
    if (metrics[metric] > budget[limit]) errors.push(`${metric}: ${metrics[metric]} excede ${budget[limit]}`);
  }
  return {
    schemaVersion: 1,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    screeningPassed: errors.length === 0,
    approvedForRuntime: false,
    metrics, errors,
    pendingChecks: ['Khronos glTF Validator sem erros', `Texturas até ${budget.maxTextureSize}px e memória GPU`, 'Geometria em instâncias, escala, pivô e orientação', 'Licença e revisão artística', 'Rig e clips idle/walk/celebrate/defeat', 'Carga no navegador e desempenho mobile'],
  };
}
