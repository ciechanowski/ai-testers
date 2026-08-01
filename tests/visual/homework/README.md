# S01 L04 — Homework (fundamenty VRT)

Napisz — **przy pomocy AI** — stabilny test VRT dla dynamicznej strony
**Creator Studio** (bezpośredni URL `http://localhost:5173/studio`, celowo poza nav).
Strona jest naszpikowana elementami, które psują screenshoty: losowe liczby, live feed,
odliczania, zegary. Twoje zadanie: odróżnić, **co maskować, a co zamraża `page.clock`**.

## Krok 1 — analiza HTML przez AI (must / should / nice)

Otwórz `/studio`, skopiuj HTML sekcji `data-testid="studio-dashboard"` (DevTools →
Elements). Wklej do AI z promptem `tests/visual/ai/prompts/s01-l03-html-analyzer.md`.
Dostaniesz kubełki:
- **must_mask** — losowe (`Math.random`): przychód, oglądający, konwersja, session ID, feed.
- **should_mask** — dane ze statycznego źródła (top sprzedaż) — wąsko, tylko jeśli hałasuje.
- **nice / NIE maskować** — czas (odliczanie, „N s temu", zegar): to zamraża `page.clock`,
  maska = strata sygnału. Puls „LIVE" (CSS) łapie `animations:'disabled'`.

> AI daje **kontekst, nie werdykt** — zweryfikuj selektory sam w DevTools.

## Krok 2 — napisz test (z pomocą AI)

Na podstawie kubełków z kroku 1 poproś AI o szkielet, potem dopracuj. Plik:
`tests/visual/homework-s01-<imie>.visual.spec.ts`. Wymagania:
- `page.clock.setFixedTime(new Date('2026-01-15T12:00:00Z'))` w `beforeEach`, **przed** `goto('/studio')`.
- Jawna web assertion (`await expect(page.getByRole('main')).toBeVisible()`), nie `networkidle`.
- Screenshot scope'owany do `getByTestId('studio-dashboard')` (element) **oraz** jeden full page.
- `mask: [locator]` na wszystkich `must_mask`; **co najmniej raz** `maskColor: '#FF00FF'`.
- Elementy czasowe **bez** maski — mają być stabilne dzięki `page.clock`.

## Krok 3 — stabilność

```bash
npx playwright test homework-s01-<imie> --update-snapshots   # baseline
npx playwright test homework-s01-<imie>                       # 3× z rzędu → 0 diff
```
Jeśli coś flakuje: prompt `s01-l03-flake-root-cause.md` → dorzuć maskę albo popraw clock.

## Dostarczasz
- `tests/visual/homework-s01-<imie>.visual.spec.ts`
- `solution-<imie>.md` — użyty prompt AI + odpowiedź (min. jeden przykład).

Modelowe rozwiązanie: `S01/L04_Solution/s01-studio.solution.spec.ts` — zajrzyj dopiero
po swojej pierwszej wersji.
