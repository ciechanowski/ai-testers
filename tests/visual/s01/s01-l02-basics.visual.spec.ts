import { test, expect } from '@playwright/test';

test.describe('Element screenshots', () => {
  test('header component — tight scope, less flake', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('header.png');
  });

  test('artwork card — single component', async ({ page }) => {
    await page.goto('/gallery');
    const firstCard = page.getByTestId('artwork-grid').locator('article').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveScreenshot('artwork-card-first.png');
  });
});

test.describe('Full page screenshots', () => {
  test('about page — static content, ideal for full page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page).toHaveScreenshot('about-full.png', {
      fullPage: true,
    });
  });
});

