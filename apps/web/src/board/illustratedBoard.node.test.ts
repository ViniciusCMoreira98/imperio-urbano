import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { board,states } from '@imperio/game-data';
import { CENTER_ART,STATE_ART,SPECIAL_ART,projectArtwork } from './illustratedBoard';
import metadata from '../../../../assets/board/tabuleiro-brasil-alvo.json';

describe('Arte original aplicada ao tabuleiro aprovado',()=>{
  it('preserva os pixels da imagem recebida',()=>{
    const bytes=readFileSync(new URL('../../../../assets/board/tabuleiro-brasil-alvo.png',import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(metadata.sha256);
    expect(bytes.readUInt32BE(16)).toBe(1536);expect(bytes.readUInt32BE(20)).toBe(1024);
  });
  it('cobre as 27 UFs e as casas do percurso; a Taxa usa o desenho reserva até a integração do atlas',()=>{
    expect(Object.keys(STATE_ART).sort()).toEqual(states.map(s=>s.id).sort());
    expect(board.tiles).toHaveLength(36);
    for(const tile of board.tiles.filter(t=>t.type!=='TAX'))expect(tile.stateId?STATE_ART[tile.stateId]:SPECIAL_ART[tile.type]).toBeDefined();
    expect(SPECIAL_ART.TAX).toBeUndefined();
  });
  it('retifica as janelas sem inverter cantos nem sair da imagem',()=>{
    for(const quad of [CENTER_ART,...Object.values(STATE_ART),...Object.values(SPECIAL_ART)]){
      [[0,0],[1,0],[1,1],[0,1]].forEach(([u,v],i)=>{const [x,y]=projectArtwork(quad,u,v);expect(x).toBeCloseTo(quad[i][0]);expect(y).toBeCloseTo(quad[i][1]);});
      for(let u=0;u<=1;u+=.25)for(let v=0;v<=1;v+=.25){const [x,y]=projectArtwork(quad,u,v);expect(Number.isFinite(x)&&x>=0&&x<=1536&&Number.isFinite(y)&&y>=0&&y<=1024).toBe(true);}
    }
  });
});
