// Venda ao banco para pagar uma dívida (08/11/2026): o jogador marca estados inteiros no tabuleiro e o
// aviso soma quanto recebe. Só confirma quando a soma, com o saldo, paga a dívida. O servidor confere.
import { board, rules, states } from '@imperio/game-data';
import type { GameSnapshot, StateId } from '@imperio/shared-types';
import { HOTEL_LEVEL, stateSaleValue } from './rules';

const statesById = new Map(states.map((s) => [s.id, s]));

export interface SaleItem {
  tile: number;
  stateId: StateId;
  name: string;
  /** Construções que vão junto: 0–4 casas ou 'hotel'. */
  buildings: number | 'hotel';
  value: number;
}

export interface SaleSummary {
  /** Estados marcados, na ordem do tabuleiro. */
  items: SaleItem[];
  total: number;
  debt: number;
  credits: number;
  /** Quanto falta pagar com o que já está marcado (0 = cobre). */
  missing: number;
  covers: boolean;
  /** Nem vendendo todos os estados dá para pagar: só resta a falência. */
  hopeless: boolean;
  /** Casas dos estados do jogador (as que podem ser marcadas). */
  ownTiles: number[];
}

function itemOf(snapshot: GameSnapshot, tile: number): SaleItem | null {
  const stateId = board.tiles[tile]?.stateId;
  const property = stateId ? snapshot.properties.find((p) => p.stateId === stateId) : undefined;
  const definition = stateId ? statesById.get(stateId) : undefined;
  if (!stateId || !property || !definition) return null;
  return {
    tile,
    stateId,
    name: definition.name,
    buildings: property.buildingLevel === HOTEL_LEVEL ? 'hotel' : property.buildingLevel,
    value: stateSaleValue(definition, property),
  };
}

export function saleSummary(snapshot: GameSnapshot, myId: string, picked: readonly number[]): SaleSummary | null {
  const debt = snapshot.pendingDebt;
  const me = snapshot.players.find((p) => p.id === myId);
  if (!debt || !me || debt.debtorId !== myId) return null;
  const ownTiles = board.tiles.filter((t) => t.stateId && snapshot.properties.some((p) => p.stateId === t.stateId && p.ownerId === myId)).map((t) => t.index);
  const items = ownTiles.filter((t) => picked.includes(t)).map((t) => itemOf(snapshot, t)).filter((i): i is SaleItem => i !== null);
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const everything = ownTiles.reduce((sum, t) => sum + (itemOf(snapshot, t)?.value ?? 0), 0);
  const missing = Math.max(0, debt.amount - me.credits - total);
  return {
    items,
    total,
    debt: debt.amount,
    credits: me.credits,
    missing,
    covers: items.length > 0 && missing === 0,
    hopeless: me.credits + everything < debt.amount,
    ownTiles,
  };
}

/** Percentual que o banco paga, para o texto do aviso. */
export const SALE_PERCENT = rules.debtSale.refundPercent;
