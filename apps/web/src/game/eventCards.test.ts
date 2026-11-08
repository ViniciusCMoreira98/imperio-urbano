import { describe, expect, it } from 'vitest';
import { board } from '@imperio/game-data';
import type { DomainEvent, GameSnapshot, PlayerState, PropertyState } from '@imperio/shared-types';
import { boardChoice, choiceAction } from './boardChoice';
import { cardsFromEvents, heldCredits } from './eventCards';

const tileOf = (stateId: string) => board.tiles.find((t) => t.stateId === stateId)!.index;
const player = (id: string) => ({ id, nickname: id, credits: 1500, position: 4, bankrupt: false }) as PlayerState;
const owned = (stateId: string, ownerId: string) => ({ stateId, ownerId, buildingLevel: 0, blackoutVisitsLeft: 0 }) as PropertyState;

const choosing = (cardId: string): GameSnapshot =>
  ({
    status: 'IN_PROGRESS',
    currentPlayerId: 'ana',
    phase: 'AWAITING_EVENT_TARGET',
    pendingEventCardId: cardId,
    players: [player('ana'), player('bia')],
    properties: [owned('MA', 'ana'), owned('SP', 'bia'), owned('BA', 'bia')],
    olympics: { edition: 0, hostStateId: null, hostPlayerId: null, multiplier: 1 },
  }) as GameSnapshot;

describe('cartas de evento no cliente', () => {
  it('guarda o dinheiro da carta até ela sumir; o do movimento espera o pouso (heldMoney)', () => {
    const events: DomainEvent[] = [
      { type: 'PLAYER_MOVED', playerId: 'ana', from: 0, to: 4, startBonus: 0, sentToRest: false },
      { type: 'EVENT_CARD_DRAWN', playerId: 'ana', cardId: 'visita-olimpica' },
      { type: 'CREDITS_FROM_BANK', playerId: 'ana', amount: 50 },
      { type: 'PLAYER_MOVED', playerId: 'ana', from: 4, to: 2, startBonus: 200, sentToRest: false },
      { type: 'RENT_PAID', fromId: 'ana', toId: 'bia', stateId: 'AM', amount: 120 },
    ];
    const cards = cardsFromEvents(events, 10);
    expect(cards).toEqual([{ id: 11, playerId: 'ana', cardId: 'visita-olimpica', withoutEffect: false, credits: { ana: 50 } }]);
    expect(heldCredits(cards, 10)).toEqual({ ana: 50 });
    expect(heldCredits(cards, 11)).toEqual({});
  });

  it('marca a carta sem efeito', () => {
    const cards = cardsFromEvents(
      [
        { type: 'EVENT_CARD_DRAWN', playerId: 'ana', cardId: 'apagao' },
        { type: 'EVENT_CARD_WITHOUT_EFFECT', playerId: 'ana', cardId: 'apagao' },
      ],
      1,
    );
    expect(cards[0].withoutEffect).toBe(true);
  });

  it('Incêndio destaca só estados de oponentes e confirma com o estado tocado', () => {
    const choice = boardChoice(choosing('incendio'), 'ana')!;
    expect(choice.kind).toBe('event');
    expect([...choice.tiles].sort((a, b) => a - b)).toEqual([tileOf('BA'), tileOf('SP')].sort((a, b) => a - b));
    expect(choiceAction(choice, tileOf('SP'))).toEqual({ label: 'Incendiar São Paulo', command: { type: 'CHOOSE_EVENT_TARGET', stateId: 'SP' } });
    expect(choiceAction(choice, tileOf('MA'))).toBeNull();
  });

  it('Escolha da sede aceita qualquer estado com dono, inclusive os próprios', () => {
    const choice = boardChoice(choosing('escolha-sede'), 'ana')!;
    expect(choice.tiles).toContain(tileOf('MA'));
    expect(choice.tiles).toContain(tileOf('SP'));
    expect(choiceAction(choice, tileOf('MA'))?.label).toBe('Sede em Maranhão');
  });

  it('só quem tirou a carta escolhe', () => {
    expect(boardChoice(choosing('apagao'), 'bia')).toBeNull();
  });
});
