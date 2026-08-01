import { test, expect } from '@playwright/test';
import { gotoDemo } from '../ai/demo-url';
import { explainerPrompt } from '../ai/prompts';

const DEMO_CASES = { design: 'card-design', bug: 'card-contrast' };

const CARD_CONTEXTS: Record<string, string> = {
  design: 'Karta dzieła (pierwsza w gridzie na /gallery) — Tailwind. Ten PR celowo aktualizuje ' +
    'design system (tokeny i style komponentów). Oceń z diffa, czy zmiana jest z nim spójna.',
  bug: 'Karta dzieła (pierwsza w gridzie na /gallery) — design system Tailwind.',
  diff: 'Karta dzieła (pierwsza w gridzie na /gallery) — design system Tailwind.',
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;
  const key = process.env.VRT_DEMO ?? 'diff';
  await testInfo.attach('PROMPT.md (do Cursora)', {
    body: explainerPrompt(CARD_CONTEXTS[key] ?? CARD_CONTEXTS.diff),
    contentType: 'text/markdown',
  });
});

test('artwork card — VRT gate (przy faile: explainer w Cursorze)', async ({ page }, testInfo) => {
  await gotoDemo(page, testInfo, '/gallery', DEMO_CASES);
  await expect(page.getByTestId('artwork-grid')).toBeVisible();
  const card = page.getByTestId('artwork-grid').locator('article').first();
  await expect(card).toBeVisible();

  await expect(card).toHaveScreenshot('artwork-card.png');
});
