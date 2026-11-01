// Teste que lê arquivos do disco (roda no Node pelo Vitest; fora da checagem de tipos do navegador).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { type CharacterManifest, characterFor, characterManifest, manifestProblems } from './characterManifest';
import { normalizePlacement } from './normalize';

const publicDir = fileURLToPath(new URL('../../public', import.meta.url));
/** Orçamento de personagem combinado com a arte 3D (docs/07-meshy-pipeline.md). */
const MAX_BYTES = 3 * 1024 * 1024;

describe('manifesto de personagens', () => {
  it('é válido e cobre os cinco avatares', () => {
    expect(manifestProblems(characterManifest)).toEqual([]);
    expect(characterFor('avatar-3').avatarId).toBe('avatar-3');
  });

  it('aponta para GLBs que existem, são glTF binário e cabem no orçamento', () => {
    for (const c of characterManifest.characters) {
      const path = `${publicDir}${c.file}`;
      expect(existsSync(path), `${c.id}: ${c.file} não existe`).toBe(true);
      expect(statSync(path).size, `${c.id}: acima de 3 MiB`).toBeLessThanOrEqual(MAX_BYTES);
      if (c.file.endsWith('.glb')) expect(readFileSync(path).subarray(0, 4).toString('latin1')).toBe('glTF');
    }
  });

  it('acusa erros de contrato', () => {
    const base = characterManifest.characters[0];
    const broken: CharacterManifest = {
      schemaVersion: 1,
      fallback: 'nao-existe',
      characters: [
        { ...base, id: 'a', file: 'modelo.fbx', height: 0 },
        { ...base, id: 'a', offset: [0, 0] as unknown as [number, number, number] },
      ],
    };
    const problems = manifestProblems(broken).join('\n');
    expect(problems).toMatch(/id vazio ou repetido/);
    expect(problems).toMatch(/\.glb\/\.gltf/);
    expect(problems).toMatch(/altura/);
    expect(problems).toMatch(/usado por mais de um/);
    expect(problems).toMatch(/offset/);
    expect(problems).toMatch(/avatar-2 sem personagem/);
    expect(problems).toMatch(/fallback/);
  });
});

describe('normalização do modelo', () => {
  it('escala para a altura pedida, centraliza e apoia os pés no chão', () => {
    // Modelo de 2 de altura, pés em y = -0,5 e deslocado em x/z (pivô fora do lugar).
    const placement = normalizePlacement({ min: [1, -0.5, -3], max: [3, 1.5, -1] }, 0.8);
    expect(placement.scale).toBeCloseTo(0.4);
    const [x, y, z] = placement.position;
    // Centro (2, -2) e pé (-0,5) depois da escala voltam para a origem.
    expect(2 * placement.scale + x).toBeCloseTo(0);
    expect(-0.5 * placement.scale + y).toBeCloseTo(0);
    expect(-2 * placement.scale + z).toBeCloseTo(0);
  });

  it('aplica o ajuste fino do manifesto e recusa caixa vazia', () => {
    const placement = normalizePlacement({ min: [0, 0, 0], max: [0, 1, 0] }, 1, [0.1, 0.02, -0.1]);
    expect(placement.position).toEqual([0.1, 0.02, -0.1]);
    expect(() => normalizePlacement({ min: [0, 0, 0], max: [0, 0, 0] }, 1)).toThrow();
  });
});
