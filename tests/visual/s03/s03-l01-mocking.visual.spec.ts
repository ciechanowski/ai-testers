/**
 * S03L01 – page.route() + TypeScript factory functions
 *
 * Demonstrates:
 *   - page.route() to intercept API requests
 *   - TypeScript factory functions for deterministic mock data
 *   - clock + mock = full pixel-perfect determinism
 *
 * Fixtures used:
 *   tests/fixtures/mock-handlers.ts → mockAllApis(), stabilizePage()
 *   tests/fixtures/artwork.factory.ts → createArtworkList()
 */
import { test, expect } from '@playwright/test';
import { mockAllApis, stabilizePage } from '../../fixtures/mock-handlers';
import { createArtworkList } from '../../fixtures/artwork.factory';

test.describe('Gallery / mocked API', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await mockAllApis(page);
    await page.goto('/gallery');
    await stabilizePage(page);
  });

  test('gallery with factory data – always same artwork cards', async ({
    page,
  }) => {
    await expect(page.getByTestId('artwork-grid')).toBeVisible();

    // Factory returns exactly 6 artworks with fixed IDs, titles, prices
    // No API randomness → pixel-perfect comparison
    await expect(page.getByTestId('artwork-grid')).toHaveScreenshot(
      's03-gallery-mocked.png',
    );
  });

  test('gallery page count matches factory', async ({ page }) => {
    const artworks = createArtworkList(6);
    const cards = page.getByTestId('artwork-grid').locator('article');

    // Factory returns 6 → grid shows 6 (page size matches)
    await expect(cards).toHaveCount(artworks.length);

    await expect(page).toHaveScreenshot('s03-gallery-full-mocked.png', {
      fullPage: true,
    });
  });
});

test.describe('Login form with filled inputs (deterministic data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('form with filled inputs – deterministic content', async ({ page }) => {
    // Fill with deterministic test data (factory-style hardcoded values)
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password|hasło|passwort/i).fill('Test1234!');

    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await expect(form).toHaveScreenshot('s03-login-filled.png');
  });

  test('form with error state', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@test.com');
    await page.getByLabel(/password|hasło|passwort/i).fill('wrong');

    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await form.getByRole('button', { name: /sign in|zaloguj|anmeld/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();

    await expect(page).toHaveScreenshot('s03-login-error.png', {
      fullPage: true,
    });
  });
});
