/**
 * Osobna konfiguracja Playwrighta dla integracji z Visual Regression Trackerem.
 *
 * Root config ma `testDir: './tests'`, więc ten katalog jest poza jego zasięgiem.
 * To gwarancja, że `npx playwright test` nie podniesie specki gadającej z trackerem
 * i nie zrobi czerwonego biegu komuś bez Dockera. Uruchamia ją `npm run test:vrt:tracker`.
 *
 * Nie ma tu `snapshotPathTemplate` ani `expect.toHaveScreenshot`: w tym projekcie
 * nie powstaje ani jeden lokalny baseline, wszystkie leżą w bazie trackera.
 */
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// webServer.cwd liczy się względem tego pliku, nie korzenia repo.
const APP_DIR = fileURLToPath(new URL('../app', import.meta.url));

export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.tracker.spec.ts'],

  // Jeden przebieg to jeden build. Każdy worker wykonuje własne beforeAll,
  // czyli własne vrt.start(), a retry otwiera kolejny build.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,

  // Raportem jest panel na localhost:8082.
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'off',
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
      // Jeden projekt to jeden wariant w trackerze. Klucz wariantu zawiera przeglądarkę
      // i rozdzielczość, więc każdy dołożony projekt mnoży baseline'y do zatwierdzenia.
      name: 'tracker-desktop-light',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
      },
    },
  ],
});
