// Monta o que o painel mostra sobre uma casa. Valores vêm sempre do catálogo (game-data).
import { board, rules, states } from '@imperio/game-data';
import type { ColorGroup, StateDefinition, TileType } from '@imperio/shared-types';

export interface RentRow {
  label: string;
  value: number;
}

export type TileInfo =
  | {
      kind: 'property';
      index: number;
      state: StateDefinition;
      group: ColorGroup;
      rents: RentRow[];
    }
  | {
      kind: 'special';
      index: number;
      type: Exclude<TileType, 'PROPERTY'>;
      title: string;
      description: string;
    };

const REGION_NAMES: Record<StateDefinition['region'], string> = {
  NORTE: 'Norte',
  NORDESTE: 'Nordeste',
  CENTRO_OESTE: 'Centro-Oeste',
  SUDESTE: 'Sudeste',
  SUL: 'Sul',
};

export const regionName = (state: StateDefinition) => REGION_NAMES[state.region];

const { olympics } = rules;
const SPECIAL_DESCRIPTIONS: Record<Exclude<TileType, 'PROPERTY'>, string> = {
  START: `Receba ${rules.passStartBonus} créditos sempre que passar ou parar aqui.`,
  REST: 'Pausa para descansar: você perde a próxima jogada, mas continua recebendo aluguéis.',
  VISIT: 'Apenas de passagem. Nada acontece.',
  OLYMPICS: `Pague ${olympics.hostFee} créditos para sediar as Olimpíadas em um estado seu. O aluguel da sede é multiplicado (×${olympics.multipliers[0]} até ×${olympics.multipliers[olympics.multipliers.length - 1]}).`,
  NATIONAL_TRAVEL: 'Na próxima jogada, escolha qualquer casa do tabuleiro e viaje até ela.',
  EVENT: 'Compre uma carta de eventos e siga as instruções.',
};

const statesById = new Map(states.map((s) => [s.id, s]));
const groupsById = new Map(board.colorGroups.map((g) => [g.id, g]));

export function tileInfo(index: number): TileInfo {
  const tile = board.tiles[index];
  if (tile.type === 'PROPERTY') {
    const state = statesById.get(tile.stateId!)!;
    const { rent } = state;
    return {
      kind: 'property',
      index,
      state,
      group: groupsById.get(state.colorGroup)!,
      rents: [
        { label: 'Sem construção', value: rent.base },
        { label: '1 casa', value: rent.house1 },
        { label: '2 casas', value: rent.house2 },
        { label: '3 casas', value: rent.house3 },
        { label: '4 casas', value: rent.house4 },
        { label: 'Hotel', value: rent.hotel },
      ],
    };
  }
  return {
    kind: 'special',
    index,
    type: tile.type,
    title: tile.name ?? '',
    description: SPECIAL_DESCRIPTIONS[tile.type],
  };
}

export const formatCredits = (value: number) => `$ ${value.toLocaleString('pt-BR')}`;
