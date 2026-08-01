# AI w testach VRT (S01–S03 – momenty AI)

Lekkie wsparcie AI dla Visual Regression Testing, **bez kosztu API**. Testy to **zwykłe
testy VRT** — gdy padną, Playwright pokazuje `baseline/actual/diff` w raporcie HTML. Triage
robisz **ręcznie w Cursorze / Claude Pro**: bierzesz prompt, przeciągasz obrazki z raportu,
dostajesz werdykt JSON. W **L02/L03** test dokłada do raportu (i do **trace viewera**) gotowy
załącznik **`PROMPT.md`** — prompt z już wstawionym kontekstem; w **L01** otwierasz prompt
wprost z [`s01/`](s01/). Bez ciężkiej „paczki" na dysku — to (folder + obrazki)
przyjdzie przyrostowo w kolejnych dniach.

## Momenty AI (S01)

| Lekcja | Moment AI | Wejście | Wyjście JSON |
|--------|-----------|---------|--------------|
| **L01** | Snapshot Triage | baseline + actual + diff | `{ severity, action }` |
| **L02** | Snapshot Explainer | 3 obrazki + kontekst | `{ severity, root_cause, recommendation, reasoning }` |
| **L03** | HTML Analyzer | HTML `/live` (kilka dynamicznych elementów) | `{ must_mask, should_mask, nice_to_mask }` |
| **L03** | Flake Root-Cause | baseline + actual + HTML `/live` | `{ leaked_element, root_cause, fix, reasoning }` |
| **S02 L01** | Responsive Diff | 3 zrzuty (375/768/1920 px) | `{ responsive_correct, issues[] }` |
| **S02 L01** | Dark Mode Audit | zrzut light + dark | `{ wcag_aa_pass, violations[] }` |
| **S02 L03** | ARIA Migration | before + after `.aria.yml` | `{ changes[], a11y_improvements[], verdict }` |

## Momenty AI (S03) — kod, nie triage obrazków

S03 to sesja praktyczna: mock/factory, SOLID + Page Object, Agent Skills, threshold. Momenty AI
dotyczą **kodu i konwencji**, nie porównania pikseli — dlatego prompty otwierasz **wprost z
[`s03/`](s03/)** w Cursorze (jak L01 w S01), obok realnych testów z [`../s03/`](../s03/). Połowa
promptów **generuje kod** (factory / Page Object / `SKILL.md`), połowa robi **review** i zwraca JSON.

| Lekcja | Moment AI | Wejście | Wyjście |
|--------|-----------|---------|---------|
| **L01** | Factory Generator | opis danych (ile, kategorie, ceny) | kod TS: `interface` + `createX()` |
| **L01** | Determinism Review | factory (wklejona) | `{ deterministic, violations[], unit_test }` |
| **L02** | Page Object Refactor | płaski test VRT | kod: klasa Page Object + odchudzony spec |
| **L02** | SOLID Review | Page Object + spec | `{ violations[], assertions_leaked, verdict }` |
| **L03** | Agent Skill Draft | powtarzane prompty + konwencje | `SKILL.md` (frontmatter + body) |
| **L03** | Skill Trigger Review | `description` z frontmattera | `{ specific_enough, would_misfire_on[], improved_description }` |
| **B01** | Threshold Recommender | lista komponentów | `[{ component, threshold?/maxDiffPixels?/…, mask?, justification }]` |
| **B01** | False Positive Analysis | testy często czerwone + diff % | `[{ test, verdict, recommendation }]` |

## Pliki

| Plik | Rola |
|------|------|
| [`s01/`](s01/), [`s02/`](s02/), [`s03/`](s03/) | **Treść promptów** jako pliki `.md` (z `{{context}}`), pogrupowane per sesja – źródło dla testu i do ręcznego użycia |
| [`prompts.ts`](prompts.ts) | Loader: wczytuje prompt z `s01/`/`s02/`/`s03/` + wstawia kontekst; w L02/L03 test dokłada wynik jako `PROMPT.md` do raportu (w L01 i całym S03 używasz pliku z folderu wprost) |
| [`demo-url.ts`](demo-url.ts) | Buduje URL z regresją demo (`?vrt=<case>`) na podstawie `VRT_DEMO` |
| [`SOLUTION.md`](SOLUTION.md) | **Klucz odpowiedzi** — poprawny werdykt dla każdego scenariusza + gdzie AI się myli |
| [`../s01/s01-l01-ai-snapshot-triage.visual.spec.ts`](../s01/s01-l01-ai-snapshot-triage.visual.spec.ts) | L01 – Triage: realny `toHaveScreenshot` (header) |
| [`../s01/s01-l02-ai-snapshot-explainer.visual.spec.ts`](../s01/s01-l02-ai-snapshot-explainer.visual.spec.ts) | L02 – Explainer: realny `toHaveScreenshot` (karta) |
| [`../s01/s01-l03-ai-mask-and-flake.visual.spec.ts`](../s01/s01-l03-ai-mask-and-flake.visual.spec.ts) | L03 – HTML Analyzer + prawdziwy Flake (załączniki w raporcie) |
| [`../s02/s02-l01-ai-gallery-responsive.visual.spec.ts`](../s02/s02-l01-ai-gallery-responsive.visual.spec.ts) | S02 L01 – Responsive Diff (/gallery, per projekt + PROMPT.md) |
| [`../s02/s02-l01-ai-responsive-darkmode.visual.spec.ts`](../s02/s02-l01-ai-responsive-darkmode.visual.spec.ts) | S02 L01 – Dark Mode Audit (light vs dark + PROMPT.md) |
| [`../s02/s02-l03-ai-aria-migration.visual.spec.ts`](../s02/s02-l03-ai-aria-migration.visual.spec.ts) | S02 L03 – ARIA Migration (before/after .aria.yml + PROMPT.md) |
| [`../s03/s03-l01-mocking.visual.spec.ts`](../s03/s03-l01-mocking.visual.spec.ts) | S03 L01 – realny test na mocku + factory (cel promptów Factory Generator / Determinism Review) |
| [`../s03/s03-l02-page-object.visual.spec.ts`](../s03/s03-l02-page-object.visual.spec.ts) | S03 L02 – VRT przez Page Object (cel promptów POM Refactor / SOLID Review) |
| [`../s03/s03-b01-threshold.visual.spec.ts`](../s03/s03-b01-threshold.visual.spec.ts) | S03 B01 – threshold per komponent (cel promptów Threshold Recommender / False Positive) |
| [`../../../.claude/skills/vrt-factory/SKILL.md`](../../../.claude/skills/vrt-factory/SKILL.md) | S03 L03 – modelowy skill: **dane** (cel promptów Skill Draft / Trigger Review) |
| [`../../../.claude/skills/vrt-pom/SKILL.md`](../../../.claude/skills/vrt-pom/SKILL.md) | S03 L03 – modelowy skill: **Page Object** (locatory + akcje, zero asercji) |
| [`../../../.claude/skills/vrt-spec/SKILL.md`](../../../.claude/skills/vrt-spec/SKILL.md) | S03 L03 – modelowy skill: **spec** (asercje + screenshot) |
| [`../../../.claude/skills/vrt-i18n/SKILL.md`](../../../.claude/skills/vrt-i18n/SKILL.md) | S03 L03 – modelowy skill: **oś języków** en/pl/de; wzór dla zadania S03L04 |
| [`../s03/s03-l03-i18n.visual.spec.ts`](../s03/s03-l03-i18n.visual.spec.ts) | S03 L03 – output skilla `vrt-i18n` (jedna strona × trzy języki) |

## Uruchomienie

```bash
npm run test:ai                  # ZIELONY: realny toHaveScreenshot, baseline pasuje
npm run test:ai:demo             # CZERWONY: włącza regresję demo (?vrt=) → diff w raporcie
npm run test:vrt:report          # raport HTML: baseline / actual / diff (+ live-board.html w L03)

# Pojedynczy scenariusz demo (VRT_DEMO wybiera regresję włączaną URL-em ?vrt=…):
#   VRT_DEMO=szum|bug   npx playwright test s01-l01-ai   # /?vrt=header-szum | header-logo
#   VRT_DEMO=design|bug npx playwright test s01-l02-ai   # /gallery?vrt=card-design | card-contrast
```

### Triage ręczny (zero kosztu API)

1. `npm run test:ai:demo` → test czerwony → `npm run test:vrt:report`.
2. W raporcie (i w trace viewerze) masz **baseline / actual / diff** (L01/L02) albo `live-board.html`
   (L03). W **L02/L03** jest też **załącznik `PROMPT.md`** — prompt z już wstawionym kontekstem
   per scenariusz; w **L01** bierzesz prompt wprost z [`s01/`](s01/).
3. Otwórz prompt (`PROMPT.md` w L02/L03 albo plik z `s01/` w L01) w Cursorze i przeciągnij obrazki z raportu.
4. Werdykt JSON → porównaj z [`SOLUTION.md`](SOLUTION.md).

### Mechanizm demo: regresja w aplikacji włączana URL-em

Regresje NIE są wstrzykiwane przez test — **mieszkają w aplikacji** ([`app/src/index.css`](../../../app/src/index.css),
blok „VRT DEMO") i włączają się parametrem `?vrt=<case>`, który czyta `Layout`
([`app/src/App.tsx`](../../../app/src/App.tsx)). Test po prostu wchodzi na taki URL — jak ktoś,
kto otworzył stronę po zepsutym PR. Bez `?vrt=` aplikacja działa normalnie.

| `?vrt=` | Co psuje | Używa |
|---------|----------|-------|
| `header-logo` | znika logo w nagłówku | L01 (`VRT_DEMO=bug`) |
| `header-szum` | subpikselowy shift nawigacji | L01 (`VRT_DEMO=szum`) |
| `card-design` | kanciaste rogi + teal border karty | L02 (`VRT_DEMO=design`) |
| `card-contrast` | wyblakły tytuł (niski kontrast) | L02 (`VRT_DEMO=bug`) |
| `mobile-overflow` | poziomy scroll na mobile (sztywno szeroka sekcja) | S02 L01 responsive (`VRT_DEMO=bug`) |
| `dark-contrast` | przygaszony tekst → niski kontrast w dark | S02 L01 dark mode (`VRT_DEMO=bug`) |

## Cykl VRT (L01/L02): fail → triage → accept/fix → green

L01 i L02 to **realne testy `toHaveScreenshot()`**:

1. **baseline pasuje → zielony** (brak diffa, AI niepotrzebne).
2. **zmiana → czerwony**; Playwright zapisuje `expected/actual/diff` i pokazuje je w raporcie.
3. **triage** (ręcznie w Cursorze): `bug` → naprawiasz kod; `szum`/zamierzone → akceptujesz
   baseline (`npm run test:vrt:update`) → znów zielony.

To dokładnie cykl prawdziwego PR-a. Regresję do demo włącza URL `?vrt=<case>`; **nie** uruchamiaj
`--update-snapshots` z ustawionym `VRT_DEMO`.

> **Masz to na żywo:** testy funkcjonalne (`first-vrt`/`basics`/`stabilization`) są czerwone,
> bo baseline pochodzą z innej maszyny (font/AA ~2%) – realny „diff czeka na decyzję”:
> triage → to szum cross-platform → `--update-snapshots`.

**L03 jest inne** – HTML Analyzer i Flake Root-Cause to narzędzia **diagnostyczne** (zielone):
HTML Analyzer asercjuje, że strona `/live` ma dynamiczne elementy; Flake odtwarza przeciek
(`baseline ≠ actual`) i wrzuca baseline/actual/live-board.html do raportu.

## „Realny sens” (L03)

Lekcja używa dedykowanej strony **`/live` („Live Floor")** – dashboardu z **kilkoma** dynamicznymi
elementami naraz, żeby prompt o maski miał realny materiał i kilka decyzji do podjęcia:

- **HTML Analyzer** dostaje prawdziwy HTML `/live` – zawiera losowe (`bid-ticker`, `online-now`,
  `server-latency`, `session-id`, `live-counter` → `Math.random`), czasowe (`countdown-timer`,
  `last-updated` → `Date.now`, zamraża je `clock`) i animację (`live-pulse` → `animate-ping`,
  wyłącza config). Sugestie maski są weryfikowalne, a pułapki (czas/animacja) testują, czy AI
  nie maskuje na ślepo.
- **Flake Root-Cause** to **prawdziwy flake**: bez `page.clock` robimy 2 zrzuty `/live` w odstępie
  jednej zmiany `bid-ticker` (Math.random co 1s) → baseline i actual realnie się różnią (na `/live`
  przecieka kilka elementów naraz).

## Caveats (z S01 README → „AI Caveats”)

- **Subscription vs API** – Claude Pro / Cursor wystarcza do **manual triage**;
  API key potrzebny dopiero do **AI-in-CI** (poza zakresem S01).
- **Niedeterminizm LLM** – traktuj werdykt jako sugestię; w CI asercjuj **strukturę** JSON,
  nie konkretną etykietę. AI bywa pewne i błędne — patrz `SOLUTION.md`.
- **Prywatność** – zrzuty mogą zawierać PII. Maskuj (`mask: [locator]`) zanim wyślesz do AI.
