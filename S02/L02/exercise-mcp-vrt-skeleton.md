# Ćwiczenie: Playwright MCP — wygeneruj i dopracuj szkielet VRT (S02L02)

Samodzielne ćwiczenie do lekcji S02L02. Agent z **Playwright MCP** generuje szkielet testu VRT z **żywego
drzewa dostępności** (`browser_snapshot`), a Ty podnosisz jego jakość **dobrymi zasadami w prompcie**
(clock, mask, threshold). Robisz dokładnie to, co na slajdach, na stronie `/about`.

> Materiał na osobne nagranie wideo. Możesz przejść je niezależnie od reszty slajdów.

## Cel

- Zobaczyć, że MCP dobiera lokatory z **realnego drzewa dostępności** (role z `browser_snapshot`), nie zgaduje CSS.
- Zrozumieć granicę: **MCP = akcelerator startu** (szkielet z żywego DOM), a **determinizm VRT** wymuszasz
  Ty — dobrymi zasadami w prompcie i świadomą decyzją o masce.

## Czego potrzebujesz

- Działające Pixelarium lokalnie: `cd app && npm run dev` (domyślnie `http://localhost:5173`).
- Skonfigurowany Playwright MCP w kliencie (Cursor / Claude Desktop / VS Code):
  `npx @playwright/mcp@latest` w `mcp.json`.

## Część 1: agent generuje szkielet (prompt ze slajdu)

Daj agentowi prompt **dokładnie taki jak na slajdzie**. Agent sam dobierze narzędzia MCP w kolejności
`browser_navigate` → `browser_snapshot` → `browser_generate_locator` → spec:

```
Open /about on http://localhost:5173, take an
accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots
getByRole('main').
Use role-based locators from the snapshot, not CSS.
```

Plik promptu: [`tests/visual/ai/s02/s02-l02-mcp-skeleton.md`](../../tests/visual/ai/s02/s02-l02-mcp-skeleton.md).

Efekt: szkielet z asercją `toHaveScreenshot()` i lokatorem `getByRole('main')` wziętym z drzewa — ale jeszcze
**flaky** (sekcja „Statistics” na `/about` ma animowany licznik).

## Część 2: dopracowanie, dobre zasady w prompcie (prompt ze slajdu)

Ten sam prompt, wzbogacony o zasady determinizmu. Im lepsze zasady wpiszesz, tym wyższej jakości test
wygeneruje MCP/LLM — ale ostateczną decyzję, co zamaskować, podejmujesz świadomie Ty:

```
Open /about on http://localhost:5173, take an
accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots
getByRole('main'). Use role-based locators, not CSS.

// nowe: wymuś determinizm
- page.clock.setFixedTime(...) BEFORE goto
- mask the animated "Statistics" counter (+ maskColor)
- set a sensible threshold
```

Plik promptu: [`tests/visual/ai/s02/s02-l02-mcp-refine.md`](../../tests/visual/ai/s02/s02-l02-mcp-refine.md).

> Licznik „Statistics” tika przez `requestAnimationFrame`, którego `page.clock` nie zamraża — dlatego sam
> clock nie wystarczy i potrzebna jest `mask:`.

## Oczekiwany wynik

- Szkielet od MCP używa lokatorów z drzewa dostępności (`getByRole('main')`), nie CSS.
- Po dopracowaniu (Część 2) test jest **deterministyczny**: dwa przebiegi pod rząd = 0 diffów.
- Rozumiesz, że MCP przyspieszył *pisanie*, ale za *determinizm i decyzję o masce* odpowiadasz Ty.

Modelowy, dopracowany szkielet (zielony, deterministyczny):
[`tests/visual/s02/s02-l02-mcp-generated.visual.spec.ts`](../../tests/visual/s02/s02-l02-mcp-generated.visual.spec.ts).

## Kryteria ukończenia

- [ ] Masz szkielet wygenerowany przez MCP dla `/about` (lokator `getByRole('main')` z `browser_snapshot`, nie CSS).
- [ ] Po Części 2 test ma `page.clock.setFixedTime` przed `goto` oraz świadomą `mask:` na liczniku „Statistics”.
- [ ] Dwa kolejne `npx playwright test` (bez `--update-snapshots`) przechodzą na zielono, deterministycznie.

## Pułapki

- **Sam `clock` nie wystarczy** — licznik „Statistics” tika przez `requestAnimationFrame` mimo zamrożonego
  czasu. Bez `mask` test będzie flaky.
- **Lokatory CSS od agenta** → kruche po refaktorze. Poproś o role z `browser_snapshot`.
- **MCP w CI** → serwer jest interaktywny i steruje realną przeglądarką; w CI używasz zwykłego `npx playwright test`.
- **Prywatność:** MCP steruje Twoją realną przeglądarką (cookies, sesje). Ćwicz na demie, nie na produkcji z danymi.
