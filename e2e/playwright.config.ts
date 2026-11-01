import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta: navegador → Vite → API Spring Boot → PostgreSQL (infrastructure/docker).
 * Reaproveita servidores já rodando; senão sobe o Vite e a API. O banco precisa estar de pé.
 * E2E_WEB_PORT troca a porta do front (ex.: 5174 para testar uma worktree sem parar a principal).
 */
const mvnw = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
const webPort = Number(process.env.E2E_WEB_PORT ?? 5173);

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.ts',
  timeout: 180_000,
  // O 3D roda sem placa de vídeo no navegador de teste: telas demoram a abrir sob carga.
  expect: { timeout: 30_000 },
  // Uma nova tentativa por teste; falha repetida continua reprovando.
  retries: 1,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  outputDir: '../test-results',
  use: {
    baseURL: `http://localhost:${webPort}`,
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `${mvnw} -B -q spring-boot:run`,
      cwd: '../apps/api',
      port: 8080,
      timeout: 180_000,
      reuseExistingServer: true,
      // O WebSocket só aceita as origens listadas; inclui a porta do front usada no teste.
      env: { ALLOWED_ORIGINS: `http://localhost:5173,http://localhost:${webPort}` },
    },
    {
      command: `npx vite --port ${webPort} --strictPort`,
      cwd: '../apps/web',
      port: webPort,
      reuseExistingServer: true,
    },
  ],
});
