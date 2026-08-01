import { test, expect } from '@playwright/test';

test.describe('1. Pierwszy test VRT — bez clock', () => {
  test('about page — fullPage screenshot', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveScreenshot('about-first.png', { fullPage: true });
  });
});

test.describe('2. Element screenshot', () => {
  test('login form — element scope', async ({ page }) => {
    await page.goto('/login');
    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await expect(form).toBeVisible();
    await expect(form).toHaveScreenshot('login-form-first.png');
  });
});
