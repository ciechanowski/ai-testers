import { test, expect } from '@playwright/test';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

test.describe('Header / structural', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('banner landmark — design + structure', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    await expect(header).toHaveScreenshot('s02-header.png');

    await expect(header).toMatchAriaSnapshot({ name: 's02-header.aria.yml' });
  });
});

test.describe('Main navigation / structural', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('main nav — pixel-perfect + accessible structure', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot('s02-main-nav.png', { threshold: 0 });

    await expect(nav).toMatchAriaSnapshot({ name: 's02-main-nav.aria.yml' });
  });
});

test.describe('Login form / structural', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/login');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('login form — pola wymagane mają labele i error states', async ({ page }) => {
    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await expect(form).toBeVisible();

    await expect(form).toHaveScreenshot('s02-login-form.png', { threshold: 0.1 });

    await expect(form).toMatchAriaSnapshot({ name: 's02-login-form.aria.yml' });
  });
});
