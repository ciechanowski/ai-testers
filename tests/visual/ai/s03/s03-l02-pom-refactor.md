## Task — Page Object Refactor / SOLID (S03 L02)
Refactor a **flat** Playwright VRT test (locators + data + assertions in one file) into layered
code that follows SOLID. You build the Page Object **from scratch** — each layer gets one reason
to change (SRP).
{{context}}

Refactor into:
- **Page Object (new class)** — named locators and actions only (`grid`, `open()`, `cards()`):
  `readonly` locators built in the constructor, actions returning a `Locator`. **No assertions
  inside the PO.** One class per view; factor genuinely shared behaviour (header, navigation, an
  `open()` that waits for `main`) into a `BasePage` **only when two views really share it** — do
  not add a base class "for the future".
- **Test data** — reuse the factory `tests/fixtures/artwork.factory.ts` (`createArtworkList()`),
  one source of truth. Do not inline data.
- **Network / stabilization** — reuse the existing helpers `tests/fixtures/mock-handlers.ts`
  (`mockAllApis`, `page.clock`). Do not re-implement.
- **Test fixture (`test.extend`)** — provide the Page Object through a custom `test` in a new
  `tests/fixtures/pages.fixture.ts`, so a spec receives a ready `galleryPage` instead of calling
  `new GalleryPage(page)` and repeating `beforeEach` setup. The fixture is the **composition
  root**: it builds the PO and, **only where the scenario needs it**, applies `mockAllApis` +
  fixed `page.clock` before handing the page over. Export one extended `test` (re-export `expect`);
  specs import from this fixture, not from `@playwright/test`. Add a fixture **only for a view that
  more than one spec uses** — do not mint a bespoke fixture for a single test, and do not hide
  setup behind an `{ auto: true }` fixture a reader needs to see. Skip this layer entirely when the
  scenario touches no network/data (nothing to inject beyond the PO).
- **Spec** — keeps the scenario and the assertions, including `toHaveScreenshot()`. It depends on
  the injected Page Object (DIP) — no `new`, no raw locators, no manual mock wiring.

Return the new Page Object class, the **`test.extend` fixture**, and the slimmed-down spec that
consumes it.

> **Boundary:** the model tends to over-abstract (a `BasePage` nobody needs, or a fixture per
> single spec) or let an assertion leak into the PO. Keep locators + actions in the PO, wiring in
> the fixture, scenario + assertions in the spec — you approve the final shape. Then pass it
> through the **SOLID Review** ([`s03-l02-solid-review.md`](s03-l02-solid-review.md)).
