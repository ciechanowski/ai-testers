import { test, expect } from '@playwright/test';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

test.describe('S02L02 / MCP-generated — zrewidowany szkielet', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('about — pixel + ARIA na landmarku main', async ({ page }) => {
    const main = page.getByRole('main');

    await expect(main).toHaveScreenshot('s02-l02-about-main.png', {
      mask: [page.locator('section[aria-label="Statistics"]')],
      maskColor: '#FF00FF',
      threshold: 0.2,
    });

    await expect(main).toMatchAriaSnapshot({ name: 's02-l02-about-main.aria.yml' });
  });
});
