import { test, expect } from '@playwright/test';

test.describe('Element screenshots', () => {
  test('footer component', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveScreenshot('footer.png', {
      mask: [page.locator('footer')],
    });
  });
});

test.describe('Full page screenshots', () => {
  test('login page — form-centric, full page works well', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page).toHaveScreenshot('login-full.png', {
      fullPage: true,
    });
  });
});
