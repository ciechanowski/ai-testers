# Klucz odpowiedzi: triage demo (S01)

Werdykt AI to **sugestia**, nie wyrocznia. Tu masz **poprawne odpowiedzi** dla każdego
scenariusza demo (`?vrt=<case>`). Porównaj z tym, co zwrócił Ci Cursor. Jeśli AI trafiło
inaczej, najpierw zaufaj **temu kluczowi + własnym oczom na `diff.png`**, nie prozie modelu.

## Co psuje który scenariusz + poprawny werdykt

### L01: Triage (`{ severity, action }`)

| `VRT_DEMO` / `?vrt=` | Co realnie się dzieje | Poprawny werdykt | Dlaczego |
|---|---|---|---|
| `szum` / `header-szum` | nawigacja przesunięta o **0.6 px** (subpiksel), niewidoczne gołym okiem | `{ "severity": "noise", "action": "accept" }` (dopuszczalne: `minor`/`review`) | różnica tylko wzdłuż krawędzi glifów = szum renderowania, nie regres |
| `bug` / `header-logo` | **logo „AI Testers" znika** (zostaje samo „Pixelarium") | `{ "severity": "major", "action": "block" }` | brak elementu brandu = widoczny regres; diff skupiony, nie krawędziowy |

### L02: Explainer (`{ severity, root_cause, recommendation, reasoning }`)

| `VRT_DEMO` / `?vrt=` | Co realnie się dzieje | Poprawny werdykt |
|---|---|---|
| `design` / `card-design` | kanciaste rogi + teal border; **PR ma zaplanowane zmiany designu** | `severity: minor`, `root_cause: design_intentional`, `recommendation: update_baseline` |
| `bug` / `card-contrast` | **tytuł karty wyblakł** (opacity 0.12) → nieczytelny, defekt a11y **sam w sobie** | `severity: major`, `root_cause: bug` (regres kontrastu / a11y), `recommendation: fix_regression` |

> **Dwa różne rodzaje regresu, i tylko jeden potrzebuje kontekstu:**
> - `design`: czy zmiana jest **zamierzona**, tego nie ma na obrazku → podajemy fakt „PR ma
>   zaplanowane zmiany designu", a AI ocenia, czy diff jest z nimi spójny (czy coś się nie zepsuło).
> - `bug`: wyblakły/nieczytelny tytuł to defekt **niezależnie od intencji** → AI ma go złapać
>   z samych pikseli (reguła „jakość zmiany" w prompcie). Kontekstu tu **nie podpowiadamy**, bo
>   „brak zmian + jakikolwiek diff = bug" byłoby tautologią, nie oceną.

### L03: HTML Analyzer + Flake Root-Cause (`/live`)

L03 nie ma scenariuszy `?vrt=` (to narzędzia **diagnostyczne**, nie bramki). „Klucz" to **poprawna
klasyfikacja masek** dla strony `/live` („Live Floor"). Porównaj z tym, co zwrócił Ci Cursor.

**HTML Analyzer, ground truth:**

| Element | Źródło | Klasa | Dlaczego |
|---|---|---|---|
| `bid-ticker` | `Math.random` co 1 s | **must_mask** | losowy przyrost, clock nie pomaga |
| `online-now` | `Math.random` co 2 s | **must_mask** | losowa liczba live |
| `server-latency` | `Math.random` co 2 s | **must_mask** | telemetria ms |
| `session-id` | `Math.random` (hex, raz) | **must_mask** | random ID, inny co reload |
| `live-counter` | `Math.random` co 3 s | **must_mask** | losowy przyrost |
| `floor-price` | fixture / API | **should_mask** | w teście stała; maskuj wąsko tylko gdy zacznie szumieć |
| `countdown-timer` | `Date.now` co 1 s | **NIE mask** | zamraża `page.clock` (fix: `clock` przed `goto`) |
| `last-updated` | `Date.now` co 1 s | **NIE mask** | zamraża `page.clock` |
| `live-pulse` | `animate-ping` | **NIE mask** | wyłącza `animations: 'disabled'` |

> **Gdzie AI się myli (L03):** najczęstszy błąd to **over-masking**: wrzucenie `countdown-timer`
> lub `last-updated` do `must_mask` „na wszelki wypadek". To znak, że model nie uwzględnił
> konfiguracji z lekcji (`page.clock`). Maska na elemencie czasowym *działa*, ale ukrywa realny
> regres tej liczby i łamie regułę „maska to ostateczność". Drugi błąd: maska na `live-pulse`
> (animacja, którą i tak wyłącza config).

**Flake Root-Cause, ground truth:** w teście flake (`s01-l03-ai-mask-and-flake`) **nie ma** `clock`,
więc przecieka **kilka** elementów naraz: wszystkie losowe (`bid-ticker` … `live-counter`) **oraz**
czasowe (`countdown-timer`, `last-updated`: sekundy realnie tykają). Poprawny werdykt rozróżnia fix:

- losowe → `root_cause: dynamic_content`, fix: `mask: [locator]`,
- czasowe → `root_cause: dynamic_content`, fix: `clock_before_goto` (**nie** maska!).

## Gdzie AI realnie się myli (prawdziwe przebiegi z tego repo)

1. **Halucynacja uzasadnienia, model czyta `diff.png` zamiast porównać baseline↔actual.**
   Powtórzyło się w obu: L01 (logo zniknęło → AI: „zmieniło kolor na czerwony") i L02 (wyblakł
   sam tytuł → AI: „cała karta wyblakła, tekst czerwono-pomarańczowy"). Przyczyna: przygaszone tło
   diffa model bierze za „wyblakło", a kolor podświetlenia różnic za prawdziwy kolor elementu.
   **Werdykt bywa trafny mimo błędnej prozy.** Fix: prompty mówią teraz „opisuj baseline → actual,
   nie interpretuj kolorów diffa". → *Ufaj strukturze (severity/action) + porównaniu baseline↔actual,
   nie prozie ani kolorom diffa.*

2. **Groźny false-negative (L02 `card-contrast`).** Przy **neutralnym** kontekście AI uznało
   wyblakły (nieczytelny) tytuł za `design_intentional` → `update_baseline`. To **przepuściłoby
   realny regres**: zaakceptowałbyś zepsuty tytuł do baseline. → *Nigdy nie auto-akceptuj na
   podstawie samego AI. Człowiek zatwierdza.*

## Jak być spokojniejszym (jak „rozwiązać" to zadanie)

1. **Porównaj werdykt AI z tym kluczem**: masz ground truth.
2. **Zawsze zerknij na `diff.png`**: magenta skupiona na elemencie = regres; cienkie obwódki
   wzdłuż krawędzi = szum.
3. **Kontekst tylko tam, gdzie potrzebny, i jako fakt, nie wniosek.** Dla zmian, które mogą być
   zamierzone (design), podajesz fakt spoza obrazka: *„ten PR ma zaplanowane zmiany designu"*,
   a AI ocenia spójność. Dla defektów złych same w sobie (nieczytelny tekst, brak elementu)
   **nie podpowiadasz nic**: AI łapie je z pikseli (reguła „jakość zmiany" w prompcie L02).
   Nie mów AI „to bug": jeśli musisz, to znaczy, że to Ty triage'ujesz, nie on. **Zweryfikuj w Cursorze.**
4. **Decyzję podejmuje człowiek.** `accept` (`--update-snapshots`) tylko gdy TY potwierdzisz,
   że zmiana jest zamierzona. AI skraca triage, nie zastępuje review.

---

# S02: Dzień 2 (ground truth)

S02 to **narzędzia diagnostyczne** (zielone), nie bramki, a „klucz" to poprawna interpretacja paczek.

## S02 L01: Responsive Diff (`?vrt=mobile-overflow`)

| Sytuacja | Poprawny werdykt | Dlaczego |
|---|---|---|
| Czysto (bez `?vrt=`): mobile chowa nawigację za hamburger, kolumny reflowują | `responsive_correct: true`, `issues: []` | kolaps/hamburger to **responsive**, nie bug, więc nie zgłaszaj |
| `?vrt=mobile-overflow`: pierwsza sekcja ma sztywne 1200 px → poziomy scroll na 375 px | `responsive_correct: false`, issue `{ viewport: mobile, classification: bug, severity: major }` | poziomy scroll na mobile = realny bug layoutu |

> **Pułapka:** AI bywa zbyt czułe i zgłasza brak sidebara/zmianę kolumn jako bug. To **expected responsive**: prompt wprost każe rozróżniać kolaps od overflow.

## S02 L01: Dark Mode Audit (`?vrt=dark-contrast`)

| Sytuacja | Poprawny werdykt | Dlaczego |
|---|---|---|
| Czysto: tekst treści ma pełny kontrast w light i dark | `wcag_aa_pass: true` | motyw dark Pixelarium trzyma kontrast |
| `?vrt=dark-contrast`: tekst treści `#4b5563` na ciemnym tle | `wcag_aa_pass: false`, violation `{ ratio_required: 4.5:1, severity: major }` | gray-600 na granacie ≈ 2-3:1 → poniżej AA |

> **Caveat (powtórka z promptu):** kontrast jest **szacowany** przez vision AI: to pre-check, NIE proof of WCAG. Potwierdzaj axe-core / Lighthouse.

## S02 L03: ARIA Migration (fixture before/after)

`before.aria.yml` = nawigacja jako `text` w `<div role="navigation">` (linki nieklikalne dla czytnika).
`after.aria.yml` = realne drzewo z aplikacji (`navigation` → `link "..."` × 5).

Poprawny werdykt:
- `changes`: `role_changed`/`item_changed`, czyli `text` → `link` (5×); typ `structure_changed`.
- `a11y_improvements`: klawiatura (Tab/Enter na natywnych `<a>`), announcement „link" w screen readerze, focus order.
- `needs_screenshot: false`, bo wygląd identyczny, regresja tylko semantyczna (dlatego ARIA, nie pixel).
- `verdict: approve`.

> **Gdzie AI się myli:** potrafi orzec `needs_screenshot: true` „bo zmieniliśmy element". Błąd: `<div>` → `<a>` zwykle nie zmienia wyglądu, a o to właśnie chodzi (pixel by tego nie złapał). Druga pułapka: ignoruje, że `before` w ogóle nie miał roli `link` (czyli było niedostępne), i to jest najważniejsza zmiana.

---

# S03: Dzień 3 (ground truth)

S03 to momenty **na kodzie**, nie na obrazkach. Połowa promptów generuje kod (factory / Page
Object / `SKILL.md`), połowa robi review i zwraca JSON. „Klucz" to poprawny kształt tego kodu /
werdyktu, weryfikowalny wprost w repo (`tests/fixtures/artwork.factory.ts`, `tests/pages/`,
`.claude/skills/vrt-factory/SKILL.md`).

## S03 L01: Factory Generator + Determinism Review

**Factory Generator, poprawny kształt wyjścia:** `interface` + `createX(): T[]` zgodne stylem z
`artwork.factory.ts` (stała tablica + `slice(count)`). Każda wartość na sztywno: ID w sekwencji
(`art-001`), daty jako stałe stringi ISO 8601, ceny jako `number` (grosze). Zero `any`.

**Determinism Review, ground truth:** `deterministic: true` **tylko** gdy `violations: []`.

| W factory jest… | Poprawny werdykt | Fix |
|---|---|---|
| wszystko na sztywno | `deterministic: true`, `violations: []` | brak |
| `Date.now()` / `new Date()` bez argumentu | `deterministic: false` | stały ISO string, np. `'2026-01-15T00:00:00.000Z'` |
| `Math.random()` / `crypto.randomUUID()` | `deterministic: false` | ID/wartość na sztywno |
| `faker` z żywym seedem, licznik w scope modułu | `deterministic: false` | stała wartość / stały seed |

> **Gdzie AI się myli:** jest tu najbardziej pewne siebie i błędne zarazem: potrafi orzec „w pełni
> na sztywno", zostawiając jedno `Date.now()`. Ufaj `unit_test` (`3× wywołanie === toEqual`), nie prozie.

## S03 L02: Page Object Refactor + SOLID Review

**Refactor, poprawny kształt:** Page Object = **tylko** nazwane locatory + akcje (`grid`, `open()`,
`cards()`), bez ani jednej asercji; dane z `createArtworkList()`; sieć/zegar z `mock-handlers.ts`;
spec trzyma scenariusz + `toHaveScreenshot()` i zależy od abstrakcji PO (DIP). Wzorzec: `gallery.page.ts`.

**SOLID Review, ground truth:** `verdict: approve` **tylko** gdy `violations: []` i żadna asercja
nie wciekła do PO.

| Sytuacja w PO/specu | Poprawny werdykt |
|---|---|
| `expect(...)` / `toHaveScreenshot` w klasie PO | `assertions_leaked: true`, violation `SRP` |
| jeden `getByTestId` powtórzony w wielu testach | `duplicated_locators: true` |
| `page.locator('.grid > div')` (surowy CSS) | `raw_css_selectors: true`, fix: `data-testid`/`role` |
| spec sięga po surowe locatory zamiast PO | violation `DIP` |

> **Gdzie AI się myli:** dwa lustrzane błędy, albo **przeoczy** asercję, która wpełzła do PO, albo
> **wymyśli** abstrakcję „na zapas" (`BasePage`, którego nikt nie potrzebuje). Finalny kształt zatwierdza człowiek.

## S03 L03: Skill Draft + Trigger Review

**Skill Draft, poprawny kształt:** `.claude/skills/vrt-factory/SKILL.md` z frontmatterem (`name`,
triggerowy `description`, `allowed-tools: Read Write Edit`) i body z regułami L01 + krokami +
jednym przykładem I/O. **Jedna odpowiedzialność: dane**, nie asercje, nie Page Objecty, nie progi.

**Trigger Review, ground truth:** `specific_enough: true` **tylko** gdy trigger nie odpali się
rozsądnie na maskach / progach / Page Objectach. Dobry `description` = czasownik + obiekt
(„generate factory / mock data for a visual test") + wprost wypisane, czego skill **nie** robi.

> **Gdzie AI się myli:** zbyt szeroki `description` (skill odpala się „przy wszystkim") i
> skill-moloch łamiący SRP (dane + asercje + PO w jednym). Trigger konkretny jak nazwa testu.

## S03 B01: Threshold Recommender + False Positive (bonus)

**Threshold Recommender, ground truth** (spójne z tabelą referencyjną z bonusu; preferuj `maxDiffPixels`):

| Komponent | Poprawna tolerancja | Dlaczego |
|---|---|---|
| Nav / topbar (statyczny) | `maxDiffPixels: 50` | mały, full-width; `threshold:0` wymagałby Dockera |
| Hero (gradient + tekst) | `threshold: 0.1` | toleruje subpiksel, łapie shift koloru; 0.15 za luźno |
| Formularz / komórka tabeli | `maxDiffPixels: 30` | mały, tekst-heavy; próg bezwzględny łatwiej obronić |
| Galeria / grid obrazów | `threshold: 0.15` + `maxDiffPixelRatio: 0.02` | szum JPEG OK, ale max 2% pikseli |
| Stopka (statyczna) | `maxDiffPixels: 20` | mały statyczny blok |
| Brand / logo | `threshold: 0.0` **tylko z Dockerem**, inaczej `maxDiffPixels: 10` | ideał wymaga determinizmu cross-OS |
| Element zmienny strukturalnie (timestamp, licznik, id) | **`mask`**, nie threshold | żaden próg tego sensownie nie pokryje |

**False Positive, ground truth:** zdiagnozuj root cause, **zanim** ruszysz liczbę.

| Sytuacja | Poprawny werdykt | Rekomendacja |
|---|---|---|
| realna regresja złapana przez test | `app_bug` | `fix_application` (nie uciszaj) |
| szum kosmetyczny (AA / JPEG) poniżej progu | `threshold_too_low` | `raise_threshold` (mały, z komentarzem, review) |
| element zmienny strukturalnie (timestamp/licznik) | `missing_mask` | `add_mask` (+ niski próg dla reszty) |

> **Gdzie AI się myli:** proponuje **pełzający threshold**: podbicie liczby zamiast diagnozy
> (maska? stabilizacja z S01? mock z L01?). I nie zna realnego designu ani szumu Twojego CI:
> jego wartości to baza, finalne ustalasz po pierwszym tygodniu runów (zmierz realny szum).

---

# S04: Dzień 4 (ground truth)

S04 to momenty **na konfiguracji agenta i na metadanych trackera**, nie na obrazkach. Generatory
produkują artefakty, które lądują w repo (`AGENTS.md`, `SKILL.md`, sekcja polityki), a prompty review
sprawdzają je zanim ktokolwiek je zacommituje. Jedno założenie przewija się przez całą sesję: **model
nie widzi pikseli**, czyta wyłącznie `status`, `diffPercent`, `branchName` i timestampy.

## S04 L01: Trend Analyzer + Evidence Review

**Trend Analyzer, poprawny kształt wyjścia:** JSON z `trending_up[]`, `chronically_flaky[]`,
`patterns[]` i `health_score`. Każdy współczynnik musi dać się przeliczyć ze zrzutu, a trend z mniej
niż pięciu buildów nie jest trendem.

**Evidence Review, ground truth:** `verdict: usable` **tylko** gdy `unsupported_claims` i
`pixel_claims` są puste.

| W raporcie jest… | Poprawny werdykt | Dlaczego |
|---|---|---|
| każdy rate przeliczalny ze zrzutu | `usable` | liczby da się odtworzyć |
| „nagłówek przesunął się w dół” | `rejected`, wpis w `pixel_claims` | model nie dostał obrazków |
| trend z dwóch buildów | `usable_with_edits` | za mała próbka, nie trend |
| `health_score` nie wynikający z list | `rejected` | liczba, której nikt nie odtworzy |
| test czerwony tylko na jednej gałęzi w `chronically_flaky` | `usable_with_edits` | to zmiana na gałęzi, nie flake |

> **Gdzie AI się myli:** wymyśla przyczynę trendu, który jest jednym hałaśliwym popołudniem CI, i
> wchodzi w opis obrazka, choć dostał same metadane. Miesza też flake z regresją: test padający
> wyłącznie na jednej gałęzi to zmiana, którą ktoś tam wprowadził.

## S04 L02: AGENTS.md Generator + Agent Memory Review

**Generator, poprawny kształt:** około 60 linii, sekcje Build & Test, VRT Conventions, Do / Don't,
Where to look. Twarde reguły odtworzone wiernie (zegar przed `goto`, maska `#FF00FF`, priorytet
locatorów, `maxDiffPixels` zamiast `threshold`, baseline w osobnym commicie, zero `networkidle`).
Długie konwencje **linkowane** do `PLAYWRIGHT_GUIDELINES.md`, nie przepisane.

**Memory Review, ground truth:** `secrets_found` niepuste wymusza `rewrite`, niezależnie od reszty.

| W pliku jest… | Poprawny werdykt | Fix |
|---|---|---|
| 60 linii, reguły linkowane | `commit` | brak |
| reguła powtórzona z PLAYWRIGHT_GUIDELINES.md | `commit_after_edits` | zamień na link |
| „pisz czyste testy” | `commit_after_edits` | przepisz na regułę sprawdzalną maszynowo |
| klucz API, token, wewnętrzny host | `rewrite` | usuń, wstaw `<REDACTED>` |
| 200 linii | `commit_after_edits` | to jest pamięć ładowana za każdym razem, nie podręcznik |

> **Gdzie AI się myli:** pisze dokument poprawny i całkowicie generyczny. Nie wie, którą regułę Twój
> zespół realnie łamie, a to jedyne, co uzasadnia trzymanie jej w pamięci. Licz się z wycięciem połowy.

## S04 L03: Build Summary + Approval Policy + Approval Discipline Review

**Build Summary, poprawny kształt:** komentarz markdown, kubełki jako nagłówki, jedna linia na test
run, `diffPercent` przy każdym, na końcu liczby per kubełek.

| Sytuacja w buildzie | Poprawny kubełek |
|---|---|
| różnica pokrywa się z tym, co PR deklaruje zmienić | `expected` |
| różnica na ekranie, którego PR nie dotyczy | `suspicious` |
| za mało danych, żeby rozstrzygnąć | `suspicious` plus zdanie, czego brakuje |
| `baselineBranchName` inny niż `branchName`, zmiana już w gałęzi bazowej | `stale-baseline` |
| status `failed`, porównanie w ogóle nie poszło | `broken` |

**Approval Discipline Review, ground truth:** jakikolwiek wpis w `approval_recommended` wymusza co
najmniej `usable_with_edits`, choćby reszta była udokumentowana wzorowo.

| W tekście jest… | Poprawny werdykt |
|---|---|
| opis i klasyfikacja bez wniosku | `usable` |
| „wygląda dobrze, można zatwierdzić” | `usable_with_edits`, wpis w `approval_recommended` |
| zatwierdzenie na gałęzi opisane jak zatwierdzenie z `merge` | `usable_with_edits` |
| `autoApproved` potraktowany jak decyzja człowieka | `usable_with_edits` |
| test run bez `diffPercent` | `usable_with_edits` |

> **Gdzie AI się myli:** dryfuje w stronę wniosku, a wniosek, po który sięga, to „wygląda dobrze,
> zatwierdź”. To jest dokładnie ta decyzja, której nie oddajemy narzędziu, i przychodzi ubrana
> w uczynność, nie w twierdzenie. Poza tym zrównuje zatwierdzenie na gałęzi z zatwierdzeniem z flagą
> `merge`, choć pierwsze psuje najwyżej Twój widok, a drugie przesuwa punkt odniesienia dla wszystkich.
