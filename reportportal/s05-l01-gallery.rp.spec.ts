/**
 * S05L01: przebieg referencyjny wysyłany do ReportPortala.
 *
 * Ta specka ma być zielona zawsze. Jest po to, żeby w panelu było widać, jak wygląda
 * zdrowy launch: kroki jako zagnieżdżone pozycje, atrybuty na teście, zrzut jako załącznik.
 * Czerwony przebieg do ćwiczeń robi `s05-l01-regression.rp.spec.ts`.
 *
 * Klocki determinizmu są te same co w całym kursie: zamrożony zegar przed `goto`,
 * mock API i Page Object. Nowe jest tylko to, co dotyczy raportowania.
 *
 * Uruchomienie: npm run rp:up, potem npm run test:vrt:rp
 */
import { test, expect } from '@playwright/test';
import { ReportingApi } from '@reportportal/agent-js-playwright';
import { GalleryPage } from '../tests/pages/gallery.page';
import { mockAllApis, stabilizePage } from '../tests/fixtures/mock-handlers';
import { attributesForProject } from './rp.attributes';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

// mockAllApis serwuje 6 dzieł, GalleryPage ma PAGE_SIZE = 6.
const ARTWORKS_ON_FIRST_PAGE = 6;

test.describe('S05L01: galeria w ReportPortalu', () => {
  test.beforeEach(async ({ page }) => {
    // Zegar przed goto, nigdy po.
    await page.clock.setFixedTime(FROZEN_TIME);
    await mockAllApis(page);
  });

  test('Gallery: zrzut deterministyczny', async ({ page }, testInfo) => {
    // Atrybuty wchodzą na test, nie na przebieg, więc w panelu da się filtrować
    // pojedyncze przypadki po rozdzielczości i motywie, a nie tylko cały launch.
    ReportingApi.addAttributes(attributesForProject(testInfo.project.name));

    const gallery = new GalleryPage(page);

    await test.step('otwórz galerię', async () => {
      await gallery.open();
    });

    await test.step('poczekaj na komplet kart', async () => {
      await stabilizePage(page);
      await expect(gallery.cards()).toHaveCount(ARTWORKS_ON_FIRST_PAGE);
    });

    await test.step('porównaj z baseline', async () => {
      // Tolerancja przez maxDiffPixels, nigdy przez podnoszenie threshold.
      await expect(page).toHaveScreenshot('gallery.png', { maxDiffPixels: 120 });
    });
  });

  test('Homepage: zrzut z maską na regionach dynamicznych', async ({ page }, testInfo) => {
    ReportingApi.addAttributes(attributesForProject(testInfo.project.name));

    await page.goto('/');
    await stabilizePage(page);
    await expect(page.getByTestId('hero-section')).toBeVisible();

    // setFixedTime zamraża Date.now(), ale nie zatrzymuje setInterval, więc licznik
    // odwiedzin dalej rośnie, a odliczanie tyka. Maska zachowuje układ strony,
    // ukrycie przez CSS by go zmieniło.
    await expect(page).toHaveScreenshot('homepage.png', {
      mask: [page.getByTestId('live-counter'), page.getByTestId('countdown-timer')],
      maskColor: '#FF00FF',
      fullPage: false,
      maxDiffPixels: 120,
    });
  });
});
