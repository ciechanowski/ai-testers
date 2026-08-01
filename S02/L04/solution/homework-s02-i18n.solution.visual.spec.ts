import { test, expect } from '@playwright/test';

/**
 * Modelowe rozwiązanie S02L04 — /payouts na osi języka.
 *
 * Oś języka zostaje w specu (test.use), nie w playwright.config.ts: viewport i motyw
 * dotyczą całej suity, język dotyczy tej jednej strony. Nowy projekt bez testMatch
 * przebaselinowałby S01+S02 po niemiecku.
 */

const LANGS = ['en', 'pl', 'de'] as const;

// Kod bez regionu. 'de-DE' chybia dokładny lookup w formatPrice (-> USD) i psuje
// podświetlenie w LanguageSwitcher — skaziłby baseline pikselowy i ARIA naraz.
for (const lang of LANGS) {
  test.describe(`VRT – payouts (${lang})`, () => {
    test.use({ locale: lang });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
      await page.goto('/payouts');
      await expect(page.getByTestId('payouts-panel')).toBeVisible();
    });

    test(`panel – ${lang}`, async ({ page }) => {
      // {projectName} rozdziela projekty, NIE języki — stąd -${lang} w nazwie.
      await expect(page.getByTestId('payouts-panel')).toHaveScreenshot(
        `payouts-panel-${lang}.png`,
        {
          mask: [page.getByTestId('payouts-ref')],
          maskColor: '#FF00FF',
        },
      );
    });

    test(`tabs – struktura niezależna od języka (${lang})`, async ({ page }) => {
      const tabs = page.getByTestId('payouts-tabs');

      await expect(tabs).toHaveScreenshot(`payouts-tabs-${lang}.png`);
      await expect(tabs).toMatchAriaSnapshot({ name: `payouts-tabs-${lang}.aria.yml` });
    });
  });
}
