import { expect, test, type Page } from '@playwright/test';
import { allAtOfficialTiles, boardView, myTurn, newPlayer, startTwoPlayerGame, turnOf } from './helpers';

/** Descobre quem começa (a ordem é sorteada) e devolve [quem joga, quem espera]. */
async function whoStarts(ana: Page, bia: Page): Promise<[Page, Page]> {
  await expect(myTurn(ana).or(turnOf(ana, 'Bia Mov'))).toBeVisible();
  return (await myTurn(ana).isVisible()) ? [ana, bia] : [bia, ana];
}

async function roll(page: Page): Promise<void> {
  const before = (await boardView(page)).version;
  await page.getByRole('button', { name: 'ROLAR DADOS' }).click();
  // O lance foi aplicado quando o estado oficial avança.
  await expect.poll(async () => (await boardView(page)).version).toBeGreaterThan(before);
}

test.describe('movimento dos personagens', () => {
  test('o lance aparece nos dois navegadores e termina na casa oficial', async ({ browser }) => {
    const ana = await newPlayer(browser, 'Ana Mov');
    const bia = await newPlayer(browser, 'Bia Mov');
    await startTwoPlayerGame(ana, bia, 'Bia Mov');
    const [first, second] = await whoStarts(ana, bia);

    // Antes do lance: todos parados no Início, nos dois navegadores.
    for (const page of [ana, bia]) await expect.poll(async () => allAtOfficialTiles(await boardView(page))).toBe(true);

    await roll(first);
    for (const page of [first, second]) {
      // Os dois navegadores chegam à mesma versão, sem ressincronia (eventos em sequência)…
      await expect.poll(async () => (await boardView(page)).eventsVersion).toBe((await boardView(first)).version);
      // …e, terminados os saltos, cada personagem está parado na casa que o servidor informou.
      await expect.poll(async () => allAtOfficialTiles(await boardView(page)), { timeout: 20_000 }).toBe(true);
      expect((await boardView(page)).resync).toBe(1);
    }
    const official = (await boardView(first)).players.map((p) => p.position);
    expect((await boardView(second)).players.map((p) => p.position)).toEqual(official);
    expect(official.some((tile) => tile !== 0)).toBe(true);
  });

  test('quem recarrega no meio dos saltos vê o personagem direto na casa oficial', async ({ browser }) => {
    const ana = await newPlayer(browser, 'Ana Mov');
    const bia = await newPlayer(browser, 'Bia Mov');
    await startTwoPlayerGame(ana, bia, 'Bia Mov');
    const [first, second] = await whoStarts(ana, bia);

    await roll(first);
    // Enquanto o personagem ainda pula na outra tela, ela recarrega (reconexão no meio da animação).
    await second.reload();
    // Recarregar passa pela sala (consulta periódica) antes de reabrir o tabuleiro: pode demorar.
    await expect(second.getByRole('list', { name: 'Jogadores' })).toBeVisible({ timeout: 30_000 });
    await expect.poll(async () => (await boardView(second)).players.every((p) => p.drawnTile !== null)).toBe(true);

    // Logo na primeira leitura, sem esperar animação: o personagem de quem rolou já está parado no
    // lugar oficial. (A partida segue durante a recarga — o servidor pode jogar pela outra jogadora,
    // desconectada no modo automático —, então só o personagem do lance entra na conferência.)
    const rollerName = first === ana ? 'Ana Mov' : 'Bia Mov';
    const view = await boardView(second);
    const roller = view.players.find((p) => p.nickname === rollerName)!;
    if (view.moves.some((m) => m.playerId === roller.id)) {
      // Jogou de novo depois da reconexão (dupla + prazo): anima só esse lance novo e para no oficial.
      await expect
        .poll(async () => {
          const now = (await boardView(second)).players.find((p) => p.id === roller.id)!;
          return now.resting && now.drawnTile === now.position;
        }, { timeout: 30_000 })
        .toBe(true);
    } else {
      // Nada novo: nenhuma animação antiga, já parado na casa oficial.
      expect(roller.resting).toBe(true);
      expect(roller.drawnTile).toBe(roller.position);
    }
  });
});
