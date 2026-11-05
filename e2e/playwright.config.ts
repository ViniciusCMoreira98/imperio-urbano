import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta: navegador → Vite → API Spring Boot → PostgreSQL (infrastructure/docker).
 * Reaproveita servidores já rodando; senão sobe o Vite e a API. O banco precisa estar de pé.
 * E2E_WEB_PORT troca a porta do front (ex.: 5174 para testar uma worktree sem parar a principal).
 */
// Caminho explícito: no Windows o processo do Playwright não procura executáveis na pasta atual.
const mvnw = process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw';
const webPort = Number(process.env.E2E_WEB_PORT ?? 5173);
// E2E_API_PORT: API da worktree em outra porta (o Vite recebe a mesma via API_PORT).
const apiPort = Number(process.env.E2E_API_PORT ?? 8080);

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
      port: apiPort,
      timeout: 180_000,
      reuseExistingServer: true,
      // O WebSocket só aceita as origens listadas; inclui a porta do front usada no teste. `env`
      // substitui o ambiente inteiro no Playwright: sem repassar o do sistema, a API perde PATH e JAVA_HOME.
      env: { ...(process.env as Record<string, string>), ALLOWED_ORIGINS: `http://localhost:5173,http://localhost:${webPort}`, SERVER_PORT: String(apiPort) },
    },
    {
      command: `npx vite --port ${webPort} --strictPort`,
      cwd: '../apps/web',
      env: { ...(process.env as Record<string, string>), API_PORT: String(apiPort) },
      port: webPort,
      reuseExistingServer: true,
    },
  ],
});
