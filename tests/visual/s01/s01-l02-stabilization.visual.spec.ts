import { test, expect } from '@playwright/test';

test.describe('1. Homepage — clock + mask dla dynamicznej treści', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('full page matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
    });
  });

  test('hero section matches baseline', async ({ page }) => {
    const hero = page.getByTestId('hero-section');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('homepage-hero.png', {
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
    });
  });

  test('navigation matches baseline', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeVisible();
    await expect(nav).toHaveScreenshot('homepage-nav.png');
  });
});

test.describe('2. Gallery — clock + explicit assertion', () => {
  test('gallery page matches baseline', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/gallery');
    await expect(page.getByTestId('artwork-grid')).toBeVisible();
    await expect(page).toHaveScreenshot('gallery-full.png', { fullPage: true });
  });
});

test.describe('3. Gotowość strony: web assertion zamiast networkidle', () => {
  test('gallery — ready via explicit assertion', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/gallery');
    await expect(page.getByTestId('artwork-grid')).toBeVisible();
    await expect(page.getByRole('banner')).toHaveScreenshot('gallery-ready-header.png');
  });
});
