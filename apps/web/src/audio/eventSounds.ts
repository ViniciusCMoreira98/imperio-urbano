// Quais sons um lote de eventos oficiais pede, do ponto de vista de quem está jogando. Só decide;
// quem toca (e quando: depois dos dados e dos saltos) é o GameSounds.
import { board } from '@imperio/game-data';
import type { DomainEvent } from '@imperio/shared-types';
import type { SoundId } from './sounds';

/** Mais que isso no mesmo lote vira ruído; ficam os primeiros (e o aviso de vez, se houver). */
const MAX_PER_BATCH = 3;

/** Casas em que parar já é um acontecimento com som próprio. */
const olympicTiles = new Set(board.tiles.filter((t) => t.type === 'OLYMPICS').map((t) => t.index));

export function eventSounds(events: readonly DomainEvent[], myId: string): SoundId[] {
  const found: SoundId[] = [];
  const add = (id: SoundId) => {
    if (!found.includes(id)) found.push(id);
  };
  let myTurn = false;
  for (const event of events) {
    switch (event.type) {
      case 'PROPERTY_PURCHASED':
        add('comprar');
        break;
      case 'HOUSE_BUILT':
      case 'HOTEL_BUILT':
        add('construir');
        break;
      case 'OLYMPICS_HOST_SELECTED':
      case 'OLYMPICS_HOST_APPOINTED':
        add('olimpiadas');
        break;
      case 'RENT_PAID':
      case 'CREDITS_TRANSFERRED':
        add(event.toId === myId ? 'receberDinheiro' : 'pagarAluguel');
        break;
      case 'TAX_PAID':
      case 'CREDITS_TO_BANK':
        add('pagarAluguel');
        break;
      case 'SAQUE_COLLECTED':
      case 'CREDITS_FROM_BANK':
        add('receberDinheiro');
        break;
      case 'PLAYER_MOVED':
        if (event.startBonus > 0) add('receberDinheiro');
        // Parou na casa das Olimpíadas (a escolha da sede vem depois, com o mesmo anúncio).
        if (olympicTiles.has(event.to)) add('olimpiadas');
        break;
      case 'PLAYER_BANKRUPT':
        add('falencia');
        break;
      case 'GAME_FINISHED':
        add('vitoria');
        break;
      case 'TURN_ENDED':
        myTurn = event.nextPlayerId === myId;
        break;
    }
  }
  // Fim de partida encerra tudo: nada de "sua vez" depois da vitória.
  const done = found.includes('vitoria');
  const picked = found.slice(0, myTurn && !done ? MAX_PER_BATCH - 1 : MAX_PER_BATCH);
  if (myTurn && !done) picked.push('suaVez');
  return picked;
}
