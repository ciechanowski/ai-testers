# Ćwiczenie: AI Responsive Diff (S02L01)

Samodzielne ćwiczenie do lekcji S02L01. Uczysz AI rozróżniać **zamierzony responsive** od **buga**
na podstawie zrzutów tej samej strony w różnych szerokościach ekranu.

> Materiał na osobne nagranie wideo. Możesz przejść je niezależnie od reszty slajdów.

## Cel

Na `/gallery` w Pixelarium boczny panel filtrów (sidebar, `data-testid="gallery-sidebar"`) na desktopie
zwija się poniżej breakpointu `lg` (1024 px) do poziomego paska chipów (chips). To **zamierzone** zachowanie
responsive. Twoim zadaniem jest dać AI komplet zrzutów i sprawdzić, czy odróżni je od prawdziwej regresji.

## Czego potrzebujesz

- Działające Pixelarium lokalnie: `cd app && npm run dev` (domyślnie `http://localhost:5173`).
- Projekty z **S01/L02**: `mobile-light` (poniżej `lg` → chipy) i `desktop-light` (powyżej `lg` → sidebar).
- Maskowanie dynamicznych elementów jak w **S01/L03** (bez powtarzania tutaj).

## Kroki

1. **Wygeneruj zrzuty** `/gallery` w **dwóch projektach** z **S01/L02** (viewport bierze się z projektu,
   nie z `setViewportSize()`): `mobile-light` (iPhone 13, poniżej `lg` → chipy) i `desktop-light`
   (1920 px, powyżej `lg` → sidebar). Opcjonalnie dorzuć `desktop-dark`, żeby AI oceniło też wariant ciemny.
2. **Daj AI komplet zrzutów** i poproś o werdykt do każdej różnicy: zwinięcie (collapse) czy bug?
   Użyj promptu poniżej.
3. **Wstrzyknij regresję** w przeglądarce: `/gallery?vrt=sidebar-desktop-gone` — sidebar znika także na
   desktopie, a chipy zostają ukryte, więc filtrów nie ma wcale. To już **bug**. Sprawdź, czy AI go złapie.

## Prompt do AI (triage różnic)

```
2-3 screenshots of /gallery: mobile-light (iPhone 13, < lg)
and desktop-light/-dark (1920 px, >= lg); breakpoint lg = 1024.
For EACH diff decide: intended responsive (sidebar->chips
below lg, hamburger, reflow) or BUG (h-scroll, overlap, clipped
CTA, filters gone). Return JSON: {severity, classification, fix}.
```

Pełna wersja promptu (ze schematem JSON odpowiedzi): [`tests/visual/ai/s02/s02-l01-responsive-diff.md`](../../tests/visual/ai/s02/s02-l01-responsive-diff.md).

## Oczekiwany wynik

- Dla zrzutów **bez regresji** AI klasyfikuje zwinięcie sidebara do chipów jako `responsive`, nie `bug`.
- Dla wariantu `?vrt=sidebar-desktop-gone` AI oznacza brak filtrów jako `bug` z konkretnym `fix`.

Chodzi o to, żeby AI rozróżniało **dlaczego** strona się różni, nie tylko **czy** się różni.

> **To jest triage, nie wyrocznia.** Werdykt AI bywa niedeterministyczny — przy ponownym uruchomieniu
> ten sam zrzut może dostać inną klasyfikację. AI ma przyspieszyć wstępną selekcję różnic; **ostateczną
> decyzję (responsive czy bug) podejmujesz Ty**. Tu nie ma automatycznego weryfikatora jak w S02/L03.

## Kryteria ukończenia

- [ ] Masz realne zrzuty `/gallery` z projektów `mobile-light` (chipy) i `desktop-light` (sidebar); opcjonalnie `desktop-dark`.
- [ ] AI poprawnie nazywa zwinięcie sidebar → chipy jako zamierzony responsive.
- [ ] Po wstrzyknięciu regresji AI wykrywa brak filtrów i proponuje sensowny `fix`.

## Pułapki

- Nie traktuj każdej różnicy między szerokościami jako buga — kolaps, hamburger i reflow to oczekiwany responsive.
- Maskuj dynamiczne elementy (jak w S01/L03), żeby AI nie raportowało szumu zamiast realnych różnic.
- **Prywatność:** Pixelarium to dane treningowe, więc zrzuty wysyłasz bez obaw. W realnym projekcie nie
  wklejaj wrażliwych zrzutów ani kodu do publicznego LLM — sprawdź politykę danych narzędzia.
