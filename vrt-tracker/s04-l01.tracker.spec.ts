/**
 * S04L01: Visual Regression Tracker, czyli baseline w bazie zamiast w repozytorium.
 *
 * Nie ma tu `toHaveScreenshot()` ani plików PNG. Agent wysyła zrzut do trackera,
 * a baseline, różnica i decyzja „approve albo reject” żyją w panelu na localhost:8082.
 * Klocki determinizmu zostają te same co w S03: zamrożony zegar, mock API, Page Object.
 *
 * Uruchomienie: npm run tracker:up, potem npm run test:vrt:tracker
 */
import { test, expect } from '@playwright/test';
import { PlaywrightVisualRegressionTracker } from '@visual-regression-tracker/agent-playwright';
import { GalleryPage } from '../tests/pages/gallery.page';
import { mockAllApis, stabilizePage } from '../tests/fixtures/mock-handlers';
import { loadVrtConfig, describeVrtConfig } from './vrt.config';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

// mockAllApis serwuje 6 dzieł, GalleryPage ma PAGE_SIZE = 6.
const ARTWORKS_ON_FIRST_PAGE = 6;

// Domyślne 2 dałyby trzy wpisy w panelu na jedną różnicę.
const NO_RETRY = 0;

test.describe('S04L01: VRT Tracker przez agenta Playwright', () => {
  let vrt: PlaywrightVisualRegressionTracker;

  test.beforeAll(async ({ browserName }) => {
    const config = loadVrtConfig();
    console.info(describeVrtConfig(config));

    // browserName to człon klucza wariantu w trackerze, obok nazwy, urządzenia,
    // systemu, rozdzielczości i gałęzi. Szczegóły klucza są w S04L03.
    vrt = new PlaywrightVisualRegressionTracker(browserName, config);
    await vrt.start();
  });

  test.afterAll(async () => {
    await vrt.stop();
  });

  test.beforeEach(async ({ page }) => {
    // Zegar przed goto, nigdy po.
    await page.clock.setFixedTime(FROZEN_TIME);
    await mockAllApis(page);
  });

  test('Gallery: zrzut deterministyczny, bez maski', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.open();
    await stabilizePage(page);
    await expect(gallery.cards()).toHaveCount(ARTWORKS_ON_FIRST_PAGE);

    await vrt.trackPage(
      page,
      'Gallery',
      {
        // page.screenshot() nie dziedziczy domyślnych opcji z expect.toHaveScreenshot.
        screenshotOptions: { animations: 'disabled', caret: 'hide' },
        agent: { os: process.platform, device: 'desktop' },
        comment: 'S04L01: gallery, mock API i zamrożony zegar',
      },
      NO_RETRY,
    );
  });

  test('Homepage: zrzut z maską na regionach dynamicznych', async ({ page }) => {
    await page.goto('/');
    await stabilizePage(page);
    await expect(page.getByTestId('hero-section')).toBeVisible();

    // setFixedTime zamraża Date.now(), ale nie zatrzymuje setInterval, więc licznik
    // odwiedzin dalej rośnie, a odliczanie tyka.
    const dynamicRegions = [
      page.getByTestId('live-counter'),
      page.getByTestId('countdown-timer'),
    ];

    await vrt.trackPage(
      page,
      'Homepage',
      {
        screenshotOptions: {
          mask: dynamicRegions,
          maskColor: '#FF00FF',
          animations: 'disabled',
          caret: 'hide',
          // Bez fullPage: karuzela opinii przełącza cytat co kilka sekund i nie ma
          // testid na samym cytacie. W kadrze 1920x1080 leży poniżej krawędzi.
          fullPage: false,
        },
        // Odpowiednik maxDiffPixelRatio po stronie trackera, nie mylić z threshold.
        // Alternatywa to ignoreAreas, ale bierze współrzędne zamiast locatorów,
        // więc obszary trwałe wygodniej rysować w panelu (S04L03).
        diffTollerancePercent: 1,
        agent: { os: process.platform, device: 'desktop' },
        comment: 'S04L01: homepage, licznik i odliczanie zamaskowane',
      },
      NO_RETRY,
    );
  });
});
