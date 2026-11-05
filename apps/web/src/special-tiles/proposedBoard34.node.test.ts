import{describe,it,expect}from'vitest';import proposal from'./proposedBoard34.json';import current from'../board/reference33/layout.json';
describe('proposta visual de RN e Saque',()=>{
 it('preserva Início e coloca RN imediatamente antes de Amazonas',()=>{expect(proposal.tiles.slice(0,3).map(t=>t.id)).toEqual(['START','RN','AM']);expect(proposal.tiles.filter(t=>t.id==='RN')).toHaveLength(1);});
 it('coloca Saque entre AL e CE no antigo trecho de RN',()=>{const n=proposal.tiles.findIndex(t=>t.id==='SAQUE');expect(proposal.tiles.slice(n-1,n+2).map(t=>t.id)).toEqual(['AL','SAQUE','CE']);expect(proposal.tiles[n].role).toBe('special');});
 it('propõe 34 casas sem remover estados, duplicar casas ou mudar o catálogo atual',()=>{expect(proposal.tiles).toHaveLength(34);expect(new Set(proposal.tiles.map(t=>t.id)).size).toBe(34);expect(proposal.tiles.map(t=>t.id).sort()).toEqual([...current.tiles.map(t=>t.id),'SAQUE'].sort());expect(proposal.tiles.filter(t=>t.role==='property')).toHaveLength(26);expect(current.tiles).toHaveLength(33);expect(proposal.productionCatalogChanged).toBe(false);});
});
