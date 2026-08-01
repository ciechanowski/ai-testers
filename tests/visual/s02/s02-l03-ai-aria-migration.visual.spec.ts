import { test, expect } from '@playwright/test';
import { ariaMigrationPrompt } from '../ai/prompts';
import { gotoDemo } from '../ai/demo-url';

const BEFORE_ARIA = [
  '- navigation "Main":',
  '  - text "Home"',
  '  - text "Gallery"',
  '  - text "About"',
  '  - text "Cart"',
  '  - text "Login"',
].join('\n');

test('ARIA Migration — before/after drzewa dostępności nawigacji', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'uruchamiane raz (struktura niezależna od viewportu)');

  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
  await gotoDemo(page, testInfo, '/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav).toBeVisible();

  const afterAria = await nav.ariaSnapshot();

  await testInfo.attach('before.aria.yml', { body: BEFORE_ARIA, contentType: 'text/yaml' });
  await testInfo.attach('after.aria.yml', { body: afterAria, contentType: 'text/yaml' });
  await testInfo.attach('PROMPT.md (do Cursora)', {
    body: ariaMigrationPrompt(
      'Komponent: nawigacja główna (getByRole navigation "Main"). before = linki jako <div>/text (niedostępne), after = natywne <nav>/<a> z aplikacji.',
    ),
    contentType: 'text/markdown',
  });
  console.log('\n📋 [aria-migration] before/after .aria.yml + PROMPT.md w raporcie → analiza w Cursorze\n');

  expect(afterAria).toContain('link');
});
