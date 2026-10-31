import { expect, test, type Browser, type Page } from '@playwright/test';

/** Cada jogador num contexto próprio: sessão e armazenamento separados, como dois navegadores. */
async function newPlayer(browser: Browser, nickname: string): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.getByLabel('Apelido').fill(nickname);
  await page.getByRole('button', { name: 'ENTRAR' }).click();
  await expect(page.getByText(`Olá, ${nickname}!`)).toBeVisible();
  return page;
}

const myTurn = (page: Page) => page.getByText('Sua vez', { exact: true });

/** Decisões que o jogador da vez pode recusar depois de andar; recusar mantém o teste previsível. */
const DECLINE = ['ROLAR DADOS', 'Não comprar', 'Não construir', 'Não sediar'];

test('dois jogadores criam a sala, começam a partida e jogam um turno', async ({ browser }) => {
  const ana = await newPlayer(browser, 'Ana E2E');
  const bia = await newPlayer(browser, 'Bia E2E');

  // Ana cria a sala; Bia entra pelo código de convite.
  await ana.getByRole('button', { name: 'CRIAR SALA' }).click();
  await expect(ana.getByText('Sala de espera')).toBeVisible();
  const code = (await ana.getByText(/^[A-Z0-9]{6}$/).textContent())!.trim();

  await bia.getByLabel('Código da sala').fill(code);
  await bia.getByRole('button', { name: 'ENTRAR' }).click();
  await expect(bia.getByText('Sala de espera')).toBeVisible();
  await expect(ana.getByText('Bia E2E')).toBeVisible();

  // Os dois ficam prontos e a anfitriã inicia.
  await bia.getByRole('button', { name: 'Estou pronto' }).click();
  await ana.getByRole('button', { name: 'Estou pronto' }).click();
  const start = ana.getByRole('button', { name: 'INICIAR PARTIDA' });
  await expect(start).toBeEnabled();
  await start.click();

  // Ambos chegam à partida; a ordem é sorteada, então descobre quem começa.
  for (const page of [ana, bia]) {
    await expect(page.getByRole('list', { name: 'Jogadores' })).toBeVisible();
  }
  await expect(myTurn(ana).or(ana.getByText('Vez de Bia E2E'))).toBeVisible();
  const [first, second] = (await myTurn(ana).isVisible()) ? [ana, bia] : [bia, ana];
  const firstName = first === ana ? 'Ana E2E' : 'Bia E2E';
  await expect(second.getByText(`Vez de ${firstName}`)).toBeVisible();

  // Joga até a vez passar (dupla dá nova jogada; o Descanso só passa a vez).
  for (let step = 0; step < 12 && !(await myTurn(second).isVisible()); step++) {
    const action = first.getByRole('button', { name: new RegExp(`^(${DECLINE.join('|')})$`) });
    try {
      await action.first().click({ timeout: 3_000 });
    } catch {
      // Nada a fazer neste instante (animação ou passagem automática da vez).
    }
  }
  await expect(myTurn(second)).toBeVisible();
  await expect(first.getByText(`Vez de ${first === ana ? 'Bia E2E' : 'Ana E2E'}`)).toBeVisible();

  // O lance chegou aos dois navegadores pelo WebSocket.
  for (const page of [ana, bia]) {
    await page.getByRole('button', { name: /Histórico/ }).click();
    await expect(page.getByLabel('Histórico').getByText(new RegExp(`${firstName} tirou \\d \\+ \\d\\.`)).first())
      .toBeVisible();
  }
});
