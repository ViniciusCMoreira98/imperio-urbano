import {describe,expect,it} from 'vitest';
import type {GameSnapshot,PlayerState} from '@imperio/shared-types';
import {board} from '@imperio/game-data';
import {shouldOfferRestChoice} from '../game/restChoice';
const rest=board.tiles.find(t=>t.type==='REST')!.index;
const fixture=(changes:Partial<GameSnapshot>={},player:Partial<PlayerState>={})=>({status:'IN_PROGRESS',currentPlayerId:'ana',phase:'AWAITING_ROLL',players:[{id:'ana',position:rest,skipTurns:2,restPasses:1,bankrupt:false,...player}],...changes}) as GameSnapshot;
describe('escolha da vez no Descanso',()=>{
 it('oferece as duas opções na própria vez, inclusive sem Passe Livre',()=>{
  expect(shouldOfferRestChoice(fixture(),'ana')).toBe(true);
  expect(shouldOfferRestChoice(fixture({}, {restPasses:0}),'ana')).toBe(true);
 });
 it('não antecipa outra vez/fase nem aparece só por visitar a casa',()=>{
  expect(shouldOfferRestChoice(null,'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture({currentPlayerId:'bia'}),'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture({phase:'AWAITING_END_TURN'}),'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture({}, {skipTurns:0}),'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture({}, {position:0}),'ana')).toBe(false);
 });
 it('não oferece ações fora da partida ou a jogador falido/ausente',()=>{
  expect(shouldOfferRestChoice(fixture({status:'FINISHED'}),'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture({}, {bankrupt:true}),'ana')).toBe(false);
  expect(shouldOfferRestChoice(fixture(),'bia')).toBe(false);
 });
});
