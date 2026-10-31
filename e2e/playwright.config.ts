import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta: navegador → Vite → API Spring Boot → PostgreSQL (infrastructure/docker).
 * Reaproveita servidores já rodando; senão sobe o Vite e a API. O banco precisa estar de pé.
 */
const mvnw = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.ts',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  outputDir: '../test-results',
  use: {
    baseURL: 'http://localhost:5173',
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
    },
    {
      command: 'npm run dev',
      cwd: '..',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
