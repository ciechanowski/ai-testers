import { test, expect } from '@playwright/test';

test.describe('Gallery page / main content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByTestId('artwork-grid')).toBeVisible();
  });

  test('gallery main — accessible structure', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toMatchAriaSnapshot({ name: 'gallery.aria.yml' });
  });
});
