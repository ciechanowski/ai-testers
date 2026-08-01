import { test, expect } from '@playwright/test';
import { responsiveDiffPrompt } from '../ai/prompts';
import { gotoDemo } from '../ai/demo-url';

const FROZEN = new Date('2026-01-15T12:00:00Z');

// Ćwiczenie S02/L01 — panel filtrów na /gallery (data-testid="gallery-sidebar"):
// na desktopie (>= lg = 1024 px) to boczny sidebar, poniżej lg zwija się do paska chipów.
// Zrzut robimy PER PROJEKT (viewport z projektu, nie setViewportSize), więc:
//   mobile-light  (iPhone 13, < lg)  -> chipy
//   desktop-light (1920,    >= lg)   -> sidebar
//   desktop-dark  (1920,    >= lg)   -> sidebar (dark)
// AI dostaje komplet zrzutów i ocenia każdą różnicę: zamierzone zwinięcie czy bug?
// VRT_DEMO=bug wstrzykuje regresję ?vrt=sidebar-desktop-gone — sidebar znika także >= lg,
// a chipy są lg:hidden, więc na desktopie nie ma żadnych filtrów (oczekiwany werdykt: bug).
test.describe('Gallery Responsive Diff — sidebar filtrów: zwinięcie czy bug?', () => {
  test('zrzut /gallery per projekt + PROMPT.md do AI', async ({ page }, testInfo) => {
    await page.clock.setFixedTime(FROZEN);
    await gotoDemo(page, testInfo, '/gallery', { bug: 'sidebar-desktop-gone' });
    await expect(page.getByTestId('artwork-grid')).toBeVisible();

    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`gallery-${testInfo.project.name}.png`, { body: shot, contentType: 'image/png' });

    // PROMPT.md doklejamy raz — zrzuty z pozostałych projektów są w tym samym raporcie HTML.
    if (testInfo.project.name === 'desktop-light') {
      await testInfo.attach('PROMPT.md (do Cursora)', {
        body: responsiveDiffPrompt(
          'Kontekst: /gallery Pixelarium. Porównaj zrzuty per projekt: ' +
            'mobile-light (< lg → pasek chipów) vs desktop-light/desktop-dark (≥ lg → boczny sidebar filtrów). ' +
            'Zwinięcie sidebara do chipów poniżej lg = zamierzony responsive. ' +
            'Sidebar znikający także na desktopie (bez chipów) = bug.',
        ),
        contentType: 'text/markdown',
      });
    }

    console.log(`\n📋 [gallery-responsive] zrzut ${testInfo.project.name} w raporcie → analiza w Cursorze\n`);
  });
});
