import { describe, expect, it } from 'vitest';
import { board, rules, states } from '@imperio/game-data';
import type { DomainEvent, GameSnapshot } from '@imperio/shared-types';
import { tableNotices } from './tableNotices';

const name = (id: string) => ({ ana: 'Ana', bia: 'Bia', caio: 'Caio' })[id] ?? 'Alguém';
const tileOf = (id: string) => board.tiles.find((t) => t.stateId === id)!.index;
const olympicsTile = board.tiles.find((t) => t.type === 'OLYMPICS')!.index;
const se = states.find((s) => s.id === 'SE')!;

const snap = (over: Partial<GameSnapshot> = {}, ana: Record<string, unknown> = {}) =>
  ({
    status: 'IN_PROGRESS',
    phase: 'AWAITING_END_TURN',
    currentPlayerId: 'ana',
    players: [
      { id: 'ana', nickname: 'Ana', credits: 100, bankrupt: false, travelPending: false, ...ana },
      { id: 'bia', nickname: 'Bia', credits: 2500, bankrupt: false, travelPending: false },
    ],
    properties: [],
    olympics: { hostStateId: null, multiplier: 1, edition: 1 },
    ...over,
  }) as unknown as GameSnapshot;

const moved = (to: number, playerId = 'ana', sentToRest = false) =>
  ({ type: 'PLAYER_MOVED', playerId, from: 0, to, startBonus: 0, sentToRest }) as DomainEvent;
const rolled = (first: number, second: number, playerId = 'ana') => ({ type: 'DICE_ROLLED', playerId, dice: { first, second } }) as DomainEvent;

describe('avisos da mesa', () => {
  it('Aluguel Zero fala com quem usou, com o dono e com os outros', () => {
    const waived = [{ type: 'RENT_WAIVED', playerId: 'ana', ownerId: 'bia', stateId: 'SE', amount: 910 } as DomainEvent];
    const s = snap({}, { credits: 5000 });
    expect(tableNotices(waived, 10, s, 'ana', name)[0]).toMatchObject({ id: 10, kind: 'rentWaiver', text: 'Você usou o Aluguel Zero e não pagou R$ 910 em Sergipe.' });
    expect(tableNotices(waived, 10, s, 'bia', name)[0].text).toBe('Ana usou o Aluguel Zero e não pagou seus R$ 910 em Sergipe.');
    expect(tableNotices(waived, 10, s, 'caio', name)[0].text).toBe('Ana usou o Aluguel Zero e não pagou R$ 910 a Bia em Sergipe.');
  });

  it('avisa quando falta saldo para comprar o estado livre onde parou', () => {
    const [notice] = tableNotices([rolled(1, 2), moved(tileOf('SE'))], 1, snap(), 'ana', name);
    expect(notice).toMatchObject({ kind: 'noFunds', title: 'Sem saldo para comprar', after: 'table' });
    expect(notice.text).toBe(`Sergipe custa R$ ${se.price} e você tem R$ 100.`);
    // Com saldo, a compra é oferecida: nada a avisar. Para outro jogador também não.
    expect(tableNotices([moved(tileOf('SE'))], 1, snap({ phase: 'AWAITING_PURCHASE' }, { credits: 5000 }), 'ana', name)).toEqual([]);
    expect(tableNotices([moved(tileOf('SE'))], 1, snap(), 'bia', name)).toEqual([]);
  });

  it('avisa quando falta saldo para construir no próprio estado', () => {
    const owned = snap({ properties: [{ stateId: 'SE', ownerId: 'ana', buildingLevel: 0, levelReachedAtVisit: 1, ownerVisits: 2 }] as never }, { credits: 10 });
    expect(tableNotices([moved(tileOf('SE'))], 1, owned, 'ana', name)[0]).toMatchObject({ title: 'Sem saldo para construir' });
  });

  it('avisa quando falta saldo para sediar as Olimpíadas e para a Viagem Nacional', () => {
    const owner = snap({ properties: [{ stateId: 'RN', ownerId: 'ana', buildingLevel: 0 }] as never }, { credits: rules.olympics.hostFee - 1 });
    expect(tableNotices([moved(olympicsTile)], 1, owner, 'ana', name)[0].title).toBe('Sem saldo para sediar');
    const travel = snap({}, { credits: 10, travelPending: true });
    const ended = { type: 'TURN_ENDED', playerId: 'bia', nextPlayerId: 'ana', round: 3 } as DomainEvent;
    expect(tableNotices([ended], 1, travel, 'ana', name)[0].title).toBe('Sem saldo para viajar');
  });

  it('dados iguais: joga de novo, sai do Descanso ou vai para ele', () => {
    const s = snap({}, { credits: 5000 });
    expect(tableNotices([rolled(3, 3), moved(10)], 1, s, 'ana', name)[0]).toMatchObject({ kind: 'doubles', after: 'dice', text: 'Você joga de novo.' });
    expect(tableNotices([rolled(2, 2, 'bia'), { type: 'REST_LEFT', playerId: 'bia' } as DomainEvent], 1, s, 'ana', name)[0].text).toBe('Bia saiu do Descanso.');
    expect(tableNotices([rolled(5, 5), moved(9, 'ana', true)], 1, s, 'ana', name)[0].text).toBe('Três duplas seguidas: você vai direto para o Descanso.');
    expect(tableNotices([rolled(5, 4), moved(9)], 1, s, 'ana', name)).toEqual([]);
  });
});
