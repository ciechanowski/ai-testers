# Playwright & TypeScript — VRT Project Guidelines

> Conventions for writing **Visual Regression Tests (VRT)** — pixel screenshots and ARIA snapshots — with Playwright and TypeScript.
>
> This is the project's **reference document**. The agent memory (`CLAUDE.md`, and `AGENTS.md` once you add it) stays short and points here. Do not copy this file into memory; link to it.

---

## 0. For the AI agent reading this file

- **Never run tests automatically.** Propose the command; the author decides when to execute.
- **Never update baselines automatically.** `--update-snapshots` is a review step, not a fix for a red run.
- If a rule here conflicts with `AGENTS.md` / `CLAUDE.md`, **the memory file wins** and the conflict is a bug worth reporting.
- Sections 1-13 below are project standards, meant for humans and agents alike.

---

## 1. General Rules

- One test file per screen / component family. Group by component with one top-level `test.describe()` per component (see `tests/visual/s02/s02-l01-responsive.visual.spec.ts`).
- VRT runs against **mocked APIs and a frozen clock** — never against live backends with dynamic data.
- Target state: baselines generated in **Docker** (`mcr.microsoft.com/playwright`) so the render is identical everywhere. Until the project has a Docker step, generate baselines on the same OS as CI and prefer `maxDiffPixels` over `threshold`.

---

## 2. Test Structure

### 2.1 Always wrap tests in `test.describe`

```ts
// ✅ DO
test.describe('Homepage / visual', () => {
  test('matches baseline on desktop', async ({ page }) => { ... });
});

// ❌ DON'T
test('homepage looks ok', async ({ page }) => { ... });
```

### 2.2 Use `test.beforeEach` for shared stabilization

```ts
test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // clock BEFORE goto: after goto the page has already read Date.now()
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'));
    await page.route('**/api/**', mockHappyPath);
    await page.goto('/');
    // wait on a concrete element, never on network idleness
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('matches screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });
});
```

### 2.3 Use `test.step` instead of comments

```ts
test('checkout visual regression', async ({ page }) => {
  await test.step('Stabilize dynamic content', async () => { ... });
  await test.step('Navigate and capture', async () => { ... });
  await test.step('Assert ARIA structure', async () => { ... });
});
```

---

## 3. Screenshot Rules

### 3.1 Always stabilize before capture

- `page.clock.setFixedTime(...)` — **before `page.goto()`, never after.** This ordering is not optional: after `goto` the page has already read `Date.now()` and started its intervals, so freezing the clock afterwards is a no-op and the test still flakes.
- Wait for a concrete locator: `await expect(hero).toBeVisible()`.
- **Never `page.waitForLoadState('networkidle')`.** Playwright marks the value DISCOURAGED, and under polling or analytics the idle state never arrives, so the test hangs to the timeout and reports a misleading "timeout" instead of a diff.
- `animations: 'disabled'` and `caret: 'hide'` are already the defaults for `toHaveScreenshot()`. Set them explicitly only for the lower-level `page.screenshot()` / `locator.screenshot()`.

### 3.2 Mask dynamic regions, don't delete them

```ts
// ✅ DO — mask so layout is still verified
await expect(page).toHaveScreenshot({
  mask: [page.getByTestId('live-timestamp'), page.getByRole('region', { name: 'Ads' })],
  maskColor: '#FF00FF',
});

// ❌ DON'T — hiding via CSS changes layout and hides real bugs
await page.addStyleTag({ content: '.timestamp { display: none }' });
```

A mask paints over the element but the element **keeps its box**, which is exactly why it beats `display: none`: neighbours do not jump. `#FF00FF` is also Playwright's default; we state it so masked regions are unmistakable in review.

### 3.3 Threshold discipline

Reach for a **pixel budget** first. `threshold` is a per-pixel colour tolerance, not a global fuzziness dial, so raising it to absorb antialiasing is the wrong lever.

| Option | When to use |
|---|---|
| `maxDiffPixels: 20-50` | **Default.** Components, nav, forms, footer. An absolute budget is easy to debug and to justify in review |
| `maxDiffPixelRatio: 0.01-0.02` | Full pages and grids, where an absolute count does not scale |
| `threshold: 0.2` (Playwright's default) | Leave as is unless you have a specific colour-rendering reason |
| Raising `threshold` above `0.3` | **Stop** — fix the instability instead |

`maxDiffPixels` and `maxDiffPixelRatio` are both unset by default, i.e. zero tolerance until you opt in.

### 3.4 Prefer element screenshots over full page

```ts
// ✅ DO — tight scope, less flake
await expect(page.getByRole('article', { name: 'Featured' })).toHaveScreenshot();

// Full page only when the test is specifically about layout
await expect(page).toHaveScreenshot({ fullPage: true });
```

### 3.5 Baseline updates are reviewed, not reflexive

- Update in a **separate commit** from the code change that caused the diff, inside the same PR. Message format: `test: baseline update - <reason>`.
- Use `--update-snapshots=changed` (PW ≥ 1.50). Valid values: `all`, `changed`, `missing` (the no-flag default), `none`. A bare `--update-snapshots` already means `changed`.
- Always inspect the HTML report diff triptych before accepting.

---

## 4. Mocking for Determinism

### 4.1 Scope mocks per test — never globally

```ts
test.beforeEach(async ({ page }) => {
  await page.route('**/api/products', (route) =>
    route.fulfill({ status: 200, json: createProductList(3) }),
  );
});
```

### 4.2 Fixed data for fixed pixels

- Never rely on live API responses in VRT.
- Use factories with **deterministic** IDs, dates and ordering: no `Math.random()`, no `Date.now()`, no `crypto.randomUUID()`.
- Seed counters so images, avatars and prices render identically on every run.

---

## 5. ARIA Snapshots (Structural VRT)

Pixel diffs miss semantic regressions (`<button>` → `<div>` looks identical). Pair screenshots with ARIA snapshots.

```ts
// External .aria.yml (PW ≥ 1.50) gives reviewable diffs
await expect(page.getByRole('main')).toMatchAriaSnapshot({ name: 'homepage.aria.yml' });
```

- `name` resolves relative to the test's snapshot folder. Putting `.aria.yml` files elsewhere requires `expect.toMatchAriaSnapshot.pathTemplate` in the config; it is not automatic.
- Review ARIA diffs in PRs the same way as screenshot diffs.

---

## 6. Responsive & Dark Mode

Define viewports and colour schemes in **projects**, not in test bodies.

```ts
// playwright.config.ts
projects: [
  { name: 'desktop-light', use: { viewport: { width: 1920, height: 1080 }, colorScheme: 'light' } },
  { name: 'mobile-light', use: { ...devices['iPhone 13'], colorScheme: 'light' } },
  { name: 'desktop-dark', use: { viewport: { width: 1920, height: 1080 }, colorScheme: 'dark' } },
],
```

```ts
snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
```

---

## 7. Selectors

| Priority | Method | Use for |
|---|---|---|
| 1 | `getByTestId()` | **default for VRT.** Survives copy edits and the en/pl/de locale axis |
| 2 | `getByRole()` / `getByLabel()` | elements with no testid: landmarks, buttons, form fields |
| 3 | `getByText()` | static readable text only, always with `{ exact: true }` |
| 4 | CSS / XPath | last resort, only when nothing above exists |

This order is deliberately **different from Playwright's functional-testing guidance**. VRT locks pixels rather than behaviour and runs across three locales (see `tests/visual/s03/s03-l03-i18n.visual.spec.ts`), so an accessible name is a moving target where a `data-testid` is not.

---

## 8. Waiting & Timing

```ts
// ✅ DO
await expect(page.getByText('Loaded', { exact: true })).toBeVisible();
await page.getByTestId('spinner').waitFor({ state: 'hidden' });

// ❌ DON'T
await page.waitForLoadState('networkidle'); // DISCOURAGED, hangs under polling
await page.waitForTimeout(2000);            // flaky
await page.waitForSelector('...');          // discouraged, use locator.waitFor()
```

- Test timeout is **30 seconds** for VRT (capture plus diff is heavier than mocks).
- Use `test.setTimeout(N_000)` with an underscore separator when a test genuinely needs more.
- **Avoid `test.slow()`** — it triples the configured timeout wholesale (30 s becomes 90 s) and is a no-op in `beforeAll` / `afterAll`. Set an explicit timeout instead.

---

## 9. TypeScript Conventions

- **No `any`.** Type route handlers, fixtures and factory returns.
- **Always `await`** route / expect / goto / clock calls — floating promises are the top cause of VRT flake.
- Use `import type` for type-only imports.
- Numeric literals with `_` separator: `test.setTimeout(30_000)`.

---

## 10. File & Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Visual spec | `<feature>.visual.spec.ts` | `homepage.visual.spec.ts` |
| Tracker spec | `<feature>.tracker.spec.ts` | `s04-l01.tracker.spec.ts` |
| ARIA snapshot | `<feature>.aria.yml` | `homepage.aria.yml` |
| Factory | `<entity>.factory.ts` | `product.factory.ts` |
| Page Object | `<Page>Page.ts` | `CheckoutPage.ts` |
| Baseline dir | `__screenshots__/<project>/...` | autogenerated |

**Tracker specs are not visual specs.** A `*.tracker.spec.ts` talks to a running Visual Regression Tracker: the baseline lives in the tracker's database, not in the repo, so there is no `toHaveScreenshot()` and no PNG to commit. Keep them **outside** `tests/` (the root config's `testDir`) so a plain `npx playwright test` can never pick them up and fail for someone without Docker. They run only via their own config: `npm run test:vrt:tracker`. See [`vrt-tracker/`](./vrt-tracker/).

- camelCase for variables and functions, PascalCase for classes and interfaces.
- Avoid consecutive uppercase: `apiHandler.ts`, not `APIHandler.ts`.
- Assertion helpers start with `check`: `checkHeroVisible()`.

---

## 11. CI / Docker

- Pin the Playwright image and match it to `package.json` — version drift between image and project breaks browser resolution. Never `:latest`.
- Sharding (`--shard=1/4`) is expected; tests must be independent.
- The HTML report is uploaded as an artifact on every run; PR reviewers inspect diffs from there.
- The browser build is pinned by the image tag, not by the host. A diff that appears only outside Docker points at the host browser, not at the test.
- Baseline PNGs are committed directly. Move them to Git LFS only if repository size becomes a problem, or drop them from the repo entirely by moving baselines into Visual Regression Tracker (see S04L01).

---

## 12. Test Independence

- Each test is **independent of execution order**. No shared mutable state between `test()` blocks.
- Every test navigates and stabilizes its own starting state.
- No `if` statements inside specs — conditional logic belongs in helpers or Page Objects.
- No loops over dynamic or runtime data to generate tests. A loop over a frozen `as const` axis (locale, theme, viewport) is fine and is the preferred way to cover en/pl/de.

---

## 13. Anti-Patterns

| Anti-pattern | Why it's a problem | Fix |
|---|---|---|
| `page.waitForLoadState('networkidle')` | DISCOURAGED by Playwright; never settles under polling or analytics, then fails as a misleading "timeout" | Explicit assertion on the last-rendered element |
| `page.waitForTimeout()` | Flaky, slow | Auto-waiting assertions |
| `page.waitForSelector()` | Discouraged | `locator.waitFor()` |
| `page.clock` after `goto` | Page already read `Date.now()`, so freezing is a no-op | `setFixedTime` before `goto` |
| `force: true` on actions | Masks real bugs | Fix selector / wait for state |
| `test.slow()` | Triples the timeout wholesale | Explicit `setTimeout(N_000)` |
| Raising `threshold` to hide flake | Wrong lever, and it hides real regressions | Stabilize, then set `maxDiffPixels` |
| Hiding elements via CSS for screenshots | Changes layout, neighbours jump | Use `mask:` |
| Live API data in VRT | Non-deterministic pixels | Mock with fixed factories |
| Global `page.route` handlers | Leak between tests | Scope per test or `beforeEach` |
| Pixel-only VRT on semantic UI | Misses `<button>` → `<div>` | Add `toMatchAriaSnapshot()` |
| `any` types | Loses type safety | Proper interfaces |
| Missing `{ exact: true }` | Partial matches | Always add on text locators |

---

## 14. Pre-Merge Checklist

- [ ] Every visual test stabilizes: `page.clock.setFixedTime` **before** `goto`, plus an assertion on a concrete visible locator
- [ ] No `networkidle`, no `waitForTimeout`, no `test.slow()`, no `force: true`
- [ ] Dynamic regions use `mask:` with `maskColor: '#FF00FF'`, never `display: none`
- [ ] Tolerances justified (see §3.3) — `maxDiffPixels` first, no silent `threshold` bumps
- [ ] Structural changes have `toMatchAriaSnapshot()` coverage, not just pixel
- [ ] Mocks are scoped per test or `beforeEach`, with deterministic factory data
- [ ] Responsive / dark-mode variants covered via **projects**, not test-body branching
- [ ] Element screenshots preferred over full-page where possible
- [ ] Selectors follow the project order: `getByTestId` first, then `getByRole` / `getByLabel`, then `getByText`. No CSS or XPath
- [ ] No `any`, all async calls `await`ed, numeric literals use `_` (`30_000`)
- [ ] Baselines regenerated in the pinned environment, in a separate commit (`test: baseline update - <reason>`)
- [ ] HTML report artifact reviewed (diff triptych inspected) before accepting updates
- [ ] Type check passes: `npx tsc --noEmit`
