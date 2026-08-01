---
name: vrt-pom
description: Author one Page Object class (tests/pages/<page>.page.ts) for a single page in this repo. Extends BasePage, exposes readonly locators + action methods, ZERO assertions (SRP). Opens the page with Playwright MCP to read the REAL roles/labels/testids so locators aren't guessed, prefers getByRole/getByLabel/getByTestId, and keeps names i18n-safe (the app is en/pl/de). Use when asked to "write / create a Page Object / POM for the <gallery|cart|login|…> page". NOT for factory data (use vrt-factory), assertions or screenshots (use vrt-spec), or threshold tuning.
allowed-tools: Read Write Edit mcp__playwright__browser_navigate mcp__playwright__browser_snapshot
---

# vrt-pom — a Page Object for one page

The second skill of the S03 family (SRP applied to skills — one skill, one job):

- `vrt-factory` → the **data**
- **`vrt-pom` → the Page Object** (locators + actions, zero assertions) ← this skill
- `vrt-spec` → the **spec** (assertions + VRT), which *reuses* the Page Object
- `vrt-i18n` → the **locale axis** (en/pl/de) of an existing spec

One responsibility: **write a single `tests/pages/<page>.page.ts` class.** It does not
generate data, write assertions/screenshots, or tune thresholds — those live in
`vrt-factory` and `vrt-spec`.

## Why Playwright MCP

The failure mode of a generated Page Object is a **hallucinated locator** —
`getByTestId('gallery')` when the real attribute is `artwork-grid`, or a hard-coded
English name on a page that also ships Polish and German. Open the page for real, read
the accessibility snapshot, and copy roles/labels/testids that actually exist.

## Rules (non-negotiable)

- **Extend `BasePage`** (`tests/pages/base.page.ts`). Inherit `banner`/`nav`/`footer`,
  `open()`, and `dynamicRegions()`; declare `readonly path = '/…'`. Add a new page as a
  **new subclass** (OCP) — don't edit the base.
- **SRP — locators and actions only. ZERO assertions.** No `expect`, no `toHaveScreenshot`,
  no counts — the spec owns those. One reason to change: the page's UI changed.
- **Locator priority (repo + Playwright best practice):**
  `getByRole` / `getByLabel` → `getByTestId` → last resort a scoped CSS locator. Never a
  brittle absolute path.
- **i18n-safe names.** This app runs en/pl/de, so accessible names are localized. Match the
  house pattern: a case-insensitive regex covering the locales
  (`getByRole('form', { name: /sign in|zaloguj|anmeld/i })`), **or** prefer a stable
  `data-testid` when the name would need three languages.
- **Locators are `readonly` fields** assigned in the constructor after `super(page)`.
  Expose a **method returning a `Locator`** when the spec needs to count/iterate children
  (e.g. `cards(): Locator`); expose an **`async` method** for a user action (`fill`,
  `submit`) — actions only, still no assertions.
- **Match the house style** already in `tests/pages/gallery.page.ts` and `login.page.ts`
  (concise doc-comment naming the SRP, `readonly` locators, `type Page/Locator` imports).

## Steps

1. **Read `base.page.ts` + one existing Page Object** (`gallery.page.ts` or `login.page.ts`)
   to lock onto the exact style, the inherited members, and `dynamicRegions()`.
2. **Open the page for real.** With Playwright MCP: `browser_navigate` to
   `http://localhost:5173<path>`, then `browser_snapshot` to read the actual roles/labels/
   testids and confirm localized names. *Fallback if MCP isn't connected:* read
   `app/src/pages/<Page>.tsx`, and say you sourced selectors from the component, not the browser.
3. **Write the class.** `readonly path`, `readonly` locator fields in the constructor,
   `Locator`-returning getters for collections, `async` action methods. No assertions.
4. **State how it plugs in.** Note that the spec instantiates it, calls `open()`, and adds
   the assertions/`toHaveScreenshot` — hand off to `vrt-spec` for that step.

## Example

**Input:** *"Create a Page Object for the cart page."*

**Output:** `tests/pages/cart.page.ts`

```ts
import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * CartPage – strona /cart. Tylko locatory + akcje (SRP). Zero asercji.
 */
export class CartPage extends BasePage {
  readonly path = '/cart';
  readonly list: Locator;
  readonly total: Locator;
  readonly checkout: Locator;

  constructor(page: Page) {
    super(page);
    // testid confirmed via Playwright MCP snapshot, not guessed
    this.list = page.getByTestId('cart-items');
    this.total = page.getByTestId('cart-total');
    // name is localized (en/pl/de) → i18n-safe regex, not a hard-coded string
    this.checkout = page.getByRole('button', { name: /checkout|do kasy|zur kasse/i });
  }

  /** Wiersze koszyka (do asercji liczby w specu). */
  items(): Locator {
    return this.list.locator('li');
  }

  async removeFirst(): Promise<void> {
    await this.items().first().getByRole('button', { name: /remove|usuń|entfernen/i }).click();
  }
}
```

## Comments in generated code

Keep the output lean. A **2–3 line doc-comment** naming the page + the SRP ("locatory +
akcje, zero asercji") — then let the code speak. **No step-by-step narration inline** (drop
`// testid confirmed via…`, `// name is localized` beats). Add a single short `//` only where
a locator choice is genuinely non-obvious. On video the *spoken* narration carries the "why".

## Guardrails

- If the request is about **data / a factory**, hand off to `vrt-factory`. If it's about
  **assertions, counts, or screenshots**, hand off to `vrt-spec`. If a single `expect`
  creeps into the Page Object, it's the wrong skill — move it to the spec.
- Never invent a testid, role, or localized name — confirm it in the live snapshot (or the
  page source) first.
- The human reviews the generated Page Object; the skill accelerates, it doesn't decide.
```
