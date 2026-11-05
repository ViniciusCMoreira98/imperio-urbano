import{describe,it,expect}from'vitest';
import legacy from'./reference33/layout.json';import modern from'./board34/layout.json';
import{boardVisualManifest,isBoard34}from'./boardVisualManifest';
const catalog=(layout:typeof legacy|typeof modern)=>layout.tiles.map(t=>({id:t.id,index:t.index,type:t.type==='AIRPORT'?'NATIONAL_TRAVEL':t.type,stateId:t.stateId}));
describe('ativação do cenário pelo contrato do catálogo',()=>{
 it('mantém o cenário de 33 casas para a partida atual',()=>{expect(boardVisualManifest(catalog(legacy))).toBe(legacy);expect(isBoard34(catalog(legacy))).toBe(false);});
 it('ativa geometria e âncoras de 34 somente com sequência e índices correspondentes',()=>{expect(boardVisualManifest(catalog(modern))).toBe(modern);expect(isBoard34(catalog(modern))).toBe(true);});
 it('recusa misturar o catálogo antigo com a contagem ou ordem novos',()=>{const wrong=catalog(modern);[wrong[1],wrong[2]]=[wrong[2],wrong[1]];expect(()=>boardVisualManifest(wrong)).toThrow();const wrongType=catalog(modern);wrongType.find(t=>t.id==='TAX')!.type='EVENT';expect(()=>boardVisualManifest(wrongType)).toThrow();expect(()=>boardVisualManifest(catalog(legacy).concat({id:'SAQUE',index:33,type:'SAQUE',stateId:null}))).toThrow();});
});
