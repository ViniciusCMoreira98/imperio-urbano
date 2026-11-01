import { expect, test, type Page } from '@playwright/test';
import { boardView, myTurn, newPlayer } from './helpers';

/**
 * Medição de desempenho com 4 jogadores (só roda com E2E_PERF=1). O Chromium de teste desenha sem
 * placa de vídeo (SwiftShader), então os números são o pior caso, úteis para comparar versões.
 */
test.skip(!process.env.E2E_PERF, 'Defina E2E_PERF=1 para medir o desempenho.');

interface FrameStats {
  frames: number;
  avgMs: number;
  p95Ms: number;
  drawCalls: number;
  triangles: number;
}

/** Mede `count` quadros: tempo entre quadros e chamadas de desenho/triângulos por quadro (médias). */
function measure(page: Page, count: number): Promise<FrameStats> {
  return page.evaluate(async (count) => {
    const gl = document.querySelector('canvas')!.getContext('webgl2')!;
    let calls = 0;
    let tris = 0;
    const drawElements = gl.drawElements.bind(gl);
    const drawArrays = gl.drawArrays.bind(gl);
    gl.drawElements = (mode, n, type, offset) => {
      calls++;
      if (mode === gl.TRIANGLES) tris += n / 3;
      return drawElements(mode, n, type, offset);
    };
    gl.drawArrays = (mode, first, n) => {
      calls++;
      if (mode === gl.TRIANGLES) tris += n / 3;
      return drawArrays(mode, first, n);
    };
    const times: number[] = [];
    await new Promise<void>((done) => {
      let last = performance.now();
      const frame = (t: number) => {
        times.push(t - last);
        last = t;
        if (times.length <= count) requestAnimationFrame(frame);
        else done();
      };
      requestAnimationFrame(frame);
    });
    gl.drawElements = drawElements;
    gl.drawArrays = drawArrays;
    times.shift();
    const sorted = [...times].sort((a, b) => a - b);
    return {
      frames: times.length,
      avgMs: +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1),
      p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
      drawCalls: Math.round(calls / times.length),
      triangles: Math.round(tris / times.length),
    };
  }, count);
}

test('desempenho com quatro personagens', async ({ browser }) => {
  test.setTimeout(300_000);
  const names = ['P1 Perf', 'P2 Perf', 'P3 Perf', 'P4 Perf'];
  const pages = [];
  for (const name of names) pages.push(await newPlayer(browser, name));
  const [host, ...guests] = pages;

  await host.getByRole('button', { name: 'CRIAR SALA' }).click();
  await expect(host.getByText('Sala de espera')).toBeVisible();
  const code = (await host.getByText(/^[A-Z0-9]{6}$/).first().textContent())!.trim();
  for (const guest of guests) {
    await guest.getByLabel('Código da sala').fill(code);
    await guest.getByRole('button', { name: 'ENTRAR' }).click();
    await expect(guest.getByText('Sala de espera')).toBeVisible();
    await guest.getByRole('button', { name: 'Estou pronto' }).click();
  }
  await host.getByRole('button', { name: 'Estou pronto' }).click();
  await host.getByRole('button', { name: 'INICIAR PARTIDA' }).click();
  for (const page of pages) await expect(page.getByRole('list', { name: 'Jogadores' })).toBeVisible();
  // Espera os quatro personagens estarem desenhados (o prazo pode já ter jogado por alguém).
  await expect.poll(async () => (await boardView(host)).players.every((p) => p.drawnTile !== null), { timeout: 60_000 }).toBe(true);

  const idle = await measure(host, 60);

  // Mede durante os saltos de quem estiver na vez.
  let roller = host;
  for (const page of pages) if (await myTurn(page).isVisible()) roller = page;
  // O prazo pode ter rolado antes: sem o botão, mede assim mesmo (a partida segue com saltos).
  await roller.getByRole('button', { name: 'ROLAR DADOS' }).click({ timeout: 5_000 }).catch(() => undefined);
  const hopping = await measure(host, 60);

  const heapMB = await host.evaluate(() => Math.round(((performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0) / 1048576));
  console.log('[desempenho]', JSON.stringify({ parado: idle, saltando: hopping, heapMB }));
  expect(idle.frames).toBeGreaterThan(0);
});
