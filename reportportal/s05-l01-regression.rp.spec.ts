/**
 * S05L01: kontrolowana regresja, czyli materiał do ćwiczenia etykiet defektu.
 *
 * Domyślnie ta specka jest ZIELONA. Regresję włącza zmienna `RP_DEMO`, która dokleja
 * do adresu parametr `?vrt=<case>`, a aplikacja nakłada wtedy klasę psującą wygląd.
 * Nic nie trzeba psuć w kodzie produkcyjnym.
 *
 *   RP_DEMO=design npm run test:vrt:rp   # celowa zmiana designu, czyli nieaktualny baseline
 *   RP_DEMO=bug    npm run test:vrt:rp   # realny błąd produktu: znika kontrast nagłówka karty
 *   RP_DEMO=noise  npm run test:vrt:rp   # szum na pół piksela, czyli test do wyrzucenia
 *
 * Trzy przypadki nie są ozdobnikiem. Odpowiadają trzem różnym etykietom w ReportPortalu
 * i o to właśnie chodzi w lekcji o warstwie AI: ten sam czerwony wynik znaczy trzy różne rzeczy,
 * a model uczy się dokładnie tego, co mu podpiszesz.
 */
import { test, expect } from '@playwright/test';
import { ReportingApi } from '@reportportal/agent-js-playwright';
import { GalleryPage } from '../tests/pages/gallery.page';
import { mockAllApis, stabilizePage } from '../tests/fixtures/mock-handlers';
import { attributesForProject } from './rp.attributes';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');
const ARTWORKS_ON_FIRST_PAGE = 6;

/** Klucz z RP_DEMO na klasę demo w aplikacji, plus podpowiedź, jak to oznaczyć w panelu. */
const DEMO_CASES: Record<string, { vrtCase: string; expectedLabel: string }> = {
  design: { vrtCase: 'card-design', expectedLabel: 'Automation Bug: baseline jest nieaktualny' },
  bug: { vrtCase: 'card-contrast', expectedLabel: 'Product Bug: nagłówek karty traci kontrast' },
  noise: { vrtCase: 'header-szum', expectedLabel: 'No Defect: przesunięcie o ułamek piksela' },
};

const demo = process.env.RP_DEMO ? DEMO_CASES[process.env.RP_DEMO] : undefined;
const galleryUrl = demo ? `/gallery?vrt=${demo.vrtCase}` : '/gallery';

test.describe('S05L01: regresja pod etykietę defektu', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await mockAllApis(page);
  });

  test('Gallery: ten sam zrzut, trzy różne przyczyny czerwonego wyniku', async ({
    page,
  }, testInfo) => {
    ReportingApi.addAttributes([
      ...attributesForProject(testInfo.project.name),
      { key: 'demo', value: process.env.RP_DEMO ?? 'off' },
    ]);

    // Opis trafia do panelu razem z wynikiem, więc recenzent widzi, czego się spodziewać,
    // zanim otworzy załączniki.
    ReportingApi.setDescription(
      demo
        ? `Regresja demo \`${process.env.RP_DEMO}\`. Oczekiwana etykieta: ${demo.expectedLabel}.`
        : 'Bieg czysty, bez wstrzykniętej regresji.',
    );

    // Nawigacja jest ręczna, bo GalleryPage.open() nie zna parametru demo.
    // Locatory Page Objectu działają niezależnie od tego, jak weszliśmy na stronę.
    const gallery = new GalleryPage(page);
    await page.goto(galleryUrl);
    await stabilizePage(page);
    await expect(gallery.cards()).toHaveCount(ARTWORKS_ON_FIRST_PAGE);

    // Playwright sam dopina expected, actual i diff do wyniku testu, a agent sam wysyła
    // je do ReportPortala jako załączniki. Ręczny testInfo.attach() jest tu zbędny.
    await expect(page).toHaveScreenshot('gallery-regression.png', { maxDiffPixels: 120 });
  });
});
