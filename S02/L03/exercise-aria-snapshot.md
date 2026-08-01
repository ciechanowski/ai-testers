# Ćwiczenie: ARIA snapshot + AI (S02L03)

Samodzielne ćwiczenie do lekcji S02L03. Najpierw przypinasz drzewo dostępności testem **ręcznie**
na znanym komponencie (nawigacja), a potem **agentem z Playwright MCP** budujesz test ARIA dla **innej
podstrony** (`/gallery`) z jej żywego drzewa dostępności i robisz **review** wynikowego `.aria.yml` jak kodu.

> Materiał na osobne nagranie wideo. Możesz przejść je niezależnie od reszty slajdów.

## Cel

- Przypiąć strukturę komponentu testem `toMatchAriaSnapshot()` i zobaczyć wygenerowany YAML.
- Zrozumieć podział pracy: **MCP czyta żywe drzewo dostępności** (`browser_snapshot`) i pisze gotowy spec
  z `.aria.yml`, a **Twoją rolą jest review** tego pliku w PR — czytasz go jak diff kodu, nie jak czerwoną
  plamę na PNG.

## Czego potrzebujesz

- Działające Pixelarium lokalnie: `cd app && npm run dev` (domyślnie `http://localhost:5173`).
- Playwright w wersji co najmniej `1.50` (zewnętrzne pliki `.aria.yml`).
- Skonfigurowany Playwright MCP w kliencie (z lekcji **L02**) — do Części 2.

## Część 1 — przypnij drzewo ręcznie (bez AI)

1. Wybierz komponent, np. główną nawigację: `page.getByRole('navigation', { name: 'Main' })`.
2. Dodaj asercję ARIA snapshot do testu:
   ```ts
   const nav = page.getByRole('navigation', { name: 'Main' });
   await expect(nav).toMatchAriaSnapshot({ name: 'nav.aria.yml' });
   ```
3. Wygeneruj baseline: `npx playwright test --update-snapshots`. Playwright utworzy plik `nav.aria.yml`.
   Obejrzyj YAML, a potem zacommituj go jak zwykły kod (podlega review w PR).

To jest Twój baseline = **źródło prawdy** o strukturze komponentu.

## Część 2 — Playwright MCP buduje test dla innej podstrony (`/gallery`)

W Części 1 przypiąłeś znaną nawigację ręcznie. Teraz weź **inną podstronę** – `/gallery` – i niech
**agent z Playwright MCP** sam na nią wejdzie, przeczyta jej **żywe drzewo dostępności** (`browser_snapshot`)
i napisze gotowy `.spec.ts` z `toMatchAriaSnapshot`. Bez kopiuj-wklej drzewa.

Daj agentowi prompt **dokładnie taki jak na slajdzie**:

```
You have Playwright MCP. For the /gallery page:
1. browser_navigate, then browser_snapshot
   (read the live accessibility tree).
2. Write gallery.visual.spec.ts with toMatchAriaSnapshot
   on the main content — use roles & names from the snapshot.
3. Run: npx playwright test gallery --update-snapshots
4. Show me gallery.aria.yml; drop unstable nodes.
```

Plik promptu: [`tests/visual/ai/s02/s02-l03-aria-mcp.md`](../../tests/visual/ai/s02/s02-l03-aria-mcp.md).

Baseline (`gallery.aria.yml`) powstaje z żywego drzewa, więc jest zgodny ze stroną z definicji. **Twoja rola:
review** wynikowego `.aria.yml` w PR – jak każdego kodu (krok 4: wyrzuć niestabilne węzły).

> **Wariant głębszy (opcjonalny):** zamiast `--update-snapshots` zapisz draft `.aria.yml` i uruchom test
> **bez** `--update`. Wtedy Playwright porówna draft z żywym drzewem, a **czerwony** pokaże dokładnie, gdzie
> AI zmyśliło rolę lub nazwę – źródłem prawdy jest drzewo dostępności, nie zgadywanie.

## Oczekiwany wynik

- `gallery.aria.yml` powstał z żywego drzewa (`browser_snapshot`), więc jest zgodny ze stroną – nie zgadywany.
- Diff `.aria.yml` czytasz w PR jak diff kodu: „`link` stał się `button`", a nie czerwona plama na PNG.
- Pixel diff (screenshot) tej struktury nie tworzy — warstwę ARIA przypinasz osobno.

## Kryteria ukończenia

- [ ] Masz wygenerowany `nav.aria.yml` z `--update-snapshots` (Część 1) i rozumiesz jego strukturę.
- [ ] Agent z MCP zbudował `gallery.visual.spec.ts` + `gallery.aria.yml` dla `/gallery` z żywego drzewa.
- [ ] Zreview'owałeś `.aria.yml` i wyrzuciłeś niestabilne węzły (krok 4 promptu).

## Pułapki

- **Niestabilny stan** (`aria-expanded`, hover, focus) → niestabilny snapshot (flaky). Ustabilizuj stan
  przed snapshotem albo użyj `[exact: false]` przy i18n.
- **Zła ścieżka `.aria.yml`** → Playwright szuka pliku obok specu; po refaktorze testu „znika". Po
  `--update-snapshots` sprawdź `git status`.
- **ARIA snapshot to nie pełny audyt a11y** — obejmuje strukturę, NIE kontrast czy kolejność focusu
  (do tego axe-core i test czytnikiem).

## Model solution

Warstwowy pixel + ARIA: [`tests/visual/s02/s02-l03-aria.visual.spec.ts`](../../tests/visual/s02/s02-l03-aria.visual.spec.ts).
