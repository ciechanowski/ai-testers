import { test, expect } from '@playwright/test';
import { htmlAnalyzerPrompt, flakeRootCausePrompt } from '../ai/prompts';
import { gotoDemo } from '../ai/demo-url';

const BID_TICKER = '[data-testid="bid-ticker"]';

const DYNAMIC_TESTIDS = [
  'bid-ticker',
  'online-now',
  'server-latency',
  'session-id',
  'live-counter',
  'countdown-timer',
  'last-updated',
];

test('HTML Analyzer — które elementy live-board zamaskować?', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
  await gotoDemo(page, testInfo, '/live');
  const board = page.getByTestId('live-board');
  await expect(board).toBeVisible();

  const html = await board.evaluate((el) => el.outerHTML);

  for (const testid of DYNAMIC_TESTIDS) {
    expect(html, `live-board musi zawierać dynamiczny element ${testid}`).toContain(
      `data-testid="${testid}"`,
    );
  }

  await testInfo.attach('live-board.html', { body: html, contentType: 'text/html' });
  await testInfo.attach('PROMPT.md (do Cursora)', { body: htmlAnalyzerPrompt(), contentType: 'text/markdown' });
  console.log('\n📋 [html-analyzer] live-board.html + PROMPT.md w raporcie → analiza w Cursorze\n');
});

test('Flake Root-Cause — prawdziwy przeciek dynamic content', async ({ page }, testInfo) => {
  await gotoDemo(page, testInfo, '/live');
  const board = page.getByTestId('live-board');
  await expect(board).toBeVisible();

  const baseline = await board.screenshot();
  const baseText = await page.locator(BID_TICKER).textContent();

  await page.waitForFunction(
    (prev) => document.querySelector('[data-testid="bid-ticker"]')?.textContent !== prev,
    baseText,
    { timeout: 6_000 },
  );
  const actual = await board.screenshot();
  const html = await board.evaluate((el) => el.outerHTML);

  await testInfo.attach('baseline', { body: baseline, contentType: 'image/png' });
  await testInfo.attach('actual', { body: actual, contentType: 'image/png' });
  await testInfo.attach('live-board.html', { body: html, contentType: 'text/html' });
  await testInfo.attach('PROMPT.md (do Cursora)', { body: flakeRootCausePrompt(), contentType: 'text/markdown' });
  console.log('\n📋 [flake-root-cause] baseline/actual/live-board.html + PROMPT.md w raporcie → analiza w Cursorze\n');

  expect(baseline.equals(actual), 'baseline i actual powinny się różnić (prawdziwy flake)').toBe(false);
});
