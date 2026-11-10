import type { BoardDefinition, EventCard, RulesConfig, StateDefinition } from '@imperio/shared-types';

export const ALL_STATE_IDS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE',
] as const;

/** Percurso definitivo (v3): 34 casas, com lados de tamanhos diferentes; RN antes do AM e o Saque. */
export const BOARD_SIZE = 34;

const REQUIRED_SPECIALS = ['START', 'OLYMPICS', 'REST', 'EVENT', 'NATIONAL_TRAVEL', 'TAX', 'SAQUE'] as const;

/** Retorna a lista de erros; vazia quando o catálogo é consistente. */
export function validateCatalog(
  states: StateDefinition[],
  board: BoardDefinition,
  rules: RulesConfig,
): string[] {
  const errors: string[] = [];
  const ids = states.map((s) => s.id);

  for (const id of ALL_STATE_IDS) {
    const count = ids.filter((x) => x === id).length;
    if (count === 0) errors.push(`Estado ausente: ${id}`);
    if (count > 1) errors.push(`Estado duplicado: ${id}`);
  }
  for (const id of ids) {
    if (!(ALL_STATE_IDS as readonly string[]).includes(id)) errors.push(`Estado desconhecido: ${id}`);
  }

  const groupIds = new Set(board.colorGroups.map((g) => g.id));
  for (const s of states) {
    if (s.abbreviation !== s.id) errors.push(`${s.id}: sigla diferente do id`);
    if (!groupIds.has(s.colorGroup)) errors.push(`${s.id}: grupo de cor inexistente ${s.colorGroup}`);
    if (s.price < 50 || s.price > 500) errors.push(`${s.id}: preço fora de 50–500`);
    const r = s.rent;
    const ladder = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel];
    if (ladder.some((v, i) => v <= 0 || (i > 0 && v <= ladder[i - 1]))) {
      errors.push(`${s.id}: aluguéis devem ser positivos e crescentes`);
    }
    if (s.houseCost <= 0 || s.hotelCost <= 0) errors.push(`${s.id}: custos de construção inválidos`);
  }

  // Os preços nunca diminuem ao longo do percurso (vizinhos podem repetir): casa 1 a mais barata.
  const priceOf = new Map(states.map((s) => [s.id, s.price]));
  const route = board.tiles.filter((t) => t.type === 'PROPERTY').map((t) => priceOf.get(t.stateId!) ?? 0);
  if (route.some((p, i) => i > 0 && p < route[i - 1])) errors.push('Preços não podem diminuir ao longo do tabuleiro');

  if (board.tiles.length !== BOARD_SIZE) {
    errors.push(`Tabuleiro deve ter ${BOARD_SIZE} casas, possui ${board.tiles.length}`);
  }
  const tileIds = new Set<string>();
  board.tiles.forEach((t, i) => {
    if (t.index !== i) errors.push(`Casa na posição ${i} com índice ${t.index}`);
    if (!t.id || tileIds.has(t.id)) errors.push(`Casa ${i}: id ausente ou repetido (${t.id})`);
    tileIds.add(t.id);
    if (t.type === 'PROPERTY' && t.id !== t.stateId) errors.push(`Casa ${i}: id deve ser a sigla do estado`);
  });
  const boardStates = board.tiles.filter((t) => t.type === 'PROPERTY').map((t) => t.stateId);
  for (const id of ALL_STATE_IDS) {
    const count = boardStates.filter((x) => x === id).length;
    if (count !== 1) errors.push(`Estado ${id} aparece ${count} vez(es) no tabuleiro`);
  }
  for (const type of REQUIRED_SPECIALS) {
    if (!board.tiles.some((t) => t.type === type)) errors.push(`Casa especial ausente: ${type}`);
  }
  if (board.tiles[0]?.type !== 'START') errors.push('A casa 0 deve ser o Início');

  const m = rules.olympics.multipliers;
  if (m[0] !== 2 || m[m.length - 1] !== 10 || m.some((v, i) => i > 0 && v <= m[i - 1])) {
    errors.push('Multiplicadores olímpicos devem crescer de ×2 a ×10');
  }
  if (!(rules.tax.equityPercent > 0 && rules.tax.equityPercent <= 100)) errors.push('Percentual da Taxa deve ficar entre 1 e 100');
  if (rules.construction.firstVisitMaxHouses > rules.construction.maxHouses) {
    errors.push('Casas da primeira visita excedem o máximo');
  }

  const economy = rules.economy;
  if (economy.stakes.length === 0 || economy.stakes.some((v) => !(v > 0))) errors.push("Apostas devem ser positivas");
  if (economy.guestStartingCoins < 0 || economy.dailyRefill.amount < economy.dailyRefill.below) {
    errors.push("Saldo inicial e recarga diária inválidos");
  }

  return errors;
}

/** Baralho de eventos: ids únicos e parâmetros coerentes com o tipo de efeito. */
export function validateEventCards(cards: EventCard[], board: BoardDefinition): string[] {
  const errors: string[] = [];
  if (cards.length === 0) errors.push('Baralho de eventos vazio');
  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) errors.push(`Carta duplicada: ${card.id}`);
    ids.add(card.id);
    if (!card.title || !card.text) errors.push(`${card.id}: título e texto são obrigatórios`);
    if (card.copies !== undefined && !(Number.isInteger(card.copies) && card.copies > 0)) {
      errors.push(`${card.id}: cópias devem ser um inteiro positivo`);
    }
    const e = card.effect;
    switch (e.type) {
      case 'GAIN':
      case 'PAY':
        if (!(e.amount > 0)) errors.push(`${card.id}: valor deve ser positivo`);
        break;
      case 'BLACKOUT':
        if (!(Number.isInteger(e.visits) && e.visits > 0)) errors.push(`${card.id}: visitas devem ser positivas`);
        break;
      case 'BURN_PROPERTY':
      case 'VISIT_OLYMPICS_HOST':
      case 'CHOOSE_OLYMPICS_HOST':
      case 'GO_TO_REST':
      case 'GRANT_REST_PASS':
      case 'GRANT_RENT_WAIVER':
        break;
      default:
        errors.push(`${(card as EventCard).id}: tipo de efeito desconhecido`);
    }
  }
  return errors;
}
