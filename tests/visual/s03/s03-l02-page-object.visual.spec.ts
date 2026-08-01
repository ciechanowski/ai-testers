/**
 * S03L02 – SOLID + Page Object + fixtures
 *
 * Warstwy (SRP – każda ma jeden powód do zmiany):
 *   - spec        → scenariusz + asercje (w tym VRT)
 *   - Page Object → locatory + akcje strony (zero asercji)
 *   - factory     → dane testowe (tests/fixtures/artwork.factory.ts)
 *   - mock-handlers → sieć / stabilizacja (tests/fixtures/mock-handlers.ts)
 * DIP: spec zależy od abstrakcji Page Object, nie od surowych locatorów.
 */
import { test, expect } from '@playwright/test';
import { GalleryPage } from '../../pages/gallery.page';
import { LoginPage } from '../../pages/login.page';
import { mockAllApis, stabilizePage } from '../../fixtures/mock-handlers';
import { createArtworkList } from '../../fixtures/artwork.factory';

test.describe('VRT przez Page Object (SOLID)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await mockAllApis(page); // sieć: fixture (przed goto)
  });

  test('gallery – VRT z danymi z factory przez Page Object', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.open();
    await stabilizePage(page);

    // dane z factory = jedno źródło prawdy (liczba kart == liczba artworks)
    await expect(gallery.cards()).toHaveCount(createArtworkList(6).length);

    // asercja VRT zostaje w SPEC, nie w Page Object
    await expect(gallery.grid).toHaveScreenshot('s03-pom-gallery.png', {
      threshold: 0.15,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login – VRT formularza przez Page Object', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.fill('test@example.com', 'Test1234!');

    await expect(login.form).toHaveScreenshot('s03-pom-login.png', {
      maxDiffPixels: 30,
    });
  });
});
