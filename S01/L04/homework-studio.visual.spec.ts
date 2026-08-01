import { test, expect } from '@playwright/test';

/**
 * VRT – Creator Studio (/studio)
 *
 * must_mask  – session, revenue, viewers, conversion, feed (random / live-API)
 * no mask    – payout, updated, clock (Date.now() frozen by page.clock)
 * no mask    – studio-pulse animate-ping killed by animations:'disabled' in config
 */

const FIXED_TIME = new Date('2026-01-15T12:00:00Z');

test.describe('VRT – Creator Studio (/studio)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_TIME);
    await page.goto('/studio');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('dashboard – element screenshot, must_mask with magenta', async ({ page }) => {
    await expect(page.getByTestId('studio-dashboard')).toHaveScreenshot('studio-dashboard.png', {
      mask: [
        page.getByTestId('studio-session'),
        page.getByTestId('studio-revenue'),
        page.getByTestId('studio-viewers'),
        page.getByTestId('studio-conversion'),
        page.getByTestId('studio-feed'),
      ],
      maskColor: '#FF00FF',
    });
  });

  test('full page – must_mask with magenta', async ({ page }) => {
    await expect(page).toHaveScreenshot('studio-fullpage.png', {
      mask: [
        page.getByTestId('studio-session'),
        page.getByTestId('studio-revenue'),
        page.getByTestId('studio-viewers'),
        page.getByTestId('studio-conversion'),
        page.getByTestId('studio-feed'),
      ],
      maskColor: '#FF00FF',
    });
  });

  test('payout – element screenshot without mask (frozen by page.clock)', async ({ page }) => {
    await expect(page.getByTestId('studio-payout')).toBeVisible();
    await expect(page.getByTestId('studio-payout')).toHaveScreenshot('studio-payout.png');
  });
});
