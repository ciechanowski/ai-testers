import { test, expect } from '@playwright/test';
import { gotoDemo } from '../ai/demo-url';

const DEMO_CASES = { szum: 'header-szum', bug: 'header-logo' };

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
});

test('header — VRT gate (przy faile: triage w Cursorze)', async ({ page }, testInfo) => {
  await gotoDemo(page, testInfo, '/', DEMO_CASES);
  const banner = page.getByRole('banner');
  await expect(banner).toBeVisible();

  await expect(banner).toHaveScreenshot('header.png');
});
