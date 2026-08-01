import { test, expect } from '@playwright/test';
import { darkModeAuditPrompt } from '../ai/prompts';
import { gotoDemo } from '../ai/demo-url';

const FROZEN = new Date('2026-01-15T12:00:00Z');

test('Dark Mode Audit — light vs dark do oceny kontrastu WCAG', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'uruchamiane raz (test sam przełącza motyw)');

  await page.clock.setFixedTime(FROZEN);
  await gotoDemo(page, testInfo, '/about', { bug: 'dark-contrast' });

  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await expect(page.locator('h1').first()).toBeVisible();
  const light = await page.screenshot({ fullPage: true });

  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('h1').first()).toBeVisible();
  const dark = await page.screenshot({ fullPage: true });

  await testInfo.attach('about-light.png', { body: light, contentType: 'image/png' });
  await testInfo.attach('about-dark.png', { body: dark, contentType: 'image/png' });
  await testInfo.attach('PROMPT.md (do Cursora)', {
    body: darkModeAuditPrompt('Kontekst: strona /about Pixelarium, ten sam widok w light i dark.'),
    contentType: 'text/markdown',
  });
  console.log('\n📋 [darkmode-audit] light/dark + PROMPT.md w raporcie → analiza w Cursorze\n');

  expect(Buffer.compare(light, dark) !== 0, 'light i dark powinny się różnić').toBe(true);
});
