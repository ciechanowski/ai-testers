# CLAUDE.md

Kurs AI Testers: VRT z Playwright i TypeScript. Ten plik jest pamięcią agenta i wczytuje się automatycznie w każdej sesji uruchomionej w tym repo.

## Twarde reguły VRT

Obowiązują przy każdym generowaniu i przeglądaniu testu wizualnego:

1. `page.clock.setFixedTime(...)` **przed** `page.goto()`, nigdy po. Po `goto` strona już odczytała `Date.now()`, więc zamrożenie zegara nie zadziała.
2. `mask: [locator]` z `maskColor: '#FF00FF'` zamiast `display: none`. Maska zachowuje układ, ukrywanie przez CSS go zmienia.
3. Priorytet locatorów: `getByTestId` > `getByRole` / `getByLabel` > `getByText` > CSS. Inaczej niż w testach funkcjonalnych, bo aplikacja chodzi w trzech językach i nazwy dostępne się zmieniają.
4. Tolerancję ustawiaj przez `maxDiffPixels`, nie przez podnoszenie `threshold`.
5. Baseline w osobnym commicie, wiadomość w formacie `test: baseline update - <powód>`.
6. NIE `networkidle`, NIE `waitForTimeout`. Czekaj jawną asercją na konkretny element.

## Czego nie robić

- Nie uruchamiaj testów samodzielnie. Zaproponuj komendę, decyduje autor.
- Nie aktualizuj baseline'ów samodzielnie. `--update-snapshots` to krok review, nie sposób na czerwony bieg.
- Nie wstawiaj do przykładów prawdziwych kluczy ani danych dostępowych. Używaj `<REDACTED>`.

## Pełne konwencje

Nazewnictwo, strategia baseline'ów, progi per komponent, zasady maskowania, obieg PR i lista anty-wzorców: **PLAYWRIGHT_GUIDELINES.md** w tym katalogu.

Ten plik celowo **wskazuje ścieżkę zamiast importować przez `@`**. Import wciągnąłby cały dokument do kontekstu przy każdym starcie sesji, a chodzi o to, żeby pamięć była zwięzła, a długie treści doczytywane wtedy, gdy są potrzebne.

## Struktura repo

- `app/`: aplikacja Pixelarium, obiekt testów
- `tests/visual/s0*/`: specki wizualne per sesja kursu
- `tests/pages/`: Page Objecty
- `tests/fixtures/`: factory z deterministycznymi danymi
- `S01/` do `S04/`: per lekcja `PROMPT.md` z promptami AI oraz kod zadań domowych i modelowych rozwiązań
- `.claude/skills/`: skille VRT z S03L03 (`vrt-spec`, `vrt-pom`, `vrt-factory`, `vrt-i18n`)
- `docker-compose.yml`, `vrt.json`: Visual Regression Tracker z S04L01
