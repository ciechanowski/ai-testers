/**
 * S03 Bonus (B01) – Threshold tuning per komponent (scope v7)
 *
 * Demonstrates:
 *   - threshold (0–1, dystans koloru per piksel w przestrzeni YIQ)
 *   - maxDiffPixels (próg bezwzględny w pikselach)
 *   - maxDiffPixelRatio (% wszystkich pikseli)
 *   - Reguła v7: domyślnie maxDiffPixels > threshold; threshold:0 wymaga Dockera
 *   - Dobór per komponent z uzasadnieniem (nie globalne 0.2 wszędzie)
 */
import { test, expect } from '@playwright/test';

test.describe('Threshold tuning per component', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('navigation – strict (static UI element)', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });

    // v7: nav to statyczne UI → próg bezwzględny maxDiffPixels: 50 (~0,1% komponentu).
    // threshold: 0 byłby ideałem, ale wymaga determinizmu cross-OS (Docker).
    await expect(nav).toHaveScreenshot('s03-nav-strict.png', {
      maxDiffPixels: 50,
    });
  });

  test('hero banner – moderate (gradient + text)', async ({ page }) => {
    const hero = page.getByTestId('hero-section');

    // v7: hero jest design-heavy (gradient + tekst). threshold: 0.1 toleruje
    // subpiksel, ale łapie shift koloru. 0.15 byłoby już zbyt liberalne.
    await expect(hero).toHaveScreenshot('s03-hero-moderate.png', {
      threshold: 0.1,
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
    });
  });

  test('featured artworks – relaxed (images + antialiased text)', async ({
    page,
  }) => {
    const featured = page
      .locator('section')
      .filter({ hasText: /featured|wyróżnione|empfohl/i });
    await expect(featured.first()).toBeVisible();

    // v7: galeria/obrazy – szum JPEG i anti-aliasing akceptowalne, ale ograniczone
    // do 2% pikseli. threshold: 0.15 kryje subpiksel, maxDiffPixelRatio: 0.02 trzyma skalę.
    await expect(featured.first()).toHaveScreenshot('s03-featured-relaxed.png', {
      threshold: 0.15,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Threshold via maxDiffPixels (absolute safety net)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
  });

  test('login form – strict threshold + small maxDiffPixels', async ({
    page,
  }) => {
    await page.goto('/login');

    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await expect(form).toBeVisible();

    // v7: formularz to niewielki, tekst-heavy komponent → próg bezwzględny
    // maxDiffPixels: 30 jest deterministyczny i łatwiejszy do obrony niż %.
    await expect(form).toHaveScreenshot('s03-login-strict.png', {
      maxDiffPixels: 30,
    });
  });

  test('about page – relaxed (% all pixels)', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();

    // v7: pełna strona z obrazami → threshold: 0.15 + maxDiffPixelRatio: 0.02
    // (maks. 2% pikseli). Spójnie z galerią.
    await expect(page).toHaveScreenshot('s03-about-relaxed.png', {
      fullPage: true,
      threshold: 0.15,
      maxDiffPixelRatio: 0.02,
    });
  });
});
