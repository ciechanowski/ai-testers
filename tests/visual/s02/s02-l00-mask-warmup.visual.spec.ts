import { test, expect } from '@playwright/test';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

test.describe('Warm-up Dnia 2 / maska w nawyk', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('footer — maska na dynamiczny rok copyright', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toHaveScreenshot('s02-l00-footer-masked.png', {
      mask: [page.locator('footer').getByText(/© \d{4}/)],
      maskColor: '#FF00FF',
    });
  });
});
