import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectGlb } from './glb.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const assetRoot = resolve(root, 'assets/3d');
const catalog = JSON.parse(await readFile(resolve(assetRoot, 'catalog.json'), 'utf8'));
const budgets = JSON.parse(await readFile(resolve(assetRoot, 'budgets.json'), 'utf8'));
const [command, id, input] = process.argv.slice(2);
const maxDownload = 100 * 1024 * 1024;

export function safeDownloadUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'assets.meshy.ai' || url.port || url.username || url.password) throw new Error('URL deve usar HTTPS em assets.meshy.ai');
  return url;
}

async function download() {
  // URL assinada temporária em variável de ambiente; nunca chave/API nem logs.
  const url = safeDownloadUrl(process.env.MESHY_ASSET_URL ?? '');
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(60000) });
  if (!response.ok || !response.body) throw new Error('Download não concluído');
  const parts = [];
  let length = 0;
  for await (const part of response.body) {
    length += part.length;
    if (length > maxDownload) { await response.body.cancel().catch(() => {}); throw new Error('Arquivo excede 100 MiB'); }
    parts.push(part);
  }
  return Buffer.concat(parts);
}

async function saveNew(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  // Também recusa diretórios redirecionados por junction/symlink.
  const dir = await realpath(dirname(path));
  const allowed = relative(await realpath(assetRoot), dir);
  if (allowed.startsWith('..') || isAbsolute(allowed)) throw new Error('Destino fora de assets/3d');
  await writeFile(path, bytes, { flag: 'wx' });
}

async function main() {
  if (command === 'catalog' && !id) {
    console.log(JSON.stringify(catalog, null, 2));
    return;
  }
  if (!['validate', 'import', 'download'].includes(command)) throw new Error('Uso: pipeline.mjs catalog | validate <id> <arquivo.glb> | import <id> <arquivo.glb> | download <id>');
  const model = catalog.models.find(m => m.id === id);
  if (!model || !/^[a-z0-9-]+$/.test(model.id) || !budgets[model.category]) throw new Error('Modelo/categoria ausente no catálogo');
  if (command !== 'download' && !input) throw new Error('Informe um arquivo GLB local');
  const bytes = command === 'download' ? await download() : await readFile(resolve(input));
  if (bytes.length > maxDownload) throw new Error('Arquivo excede 100 MiB');
  const report = inspectGlb(bytes, budgets[model.category]);
  const base = `${model.id}-${report.sha256.slice(0, 12)}`;
  // import/download preservam o original em quarentena mesmo se acima do orçamento.
  if (command !== 'validate') await saveNew(resolve(assetRoot, 'source', `${base}.glb`), bytes);
  await saveNew(resolve(assetRoot, 'reports', `${base}-${Date.now()}.json`), JSON.stringify({ ...report, modelId: model.id, taskId: model.taskId }, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (!report.screeningPassed) process.exitCode = 1;
}

// Não imprimir a exceção de fetch: pode conter URL assinada.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Pipeline interrompido. Confira comando, catálogo, GLB, destino livre e URL temporária; nenhum asset foi publicado.'); process.exitCode = 1; });
}
