/**
 * Osobna konfiguracja Playwrighta dla integracji z ReportPortalem.
 *
 * Root config ma `testDir: './tests'`, więc ten katalog jest poza jego zasięgiem.
 * To gwarancja, że `npx playwright test` nie podniesie specki gadającej z ReportPortalem
 * i nie zrobi czerwonego biegu komuś bez Dockera. Uruchamia ją `npm run test:vrt:rp`.
 *
 * Reporter ReportPortala wchodzi do tablicy TYLKO wtedy, gdy konfiguracja jest kompletna.
 * Bez `.env` bieg leci lokalnie z samym `list` i jednym ostrzeżeniem, zamiast wywalać się
 * na brakującym kluczu. Nawet gdyby reporter został wpięty, a stack leżał, agent połyka
 * błędy sieci we własnym `catch`, więc wynik testów i tak zależy tylko od testów.
 *
 * Nazwy projektów muszą się zgadzać z mapą w `rp.attributes.ts`, bo to z nich biorą się
 * atrybuty `viewport`, `colorScheme` i `device` widoczne w panelu.
 */
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { isRpConfigured, loadRpConfig, describeRpConfig } from './rp.config';

const APP_DIR = fileURLToPath(new URL('../app', import.meta.url));

const rpEnabled = isRpConfigured();

if (rpEnabled) {
  console.info(describeRpConfig(loadRpConfig()));
} else {
  console.warn(
    '[rp] ReportPortal not configured, running locally with the list reporter only.\n' +
      '     Copy reportportal/.env.example to reportportal/.env to send results.',
  );
}

export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.rp.spec.ts'],

  // Baseline'y tych specek są lokalne i nie idą do repo, tak samo jak tests/__screenshots__/.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',

  // Jeden przebieg to jeden launch w panelu. Powtórki mnożyłyby wpisy przy tej samej różnicy.
  retries: 0,
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,

  reporter: rpEnabled
    ? [['@reportportal/agent-js-playwright', loadRpConfig()], ['list']]
    : [['list']],

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
    },
  },

  webServer: {
    command: 'npm run dev',
    cwd: APP_DIR,
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    {
      name: 'rp-desktop-light',
      use: { viewport: { width: 1920, height: 1080 }, colorScheme: 'light' },
    },
    {
      name: 'rp-mobile-light',
      use: { ...devices['iPhone 13'], colorScheme: 'light' },
    },
    {
      name: 'rp-desktop-dark',
      use: { viewport: { width: 1920, height: 1080 }, colorScheme: 'dark' },
    },
  ],
});
