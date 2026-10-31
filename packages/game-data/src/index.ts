import type { BoardDefinition, EventCard, RulesConfig, StateDefinition } from '@imperio/shared-types';
import boardJson from '../data/board.json';
import eventsJson from '../data/events.json';
import rulesJson from '../data/rules.json';
import statesJson from '../data/states.json';

export const states = statesJson.states as StateDefinition[];
export const board = boardJson as BoardDefinition;
export const rules = rulesJson as RulesConfig;
export const eventCards = eventsJson.cards as EventCard[];

export { validateCatalog, validateEventCards } from './validate';
