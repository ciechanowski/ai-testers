import { test, expect } from '@playwright/test';

/**
 * S01 L04 — Homework SOLUTION (/studio). Poza suite (.solution.spec.ts ≠ testMatch).
 *
 * Klucz must/should/nice:
 *   - MASKUJ (must_mask) tylko elementy LOSOWE (Math.random): revenue, viewers,
 *     conversion, session, feed. Różnią się między runami → bez maski = flake.
 *   - NIE maskuj elementów czasowych (payout, updated, clock) — page.clock je
 *     zamraża, więc są stałe. Maska tutaj = strata sygnału.
 *   - studio-pulse (CSS animate-ping) łapie animations:'disabled' z configu.
 *   - studio-topsale = ze statycznego JSON → stałe w teście, maska zbędna.
 * Scope screenshotu = kontener studio-dashboard (izolacja od reszty strony).
 */
test.describe('Homework SOLUTION · /studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/studio');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('full page — must_mask zamaskowane, czas zamrożony', async ({ page }) => {
    const dashboard = page.getByTestId('studio-dashboard');
    await expect(dashboard).toHaveScreenshot('studio-dashboard.png', {
      mask: [
        page.getByTestId('studio-revenue'),
        page.getByTestId('studio-viewers'),
        page.getByTestId('studio-conversion'),
        page.getByTestId('studio-session'),
        page.getByTestId('studio-feed'),
      ],
      maskColor: '#FF00FF',
    });
  });

  test('element — panel wypłaty (tylko czas, bez maski)', async ({ page }) => {
    // payout + updated zależą wyłącznie od zegara → stabilne bez maski
    const payout = page.getByTestId('studio-payout');
    await expect(payout).toBeVisible();
    await expect(payout).toHaveScreenshot('studio-payout.png');
  });
});
