import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const validator = require('../../assets/3d/staging/tooling/node_modules/gltf-validator');
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Uso: validate-khronos.mjs <arquivo.glb> <relatorio.json>');
const report = await validator.validateBytes(new Uint8Array(await readFile(input)), { maxIssues: 100 });
await writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ validatorVersion: report.validatorVersion, issues: report.issues }));
if (report.issues.numErrors) process.exitCode = 1;
