import { test, expect } from '@playwright/test';

test.describe('Homepage / stabilized', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('hero with frozen clock — no flake from countdown', async ({ page }) => {
    const hero = page.getByTestId('hero-section');
    await expect(hero).toHaveScreenshot('hero-stabilized.png', {
      mask: [page.getByTestId('live-counter')],
    });
  });

  test('full page — all dynamic elements handled', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-stabilized-full.png', {
      fullPage: true,
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
      maskColor: '#FF00FF',
    });
  });
});

test.describe('Masking techniques', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('mask dynamic region — layout preserved', async ({ page }) => {
    await expect(page.getByTestId('hero-section')).toHaveScreenshot(
      'hero-masked.png',
      {
        mask: [
          page.getByTestId('live-counter'),
          page.getByTestId('countdown-timer'),
        ],
        maskColor: '#FF00FF',
      },
    );
  });

  test('footer — mask copyright year', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveScreenshot('footer-masked.png', {
      mask: [page.locator('footer').getByText(/© \d{4}/)],
    });
  });
});

test.describe('Login / caret stabilization', () => {
  test('empty form — caret hidden globally, no flake', async ({ page }) => {
    await page.goto('/login');
    const form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    await expect(form).toBeVisible();
    await expect(form).toHaveScreenshot('login-empty.png');
  });
});

test.describe('Live board / masking — /live', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/live');
    await expect(page.getByTestId('live-board')).toBeVisible();
  });

  test('mask all random live regions — layout preserved', async ({ page }) => {
    await expect(page.getByTestId('live-board')).toHaveScreenshot('live-board.png', {
      mask: [
        page.getByTestId('bid-ticker'),
        page.getByTestId('online-now'),
        page.getByTestId('server-latency'),
        page.getByTestId('session-id'),
        page.getByTestId('live-counter'),
      ],
      maskColor: '#FF00FF',
    });
  });
});
