---
name: vrt-spec
description: Author one deterministic Playwright visual-regression spec (a *.visual.spec.ts with toHaveScreenshot) for a single page in this repo. Opens the page with Playwright MCP to read the REAL testids/roles and spot dynamic regions, then wires the existing Page Object + factory + mock-handlers into a stabilized screenshot test. Use when asked to "write a VRT / visual / screenshot test for the <gallery|login|cart|…> page". NOT for generating factory data (use vrt-factory), writing Page Objects, functional assertions, or tuning thresholds.
allowed-tools: Read Write Edit mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_take_screenshot
---

# vrt-spec — author a VRT spec for one page

The third skill of the S03 family (S03L03, Agent Skills dla VRT): `vrt-factory` produces the
**data**, `vrt-pom` the **Page Object**, this skill the **spec** that renders them and pins it
with a screenshot, and `vrt-i18n` multiplies that spec across **en/pl/de**. Four narrow skills,
not one moloch — SRP from S03L02 applied to skills.

One responsibility: **write a single deterministic `*.visual.spec.ts` for one page.**
It does not generate factory data, write Page Objects, add functional assertions, or
tune thresholds — those live in `vrt-factory`, `tests/pages/*.page.ts`, and the spec
author's own judgement.

## Why Playwright MCP

The failure mode of a generated spec is a **hallucinated locator** — `getByTestId('gallery')`
when the real attribute is `artwork-grid`. Open the page for real, read the accessibility
snapshot, and copy the testids/roles that actually exist. A spec built on invented
selectors passes review and fails on first run.

## Rules (non-negotiable)

- **Reuse the layers, don't inline them.** Import the page's Page Object from
  `tests/pages/<page>.page.ts`, data from `tests/fixtures/artwork.factory.ts`, and network
  stubs from `tests/fixtures/mock-handlers.ts`. If no Page Object exists for the page,
  **stop and say so** — creating it is a separate job, not this skill's.
- **The determinism stack goes in `beforeEach`, before `goto`:**
  1. `await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'));` — freeze time.
  2. `await mockAllApis(page);` — deterministic network **before** navigation.
  3. navigate via the Page Object (`await pageObj.open();`), then `await stabilizePage(page);`.
- **Wait with an explicit web assertion, never `networkidle`** (`stabilizePage` already does
  the `getByRole('main')` wait — reuse it; see S01L03).
- **Mask dynamic regions**, don't fight them: pass `mask: pageObj.dynamicRegions()` (or the
  real `getByTestId('live-counter')` / `'countdown-timer'`) to `toHaveScreenshot`.
- **Screenshot a stable container**, not the raw full page, unless a full-page shot is the
  point (then `fullPage: true`). Give every snapshot a stable, descriptive name
  (`s03-<page>-<state>.png`) — the name is the baseline key.
- **Inherit config defaults.** `playwright.config.ts` already sets `threshold: 0.2`,
  `animations: 'disabled'`, `caret: 'hide'`, the three projects (desktop-light,
  mobile-light, desktop-dark) and `snapshotPathTemplate`. Do **not** hardcode snapshot
  paths or re-tune thresholds; override per-assertion only with a one-line reason.
- **File location:** `tests/visual/<session>/<id>-<slug>.visual.spec.ts` (e.g.
  `tests/visual/s03/s03-l02-page-object.visual.spec.ts`). `testMatch` is `**/*.visual.spec.ts`.

## Steps

1. **Locate the layers.** Read the page's Page Object, the factory function it needs, and
   `mock-handlers.ts`. Confirm the route (`pageObj.path`) and which factory list feeds it.
2. **Open the page for real.** With Playwright MCP: `browser_navigate` to
   `http://localhost:5173<path>`, then `browser_snapshot` to read the actual testids/roles
   and see which regions move (counters, timers, "live" widgets) → those get masked.
   *Fallback if MCP isn't connected:* read `app/src/pages/<Page>.tsx` and the existing POM to
   source real selectors, and say you used the source instead of the browser.
3. **Write the spec.** `test.describe` → `beforeEach` (clock + mock + `open()` +
   `stabilizePage`) → one `test` per state (default, and error/empty if relevant), each
   ending in a single `toHaveScreenshot` on a stable locator with masks.
4. **State how to baseline & verify determinism.** Tell the user to run
   `npx playwright test <file> --update-snapshots` once to create baselines, then re-run
   plain to confirm **0 diff**; run 2–3× to prove the screenshot is stable across runs and
   across the config's projects.

## Example

**Input:** *"Write a VRT test for the gallery page."*

**Output:** `tests/visual/s03/s03-gallery.visual.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { GalleryPage } from '../../pages/gallery.page';
import { mockAllApis, stabilizePage } from '../../fixtures/mock-handlers';
import { createArtworkList } from '../../fixtures/artwork.factory';

test.describe('VRT – gallery page', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z')); // freeze time
    await mockAllApis(page);                                         // network before goto
  });

  test('gallery grid – deterministic screenshot', async ({ page }) => {
    const gallery = new GalleryPage(page);
    await gallery.open();
    await stabilizePage(page);

    // testid confirmed via Playwright MCP snapshot, not guessed
    await expect(gallery.cards()).toHaveCount(createArtworkList(6).length);

    await expect(gallery.grid).toHaveScreenshot('s03-gallery-grid.png', {
      mask: gallery.dynamicRegions(), // live-counter / countdown → masked, not fought
    });
  });
});
```

Then: `npx playwright test tests/visual/s03/s03-gallery.visual.spec.ts --update-snapshots`
to baseline, re-run to confirm 0 diff, run 3× for determinism.

## Comments in generated code

Keep the output lean. A **2–3 line file header** (the page + why determinism needs both
clock and mock, in one breath) — then let the code speak. **No step-by-step narration
inline** (drop the `// 1) freeze clock`, `// network before goto`, `// pixel-perfect…`
beats). Add a single short `//` only where a choice is genuinely non-obvious (e.g. "bez
maski — dynamikę załatwia clock+mock"). On video the *spoken* narration carries the "why".

## Guardrails

- If the request is really about **mock data / a factory**, hand off to `vrt-factory`.
  If it's about **writing a Page Object**, **functional (non-visual) assertions**, or
  **threshold/masking strategy tuning**, say this skill doesn't cover it and point to the
  relevant S03 lesson.
- Never invent a testid or role — confirm it in the live snapshot (or the page source) first.
- The human approves the trigger and the final spec; the skill accelerates, it doesn't decide.
```
