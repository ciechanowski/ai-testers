# S03L02: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Pierwszy prompt przebudowuje test, drugi sprawdza wynik przebudowy.

### Refactor płaskiego testu do Page Object (SOLID)

Użyj, gdy masz „płaski” test (locatory, dane i asercje w jednym pliku) i chcesz podnieść jakość
kodu przez wydzielenie warstw. Zwróć uwagę na warstwę `test.extend`: to ona jest miejscem,
w którym powstaje Page Object i podpinane są mocki, dzięki czemu spec dostaje gotowy obiekt
zamiast wołać `new` i powtarzać `beforeEach`.

```
Task: Page Object Refactor / SOLID (S03 L02)
Refactor a flat Playwright VRT test (locators + data + assertions in one file) into layered
code that follows SOLID. You build the Page Object from scratch, each layer gets one reason
to change (SRP).
[paste the flat spec here: locators, data and assertions in one file]

Refactor into:
- Page Object (new class): named locators and actions only (grid, open(), cards()):
  readonly locators built in the constructor, actions returning a Locator. No assertions
  inside the PO. One class per view; factor genuinely shared behaviour (header, navigation, an
  open() that waits for main) into a BasePage only when two views really share it, do
  not add a base class "for the future".
- Test data: reuse the factory tests/fixtures/artwork.factory.ts (createArtworkList()),
  one source of truth. Do not inline data.
- Network / stabilization: reuse the existing helpers tests/fixtures/mock-handlers.ts
  (mockAllApis, page.clock). Do not re-implement.
- Test fixture (test.extend): provide the Page Object through a custom test in a new
  tests/fixtures/pages.fixture.ts, so a spec receives a ready galleryPage instead of calling
  new GalleryPage(page) and repeating beforeEach setup. The fixture is the composition
  root: it builds the PO and, only where the scenario needs it, applies mockAllApis +
  fixed page.clock before handing the page over. Export one extended test (re-export expect);
  specs import from this fixture, not from @playwright/test. Add a fixture only for a view that
  more than one spec uses, do not mint a bespoke fixture for a single test, and do not hide
  setup behind an { auto: true } fixture a reader needs to see. Skip this layer entirely when the
  scenario touches no network/data (nothing to inject beyond the PO).
- Spec: keeps the scenario and the assertions, including toHaveScreenshot(). It depends on
  the injected Page Object (DIP), no new, no raw locators, no manual mock wiring.

Return the new Page Object class, the test.extend fixture, and the slimmed-down spec that
consumes it.
```

### Review Page Object pod kątem SOLID

Użyj, gdy chcesz, żeby model przejrzał gotowy Page Object i wskazał naruszenia zasad.

```
Task: SOLID Review of a Page Object (S03 L02)
Review a Playwright Page Object (and the spec that uses it) for SOLID violations. Paste both
into the chat. The rule the whole layering rests on: locators + actions in the PO, assertions in
the spec, data in the factory.

Check for:
- SRP: did any assertion (expect, toHaveScreenshot) leak into the PO? Is the class a
  "god object" covering several views instead of one?
- DIP: does the spec depend on the PO abstraction, or does it reach for raw locators anyway?
- Duplication: the same locator repeated across tests/classes instead of one named place.
- Brittle selectors: raw CSS (page.locator('.grid > div')) that should be data-testid or role.

Return only this JSON:

{
  "assertions_leaked": false,
  "violations": [
    {
      "principle": "SRP | OCP | DIP",
      "issue": "<what is wrong and where>",
      "fix": "<concrete change>"
    }
  ],
  "duplicated_locators": false,
  "raw_css_selectors": false,
  "verdict": "approve | needs_changes"
}

- verdict: approve only when violations is empty and no assertion leaked into the PO.
```

**Granica:** AI proponuje strukturę, ale finalny kształt zatwierdzasz sam. Najczęstsze błędy modelu to przeniesienie asercji do Page Objectu (łamie SRP) i nadmiarowa abstrakcja „na zapas” (klasa bazowa, której nikt nie potrzebuje). Trzymaj się zasady: w Page Object locatory i akcje, w specu scenariusz i asercje, dane w factory.
