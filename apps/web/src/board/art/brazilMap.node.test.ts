import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { states } from '@imperio/game-data';
import map from './brazilMap.json';

describe('Contornos locais do mapa decorativo', () => {
  it('inclui cada UF do catálogo exatamente uma vez, inclusive o DF', () => {
    // O mapa decorativo é geográfico: inclui Tocantins, que não está no percurso de 33 casas.
    expect(map.states.map(s => s.id).sort()).toEqual([...states.map(s => s.id), 'TO'].sort());
    for (const state of map.states) for (const polygon of state.polygons) for (const ring of polygon) {
      expect(ring.length).toBeGreaterThanOrEqual(4);
      expect(ring[0]).toEqual(ring.at(-1));
      for (const [x,y] of ring) { expect(Number.isFinite(x) && x >= 0 && x <= map.width).toBe(true); expect(Number.isFinite(y) && y >= 0 && y <= map.height).toBe(true); }
    }
  });
  it('rastreia o arquivo original do IBGE usado na geração', () => {
    const raw = readFileSync(new URL('../../../../../assets/board/sources/brazil-uf-ibge.geojson',import.meta.url));
    expect(createHash('sha256').update(raw).digest('hex')).toBe(map.sourceSha256);
  });
});
