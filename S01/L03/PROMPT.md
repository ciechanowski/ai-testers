# S01L03: prompty AI

## AI Prompty

Lekcja produkuje dwie paczki do analizy. Uruchamiasz `npm run test:ai`, a test dokleja
do raportu pliki i gotowy `PROMPT.md`.

### AI HTML Analyzer (sugestie masek z uzasadnieniem)

Surowy HTML strony `/live` (Live Floor) wklejasz do Cursora lub Claude Pro razem
z tym promptem, na swojej subskrypcji Cursora albo Claude Pro, bez klucza API. Model robi pierwszy
przejazd po DOM i typuje, co maskować, w trzech kategoriach (`must` / `should`
/ `nice`), z powodem dla każdego selektora.

```
Zadanie: HTML Analyzer (L03)
Przeanalizuj załączony HTML (plik live-board.html, sekcja „Live Floor" Pixelarium,
strona /live). To dashboard z kilkoma dynamicznymi elementami naraz. Wskaż te, które
trzeba zamaskować w teście VRT, bo zaszumią baseline, i te, których maskować nie wolno.

Zwróć wyłącznie ten JSON:

{
  "must_mask":    [{ "selector": "", "reason": "" }],
  "should_mask":  [{ "selector": "", "reason": "" }],
  "nice_to_mask": [{ "selector": "", "reason": "" }]
}

- must_mask: treść, której nie ustabilizujesz inaczej: losowe liczby (Math.random),
  dane live z API/analytics, session-id / request-id, timestampy spoza kontroli page.clock.
- should_mask: dane z API, które w teście bywają stałe (ceny, liczby produktów), maskuj wąsko.
- nice_to_mask: tylko realne ryzyko, którego config nie łapie.

Załóż konfigurację z lekcji: animations: 'disabled', caret: 'hide', dostępny page.clock
ustawiony przed goto. Maska to ostateczność, najpierw stabilizujesz configiem, dopiero
potem maskujesz resztę. Dlatego NIE proponuj masek na to, co te techniki już stabilizują:

- animacje CSS (np. animate-ping w odznace live-pulse): wyłącza je animations: 'disabled',
- efekty hover/transition, kursor: nie pojawią się bez interakcji,
- elementy liczone z czasu (Date.now() → countdown-timer, last-updated): zamraża je page.clock.

Uwaga-pułapka: page.clock zamraża czas, ale NIE zatrzymuje Math.random(), licznik losowy,
ticker ofert czy session-id i tak są must_mask. Rozróżnij „dynamiczne, bo losowe" (maska) od
„dynamiczne, bo z zegara" (clock, nie maska).

Format selektorów wg priorytetu: data-testid > role > klasa CSS.
```

Przykładowa odpowiedź modelu (skrócona):

```json
{
  "must_mask": [
    { "selector": "[data-testid='bid-ticker']", "reason": "Math.random() co 1s, clock nie zamraża" },
    { "selector": "[data-testid='online-now']", "reason": "losowa liczba live co 2s" },
    { "selector": "[data-testid='server-latency']", "reason": "telemetria ms (Math.random)" },
    { "selector": "[data-testid='session-id']", "reason": "losowy hex, inny po przeładowaniu" },
    { "selector": "[data-testid='live-counter']", "reason": "Math.random() co 3s" }
  ],
  "should_mask": [
    { "selector": "[data-testid='floor-price']", "reason": "cena z API, w teście stała, maskuj wąsko" }
  ],
  "nice_to_mask": []
}
```

### AI Flake Root-Cause (który element przeciekł)

Drugi prompt tej samej lekcji, dokładany przez ten sam test. Tutaj nie pytasz, co maskować,
tylko dlaczego baseline i actual już się różnią: model dostaje oba zrzuty razem z HTML-em
i ma wskazać konkretny element oraz gotową poprawkę.

```
Zadanie: Flake Root-Cause (L03)
Test VRT flakuje. Masz: baseline + actual (dwa zrzuty „Live Floor" przed/po) + HTML
(live-board.html). Zdiagnozuj, KTÓRY element przeciekł, i podaj gotowy fix.

Jak czytać: porównaj baseline → actual, znajdź obszar, który się różni, i dopasuj go do
elementu w live-board.html. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
przeciekać może kilka elementów naraz, wskaż każdy i rozróżnij źródło: losowość (maska)
vs zegar (clock przed goto, nie maska).

Zwróć wyłącznie ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```

Uwaga na podział, który jest sensem tego promptu: losowość leczy maska, a czas leczy
`page.clock` ustawiony przed `goto`. Jeśli model proponuje maskę na `countdown-timer`,
pomylił jedno z drugim.

### AI Flake Root-Cause (który element przeciekł)

Drugi prompt tej samej lekcji, dokładany przez ten sam test. Tutaj nie pytasz, co maskować,
tylko dlaczego baseline i actual już się różnią: model dostaje oba zrzuty razem z HTML-em
i ma wskazać konkretny element oraz gotową poprawkę.

```
Zadanie: Flake Root-Cause (L03)
Test VRT flakuje. Masz: baseline + actual (dwa zrzuty „Live Floor" przed/po) + HTML
(live-board.html). Zdiagnozuj, KTÓRY element przeciekł, i podaj gotowy fix.

Jak czytać: porównaj baseline → actual, znajdź obszar, który się różni, i dopasuj go do
elementu w live-board.html. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
przeciekać może kilka elementów naraz, wskaż każdy i rozróżnij źródło: losowość (maska)
vs zegar (clock przed goto, nie maska).

Zwróć wyłącznie ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```

Uwaga na podział, który jest sensem tego promptu: losowość leczy maska, a czas leczy
`page.clock` ustawiony przed `goto`. Jeśli model proponuje maskę na `countdown-timer`,
pomylił jedno z drugim.

### AI Flake Root-Cause (który element przeciekł)

Drugi prompt tej samej lekcji, dokładany przez ten sam test. Tutaj nie pytasz, co maskować,
tylko dlaczego baseline i actual już się różnią: model dostaje oba zrzuty razem z HTML-em
i ma wskazać konkretny element oraz gotową poprawkę.

```
Zadanie: Flake Root-Cause (L03)
Test VRT flakuje. Masz: baseline + actual (dwa zrzuty „Live Floor" przed/po) + HTML
(live-board.html). Zdiagnozuj, KTÓRY element przeciekł, i podaj gotowy fix.

Jak czytać: porównaj baseline → actual, znajdź obszar, który się różni, i dopasuj go do
elementu w live-board.html. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
przeciekać może kilka elementów naraz, wskaż każdy i rozróżnij źródło: losowość (maska)
vs zegar (clock przed goto, nie maska).

Zwróć wyłącznie ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```

Uwaga na podział, który jest sensem tego promptu: losowość leczy maska, a czas leczy
`page.clock` ustawiony przed `goto`. Jeśli model proponuje maskę na `countdown-timer`,
pomylił jedno z drugim.

### AI Flake Root-Cause (który element przeciekł)

Drugi prompt tej samej lekcji, dokładany przez ten sam test. Tutaj nie pytasz, co maskować,
tylko dlaczego baseline i actual już się różnią: model dostaje oba zrzuty razem z HTML-em
i ma wskazać konkretny element oraz gotową poprawkę.

```
Zadanie: Flake Root-Cause (L03)
Test VRT flakuje. Masz: baseline + actual (dwa zrzuty „Live Floor" przed/po) + HTML
(live-board.html). Zdiagnozuj, KTÓRY element przeciekł, i podaj gotowy fix.

Jak czytać: porównaj baseline → actual, znajdź obszar, który się różni, i dopasuj go do
elementu w live-board.html. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
przeciekać może kilka elementów naraz, wskaż każdy i rozróżnij źródło: losowość (maska)
vs zegar (clock przed goto, nie maska).

Zwróć wyłącznie ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```

Uwaga na podział, który jest sensem tego promptu: losowość leczy maska, a czas leczy
`page.clock` ustawiony przed `goto`. Jeśli model proponuje maskę na `countdown-timer`,
pomylił jedno z drugim.

### AI Flake Root-Cause (który element przeciekł)

Drugi prompt tej samej lekcji, dokładany przez ten sam test. Tutaj nie pytasz, co maskować,
tylko dlaczego baseline i actual już się różnią: model dostaje oba zrzuty razem z HTML-em
i ma wskazać konkretny element oraz gotową poprawkę.

```
Zadanie: Flake Root-Cause (L03)
Test VRT flakuje. Masz: baseline + actual (dwa zrzuty „Live Floor" przed/po) + HTML
(live-board.html). Zdiagnozuj, KTÓRY element przeciekł, i podaj gotowy fix.

Jak czytać: porównaj baseline → actual, znajdź obszar, który się różni, i dopasuj go do
elementu w live-board.html. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
przeciekać może kilka elementów naraz, wskaż każdy i rozróżnij źródło: losowość (maska)
vs zegar (clock przed goto, nie maska).

Zwróć wyłącznie ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```

Uwaga na podział, który jest sensem tego promptu: losowość leczy maska, a czas leczy
`page.clock` ustawiony przed `goto`. Jeśli model proponuje maskę na `countdown-timer`,
pomylił jedno z drugim.

To, co dostajesz w `must_mask`, wklejasz wprost do `mask: []` w `toHaveScreenshot()`.

**Zasada selektorów:** prosisz o priorytet `data-testid > role > CSS class`.
Gdy element ma `data-testid`, model go użyje; gdy nie (np. cena renderowana jako
`<span class="… font-bold …">` bez `data-testid`), przechodzi na selektor CSS.
W realnym projekcie lepiej wtedy dodać `data-testid` i zawęzić maskę.

**Granica:** werdykt to sugestia, nie wyrok. Dobry analyzer odróżnia „dynamiczne,
bo losowe” (maska) od „dynamiczne, bo z zegara / animacji” (config): `countdown-timer`
i `last-updated` liczą się z `Date.now()` i zamraża je `page.clock`, a `live-pulse`
to animacja CSS uciszana przez `animations: 'disabled'`. Jeśli model wrzuci maskę
na `countdown-timer`, to sygnał, że nie uwzględnił konfiguracji z lekcji; popraw to
ty. Nigdy nie wysyłaj do modelu produkcyjnego HTML z danymi osobowymi (PII) bez
oczyszczenia (regex na `data-user-*`, `data-session-*`).
