import type { BoardDefinition, EventCard, RulesConfig, StateDefinition } from '@imperio/shared-types';

export const ALL_STATE_IDS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

const REQUIRED_SPECIALS = ['START', 'OLYMPICS', 'REST', 'EVENT', 'NATIONAL_TRAVEL', 'TAX'] as const;

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
    if (s.price < 100 || s.price > 500) errors.push(`${s.id}: preço fora de 100–500`);
    const r = s.rent;
    const ladder = [r.base, r.house1, r.house2, r.house3, r.house4, r.hotel];
    if (ladder.some((v, i) => v <= 0 || (i > 0 && v <= ladder[i - 1]))) {
      errors.push(`${s.id}: aluguéis devem ser positivos e crescentes`);
    }
    if (s.houseCost <= 0 || s.hotelCost <= 0) errors.push(`${s.id}: custos de construção inválidos`);
  }

  const prices = states.map((s) => s.price);
  if (new Set(prices).size !== prices.length) errors.push('Preços de compra repetidos');

  const expectedTiles = board.tilesPerSide * 4;
  if (board.tiles.length !== expectedTiles) {
    errors.push(`Tabuleiro deve ter ${expectedTiles} casas, possui ${board.tiles.length}`);
  }
  board.tiles.forEach((t, i) => {
    if (t.index !== i) errors.push(`Casa na posição ${i} com índice ${t.index}`);
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
  if (!(rules.tax.amount > 0)) errors.push('Valor da Taxa deve ser positivo');
  if (rules.construction.firstVisitMaxHouses > rules.construction.maxHouses) {
    errors.push('Casas da primeira visita excedem o máximo');
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
    const e = card.effect;
    switch (e.type) {
      case 'GAIN':
      case 'PAY':
      case 'COLLECT_FROM_EACH':
        if (!(e.amount > 0)) errors.push(`${card.id}: valor deve ser positivo`);
        break;
      case 'PAY_PER_BUILDING':
        if (!(e.perHouse > 0 && e.perHotel > 0)) errors.push(`${card.id}: valores por construção devem ser positivos`);
        break;
      case 'MOVE_TO':
        if (!(e.tile >= 0 && e.tile < board.tiles.length)) errors.push(`${card.id}: casa de destino inexistente`);
        break;
      case 'MOVE_BY':
        if (!Number.isInteger(e.steps) || e.steps === 0) errors.push(`${card.id}: deslocamento inválido`);
        break;
      case 'GO_TO_REST':
        break;
      default:
        errors.push(`${(card as EventCard).id}: tipo de efeito desconhecido`);
    }
  }
  return errors;
}
