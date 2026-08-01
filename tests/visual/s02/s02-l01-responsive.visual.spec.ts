import { test, expect } from '@playwright/test';

const FROZEN_TIME = new Date('2026-01-15T12:00:00Z');

test.describe('About page / responsive', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('hero section across viewports', async ({ page }) => {
    const hero = page.locator('section').filter({ hasText: /our story|nasza historia|geschichte/i }).first();
    await expect(hero).toBeVisible();

    await expect(hero).toHaveScreenshot('about-hero.png');
  });
});

test.describe('Header / responsive navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('header desktop vs mobile collapse', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    await expect(header).toHaveScreenshot('header.png', { threshold: 0.1 });
  });
});

test.describe('Mobile menu / hamburger flow', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.startsWith('mobile'),
      'Hamburger menu is mobile-only (flex md:hidden in Header.tsx)',
    );

    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/');
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('mobile drawer — full open state', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /open menu|otwórz menu|menü öffnen/i });
    await hamburger.click();

    const drawer = page.getByRole('dialog', { name: 'Navigation' });
    await expect(drawer).toBeVisible();

    await expect(drawer).toHaveScreenshot('mobile-drawer.png', { threshold: 0.1 });

    await expect(drawer).toMatchAriaSnapshot({ name: 'mobile-drawer.aria.yml' });
  });
});

test.describe('Gallery / responsive grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FROZEN_TIME);
    await page.goto('/gallery');
    await expect(page.getByTestId('artwork-grid')).toBeVisible();
  });

  test('artwork grid — kolumny zmieniają się per viewport', async ({ page }) => {
    await expect(page.getByTestId('artwork-grid')).toHaveScreenshot('gallery-grid.png', {
      threshold: 0.3,
      maxDiffPixelRatio: 0.01,
    });
  });
});
