import { describe, expect, it } from 'vitest';
import type { GameSnapshot, PlayerState } from '@imperio/shared-types';
import { describeEvent } from '../game/presentation';
import { canUseRestPass } from './ItemTray';

const player = (extra: Partial<PlayerState> = {}): PlayerState => ({
  id: 'ana',
  nickname: 'Ana',
  avatarId: 'avatar-1',
  pawnColor: 'VERDE',
  seat: 0,
  credits: 1500,
  position: 17,
  ready: true,
  connected: true,
  bankrupt: false,
  skipTurns: 1,
  travelPending: false,
  restPasses: 1,
  rentWaivers: 0,
  ...extra,
});

const snapshot = (extra: Partial<GameSnapshot> = {}, me: Partial<PlayerState> = {}): GameSnapshot =>
  ({
    status: 'IN_PROGRESS',
    version: 3,
    currentPlayerId: 'ana',
    phase: 'AWAITING_ROLL',
    players: [player(me)],
    ...extra,
  }) as GameSnapshot;

describe('Passe Livre', () => {
  it('só pode ser usado na própria vez, no Descanso e antes de rolar', () => {
    expect(canUseRestPass(snapshot(), 'ana')).toBe(true);
    expect(canUseRestPass(snapshot({ currentPlayerId: 'bia' }), 'ana')).toBe(false);
    expect(canUseRestPass(snapshot({ phase: 'AWAITING_END_TURN' }), 'ana')).toBe(false);
    expect(canUseRestPass(snapshot({}, { skipTurns: 0 }), 'ana')).toBe(false);
    expect(canUseRestPass(snapshot({}, { restPasses: 0 }), 'ana')).toBe(false);
  });
});

describe('histórico das cartas guardáveis', () => {
  const name = (id: string) => ({ ana: 'Ana', bia: 'Bia' })[id] ?? id;

  it('descreve ganho e uso dos itens', () => {
    expect(describeEvent({ type: 'REST_PASS_GRANTED', playerId: 'ana' }, name)).toBe('Ana guardou um Passe Livre.');
    expect(describeEvent({ type: 'REST_PASS_USED', playerId: 'ana' }, name)).toBe('Ana usou o Passe Livre e saiu do Descanso.');
    expect(describeEvent({ type: 'RENT_WAIVER_GRANTED', playerId: 'ana' }, name)).toBe('Ana guardou um Aluguel Zero.');
    expect(describeEvent({ type: 'RENT_WAIVED', playerId: 'ana', ownerId: 'bia', stateId: 'AP', amount: 10 }, name))
      .toBe('Ana usou o Aluguel Zero e não pagou R$ 10 a Bia em Amapá.');
  });
});
