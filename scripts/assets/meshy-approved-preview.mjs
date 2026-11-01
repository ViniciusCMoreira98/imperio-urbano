// Uma geração aprovada, registrada antes da chamada para impedir cobrança duplicada.
// Cliente MCP separado: usa o servidor instalado e respeita a allowlist local atual.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url));
const integration = resolve(homedir(), '.codex/integrations/meshy');
const sdk = resolve(integration, 'node_modules/@modelcontextprotocol/sdk/dist/esm');
const { Client } = await import(pathToFileURL(resolve(sdk, 'client/index.js')));
const { StdioClientTransport } = await import(pathToFileURL(resolve(sdk, 'client/stdio.js')));
const config = await readFile(resolve(homedir(), '.codex/config.toml'), 'utf8');
const block = config.match(/^\[mcp_servers\.meshy\][\s\S]*?(?=^\[|(?![\s\S]))/m)?.[0] ?? '';
const allowlist = block.match(/^enabled_tools\s*=\s*\[([^\r\n]*)\]/m)?.[1] ?? '';
const enabled = tool => [...allowlist.matchAll(/['"]([^'"]+)['"]/g)].some(m => m[1] === tool);
const command = process.argv[2];
const refine = command === 'create-refine' || command === 'refine-status';
const statePath = resolve(root, `assets/3d/staging/steampunk-brasil-v01-${refine ? 'refine-task' : 'task'}.json`);
const requestPath = resolve(root, `assets/3d/requests/steampunk-brasil-v01-${refine ? 'refine' : 'preview'}.json`);
if (!['create-preview', 'create-refine', 'refine-status', 'status', 'balance'].includes(command)) throw new Error('Comando não suportado');
const taskTool = command === 'create-refine' ? 'meshy_text_to_3d_refine' : command === 'create-preview' ? 'meshy_text_to_3d' : command === 'balance' ? 'meshy_check_balance' : 'meshy_get_task_status';
if (!enabled(taskTool)) throw new Error('Ferramenta não habilitada na configuração Meshy');
const credentialsFile = process.env.MESHY_ENV_FILE ?? resolve(root, '../../variable.env');
try { await access(credentialsFile); }
catch { console.error('Arquivo local de credenciais Meshy não encontrado. Restaurar o arquivo ou informar novo caminho; nenhuma tarefa enviada.'); process.exit(1); }
const transport = new StdioClientTransport({
  command: 'C:/Program Files/nodejs/node.exe',
  args: [`--env-file=${credentialsFile}`, resolve(integration, 'node_modules/@meshy-ai/meshy-mcp-server/dist/index.js')],
  cwd: integration,
  stderr: 'pipe',
});
const client = new Client({ name: 'imperio-approved-preview', version: '1.0.0' });
const parse = result => result.structuredContent ?? JSON.parse(result.content.find(c => c.type === 'text').text);
let state;
try {
  await client.connect(transport);
  if (command === 'balance') {
    const result = await client.callTool({ name: taskTool, arguments: { response_format: 'json' } });
    if (result.isError) throw new Error('Falha de autenticação ou consulta');
    console.log(JSON.stringify({ restoredCredentialsValid: true, balance: parse(result).balance }));
  } else if (command === 'create-preview' || command === 'create-refine') {
    const params = JSON.parse(await readFile(requestPath, 'utf8'));
    if (!refine && (params.ai_model !== 'meshy-7.1' || params.geometry_resolution !== 'standard' || params.target_formats.join(',') !== 'glb')) throw new Error('Pedido fora do plano aprovado');
    if (refine && (params.preview_task_id !== '01a1951d-cac3-724c-b2a6-5cfdc969d18f' || params.ai_model !== undefined || params.texture_resolution !== '4k' || params.enable_pbr !== false || params.target_formats.join(',') !== 'glb')) throw new Error('Textura fora do plano aprovado');
    const balanceResult = await client.callTool({ name: 'meshy_check_balance', arguments: { response_format: 'json' } });
    const balance = parse(balanceResult);
    const expectedCredits = refine ? 10 : 20;
    if (balance.balance < (refine ? 10 : 35)) throw new Error('Saldo insuficiente');
    state = { stage: 'SUBMITTING_DO_NOT_RETRY', approvedBudget: 35, expectedCredits, previouslySpent: refine ? 20 : 0, rigApproved: false, balanceBefore: balance.balance, requestSha256: createHash('sha256').update(JSON.stringify(params)).digest('hex'), submittedAt: new Date().toISOString() };
    await mkdir(resolve(root, 'assets/3d/staging'), { recursive: true });
    await writeFile(statePath, JSON.stringify(state, null, 2), { flag: 'wx' });
    const result = await client.callTool({ name: taskTool, arguments: params }, undefined, { timeout: 60000 });
    if (result.isError) { state.stage = 'ERROR_CHECK_TASK_LIST_BEFORE_RETRY'; await writeFile(statePath, JSON.stringify(state, null, 2)); console.error('Meshy não confirmou a criação. Consultar tarefas antes de nova tentativa.'); process.exitCode = 1; }
    else {
      const data = parse(result);
      state = { ...state, stage: 'CREATED', taskId: data.task_id, initialStatus: data.status };
      await writeFile(statePath, JSON.stringify(state, null, 2));
      console.log(JSON.stringify({ taskId: state.taskId, status: data.status, balanceBefore: state.balanceBefore, expectedCredits }));
    }
  } else {
    state = JSON.parse(await readFile(statePath, 'utf8'));
    if (!state.taskId) throw new Error('Criação não confirmada; consultar tarefas, sem recriar');
    const result = await client.callTool({ name: taskTool, arguments: { task_id: state.taskId, task_type: 'text-to-3d', wait: false, response_format: 'json' } });
    if (result.isError) throw new Error('Falha na consulta');
    const data = parse(result);
    await writeFile(resolve(root, `assets/3d/staging/steampunk-brasil-v01-${refine ? 'refine-status' : 'status'}.json`), JSON.stringify(data, null, 2));
    console.log(JSON.stringify({ taskId: data.task_id, status: data.status, progress: data.progress, credits: data.consumed_credits, formats: Object.keys(data.model_urls ?? {}) }));
  }
} catch {
  console.error('Operação interrompida. Consulte o registro local e as tarefas existentes; não repetir geração automaticamente.');
  process.exitCode = 1;
} finally { await client.close(); }
