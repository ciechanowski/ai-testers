import { test, expect } from '@playwright/test';
import { mockAllApis, stabilizePage } from '../../fixtures/mock-handlers';

/**
 * Output modelowego skilla `.claude/skills/vrt-i18n/SKILL.md` (S03L03).
 *
 * Jedna strona × trzy języki. Locale idzie przez test.use, nie przez projekty:
 * język dotyczy tej strony, nie całej suity. Kod bez regionu — 'de-DE' chybia
 * dokładny lookup w formatPrice i gubi podświetlenie w LanguageSwitcher.
 */

const LANGS = ['en', 'pl', 'de'] as const;

for (const lang of LANGS) {
  test.describe(`VRT – insights (${lang})`, () => {
    test.use({ locale: lang });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
      await mockAllApis(page);
      await page.goto('/insights');
      await stabilizePage(page);
      await expect(page.getByTestId('insights-table').locator('tbody tr').first()).toBeVisible();
    });

    test(`insights panel – ${lang}`, async ({ page }) => {
      // Ceny i daty NIE są maskowane — różnica per locale to przedmiot testu.
      // Maskujemy tylko losowy identyfikator zadania.
      await expect(page.getByTestId('insights-panel')).toHaveScreenshot(
        `s03-insights-panel-${lang}.png`,
        {
          mask: [page.getByTestId('insights-job')],
          maskColor: '#FF00FF',
        },
      );
    });

    test(`insights chart – ${lang}`, async ({ page }) => {
      // Gradient + antyaliasing krawędzi słupków dają szum subpikselowy.
      // maxDiffPixels (próg bezwzględny) jest czytelniejszy w review niż threshold.
      await expect(page.getByTestId('insights-chart')).toHaveScreenshot(
        `s03-insights-chart-${lang}.png`,
        { maxDiffPixels: 120 },
      );
    });
  });
}
