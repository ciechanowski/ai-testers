---
name: vrt-i18n
description: Add the language axis (en/pl/de) to an EXISTING Playwright visual-regression spec for ONE page in this repo — wrap it in a per-locale describe with test.use({ locale }), give every snapshot a per-language name, and make accessible-name locators i18n-safe. Use when asked to "cover this page in all languages", "test pl/en/de", "add German to the VRT test", "does the layout break in German", "i18n visual test". Scope is one page at a time, never a sweep across the whole app. NOT for creating the spec itself (use vrt-spec), Page Objects (use vrt-pom), factory data (use vrt-factory), translating strings, or asserting that a translation is correct.
allowed-tools: Read Write Edit mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_click
---

# vrt-i18n — the language axis of one VRT spec

The fourth skill of the S03 family (SRP applied to skills — one skill, one job):

- `vrt-factory` → the **data**
- `vrt-pom` → the **Page Object** (locators + actions, zero assertions)
- `vrt-spec` → the **spec** (assertions + one screenshot per state)
- **`vrt-i18n` → the locale axis of an existing spec** ← this skill

One responsibility: **take a spec that already works in one language and parametrize it
over en/pl/de.** It does not create the spec, the Page Object, or the data. If the spec
doesn't exist yet, **stop and hand off to `vrt-spec`** — this skill multiplies an existing
artifact, it doesn't author one.

## How a test selects a locale (get this right or the test lies)

`app/src/i18n/index.ts` configures the detector as:

```ts
detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
```

**Use `test.use({ locale })`.** A fresh Playwright context has empty localStorage, so the
`localStorage` detector misses and `navigator` decides — and Playwright's `locale` drives
`navigator.language`, `Accept-Language` **and** `Intl`. Dates and prices come out
locale-correct, not just the copy.

Rejected alternatives, and why they matter:

- **`?lng=de`** — does not work. `querystring` is not in `detection.order`. The page renders
  `en` and the test passes while proving nothing.
- **Clicking `LanguageSwitcher`** — the page first loads in the wrong language, then
  re-renders. Setting state through the UI in the arrange step is the same anti-pattern as
  `page.setViewportSize()` inside a test body (S02L01).
- **`addInitScript` writing `localStorage['i18nextLng']`** — works, but couples the test to
  i18next's private cache key and leaves `navigator.language`/`Intl` at the default, so dates
  and prices render in the *wrong* locale while the text is translated. Escape hatch only.

**Use bare codes: `'en' | 'pl' | 'de'`, never `'de-DE'`.** Two things break with a region code:

- `app/src/utils/formatPrice.ts` looks up `currencyMap[lang]` and `localeMap[lang]` **exactly**.
  `'de-DE'` misses both and falls back to `USD` + `en-US` → US-formatted dollars on a German page.
- `LanguageSwitcher.tsx` marks the active button with `i18n.language === lng` against
  `['en','pl','de']`. With `'de-DE'` the comparison fails, so **no** button gets the active
  highlight or `aria-current` — corrupting the pixel *and* the ARIA baseline at once.

**The storageState trap.** `caches: ['localStorage']` means the app *writes* `i18nextLng` on
first render, and `localStorage` is **first** in `detection.order`. A spec reusing a saved
`storageState` will have the cached key beat `locale` and silently render the wrong language.
Drop `storageState` for locale runs, or clear the key in an init script.

## Rules (non-negotiable)

- **The locale axis lives in the spec, not in `playwright.config.ts`.** Do not add locale
  projects. `viewport` and `colorScheme` are projects because they apply to the whole suite;
  language is the concern of one spec. A new project without `testMatch` re-baselines all of
  S01+S02 in German, and 3 layouts × 3 languages = 9 projects and 3× the baselines to review
  in every PR. Wrap with `test.describe` + `test.use({ locale })` instead.
- **Put the language in the snapshot name.** `snapshotPathTemplate` is
  `{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}` — `{projectName}`
  separates desktop-light / mobile-light / desktop-dark and **nothing separates languages**.
  Name every snapshot `<page>-<state>-<lang>.png`. Reuse one name across locales and each run
  silently overwrites the same baseline.
- **Do NOT mask locale-formatted dates and prices.** They are the *signal* — a price that
  renders `€85,00` in de and `$92.00` in en is the thing under test. Only genuinely
  non-deterministic regions (`Math.random`, live counters) get masked, exactly as before.
- **Landmarks are locale-invariant in this app — do not "fix" them.** `Header.tsx` ships
  `aria-label="Main"`, `Footer.tsx` `"Footer"`, `LanguageSwitcher.tsx` `"Language"`, all
  hardcoded English. `BasePage`'s `banner`/`nav`/`footer` and the `getByRole('main')` wait work
  unchanged in all three locales.
- **Only `t()`-driven accessible names are localized** → i18n-safe regex or a testid, per
  `vrt-pom`: `getByRole('button', { name: /checkout|do kasy|zur kasse/i })`. Read the real
  strings from `app/src/i18n/locales/<lng>/<ns>.json`; never invent a translation.
- **Keep the determinism stack unchanged per locale.** `page.clock.setFixedTime(...)` and
  `mockAllApis(page)` before `goto`, then `stabilizePage(page)`.
- **Factory data is locale-invariant.** `artwork.factory.ts` titles and prices are mock data,
  not translations. The visual delta between locales is chrome text and `Intl` formatting only.
  Never ask `vrt-factory` for "German data".
- **Do not assert translation correctness.** VRT catches **layout** breakage — a German
  compound noun overflowing a fixed-width button. Missing keys and wrong copy are a different
  kind of test.
- **One page per spec. Never sweep the whole app.** The job is *one page × all languages*, not
  *all pages × all languages*. Covering ten pages in three locales is thirty baselines that all
  re-render on any shared-header change — nobody reviews that, so it rots. Pick the single page
  where language actually stresses the layout, and cover it properly. If asked to "add i18n
  tests everywhere", push back and name one page instead.
- **Budget the matrix and say the number out loud.** 3 locales × 3 projects × N states. Default
  to the full 3-locale sweep on `desktop-light` only, keeping other projects on `en`, unless
  the page is one where German actually overflows at a narrow width.

## Steps

1. **Read the existing spec and its Page Object.** Confirm the route and the current snapshot
   names. If no spec exists for the page, **stop and say so** — `vrt-spec` writes it first.
2. **Confirm the localized surface for real.** With Playwright MCP: `browser_navigate` to
   `http://localhost:5173<path>`, `browser_snapshot`, then `browser_click` the `Deutsch` button
   inside the `Language` group and snapshot again. (MCP's browser locale isn't settable —
   clicking the switcher is how you *see* `de`; the spec still uses `test.use({ locale })`.)
   Note which accessible names changed → those locators need the i18n-safe treatment.
   *Fallback if MCP isn't connected:* diff `app/src/i18n/locales/{en,pl,de}/<ns>.json` and say
   you sourced the strings from the locale files, not the browser.
3. **Wrap the spec** in `for (const lang of LANGS)` → `test.describe` → `test.use({ locale: lang })`.
4. **Rename every snapshot** to carry `-${lang}`.
5. **Baseline, then actually look.** `npx playwright test <file> --update-snapshots` once, re-run
   plain to confirm 0 diff — then **open the `de` baseline and review it**. A clipped button is
   a finding, not a flake. A green test on an unreviewed baseline proves nothing: the broken
   layout is now the reference.

## Example

**Input:** *"Cover the gallery page in all three languages."*

**Output:** `tests/visual/s03/s03-gallery-i18n.visual.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { GalleryPage } from '../../pages/gallery.page';
import { mockAllApis, stabilizePage } from '../../fixtures/mock-handlers';

const LANGS = ['en', 'pl', 'de'] as const;

for (const lang of LANGS) {
  test.describe(`VRT – gallery (${lang})`, () => {
    test.use({ locale: lang });

    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));
      await mockAllApis(page);
    });

    test(`gallery grid – ${lang}`, async ({ page }) => {
      const gallery = new GalleryPage(page);
      await gallery.open();
      await stabilizePage(page);

      await expect(gallery.grid).toHaveScreenshot(`s03-gallery-grid-${lang}.png`, {
        mask: gallery.dynamicRegions(),
      });
    });
  });
}
```

That is 9 baselines (3 locales × 3 projects). To keep it at 5, add inside the describe:

```ts
test.skip(({}, testInfo) => lang !== 'en' && testInfo.project.name !== 'desktop-light');
```

## Comments in generated code

Keep the output lean. A **2–3 line file header** (the page + why `locale` and not a click, in
one breath) — then let the code speak. **No step-by-step narration inline** (drop `// freeze
clock`, `// locale drives navigator` beats). Add a single short `//` only where a choice is
genuinely non-obvious (e.g. `// bare 'de' — 'de-DE' gubi podświetlenie w switcherze`). On
video the *spoken* narration carries the "why".

## Guardrails

- If the request is about **writing the spec**, hand off to `vrt-spec`. **Page Object** →
  `vrt-pom`. **Mock data** → `vrt-factory`. **Translating strings or adding a locale to the
  app** → not a testing job; say so.
- Never invent a translated accessible name — read it from
  `app/src/i18n/locales/<lng>/<ns>.json` or the live snapshot.
- The human reviews the German baseline; the skill accelerates, it doesn't decide what counts
  as "broken layout".
