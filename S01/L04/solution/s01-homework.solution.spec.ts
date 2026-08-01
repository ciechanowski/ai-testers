import { test, expect } from '@playwright/test';

test.describe('Homepage / Basic VRT', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('full page — homepage with mask', async ({ page }) => {
    
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
      maskColor: '#FF00FF',
    });
  });

  test('hero section — element screenshot', async ({ page }) => {
    const hero = page.getByTestId('hero-section');
    await expect(hero).toBeVisible();

    await expect(hero).toHaveScreenshot('hero-section.png', {
      mask: [
        page.getByTestId('live-counter'),
        page.getByTestId('countdown-timer'),
      ],
    });
  });

  test('header navigation — element screenshot', async ({ page }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('header.png');
  });
});

test.describe('About Page / Static Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('full page — about with copyright mask', async ({ page }) => {
    
    await expect(page).toHaveScreenshot('about-full.png', {
      fullPage: true,
      mask: [page.locator('footer').getByText(/© \d{4}/)],
    });
  });

  test('footer with masked year', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();

    await expect(footer).toHaveScreenshot('about-footer.png', {
      mask: [page.locator('footer').getByText(/© \d{4}/)],
      maskColor: '#FF00FF',
    });
  });
});
