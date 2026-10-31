import type { BoardDefinition, RulesConfig, StateDefinition } from '@imperio/shared-types';
import boardJson from '../data/board.json';
import rulesJson from '../data/rules.json';
import statesJson from '../data/states.json';

export const states = statesJson.states as StateDefinition[];
export const board = boardJson as BoardDefinition;
export const rules = rulesJson as RulesConfig;

export { validateCatalog } from './validate';
