import { expect, type Browser, type Page } from '@playwright/test';

/** Cada jogador num contexto próprio: sessão e armazenamento separados, como dois navegadores. */
export async function newPlayer(browser: Browser, nickname: string): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.getByLabel('Apelido').fill(nickname);
  await page.getByRole('button', { name: 'ENTRAR' }).click();
  await expect(page.getByText(`Olá, ${nickname}!`)).toBeVisible();
  return page;
}

/** Em tela larga a vez aparece no quadro "Turno de" do canto inferior esquerdo. */
export const turnOf = (page: Page, name: string) => page.getByRole('status', { name: `Turno de: ${name}` });
export const myTurn = (page: Page) => turnOf(page, 'Você');

/** A anfitriã cria a sala, a convidada entra pelo código, as duas ficam prontas e a partida começa. */
export async function startTwoPlayerGame(host: Page, guest: Page, guestName: string): Promise<void> {
  await host.getByRole('button', { name: 'CRIAR SALA' }).click();
  await expect(host.getByText('Sala de espera')).toBeVisible();
  const code = (await host.getByText(/^[A-Z0-9]{6}$/).textContent())!.trim();
  await guest.getByLabel('Código da sala').fill(code);
  await guest.getByRole('button', { name: 'ENTRAR' }).click();
  await expect(guest.getByText('Sala de espera')).toBeVisible();
  await expect(host.getByText(guestName)).toBeVisible();
  await guest.getByRole('button', { name: 'Estou pronto' }).click();
  await host.getByRole('button', { name: 'Estou pronto' }).click();
  const start = host.getByRole('button', { name: 'INICIAR PARTIDA' });
  await expect(start).toBeEnabled();
  await start.click();
  for (const page of [host, guest]) {
    // O tabuleiro 3D demora a abrir no navegador de teste (sem placa de vídeo).
    await expect(page.getByRole('list', { name: 'Jogadores' })).toBeVisible({ timeout: 30_000 });
  }
}

export interface BoardView {
  /** Versão do estado oficial recebido por este navegador. */
  version: number;
  /** Versão até onde os eventos chegaram em sequência. */
  eventsVersion: number | null;
  resync: number;
  /** Movimentos recebidos por este navegador desde que conectou (id = versão do evento). */
  moves: { id: number; playerId: string }[];
  /** Por jogador: casa oficial, casa em que o personagem está desenhado e se já parou. */
  players: { id: string; nickname: string; position: number; drawnTile: number | null; resting: boolean }[];
}

/** Lê pelos ganchos de desenvolvimento o estado oficial e o que está desenhado neste navegador. */
export async function boardView(page: Page): Promise<BoardView> {
  // Logo após abrir ou recarregar, os ganchos podem ainda não existir: espera em vez de falhar.
  await page.waitForFunction(() => Boolean((window as unknown as { __imperioGame?: unknown }).__imperioGame), undefined, { timeout: 30_000 });
  return page.evaluate(() => {
    type Game = {
      getState: () => {
        snapshot: { version: number; players: { id: string; nickname: string; position: number }[] } | null;
        eventsVersion: number | null;
        resync: number;
        moves: { id: number; playerId: string }[];
      };
    };
    const w = window as unknown as { __imperioGame?: Game; __imperioPawns?: Record<string, { tile: number; resting: boolean }> };
    const state = w.__imperioGame!.getState();
    return {
      version: state.snapshot?.version ?? -1,
      eventsVersion: state.eventsVersion,
      resync: state.resync,
      moves: state.moves.map((m) => ({ id: m.id, playerId: m.playerId })),
      players: (state.snapshot?.players ?? []).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        position: p.position,
        drawnTile: w.__imperioPawns?.[p.id]?.tile ?? null,
        resting: w.__imperioPawns?.[p.id]?.resting ?? false,
      })),
    };
  });
}

/** Todos os personagens parados exatamente na casa oficial. */
export const allAtOfficialTiles = (view: BoardView) => view.players.every((p) => p.resting && p.drawnTile === p.position);
