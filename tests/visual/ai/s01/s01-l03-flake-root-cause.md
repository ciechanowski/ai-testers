## Zadanie — Flake Root-Cause (L03)
Test VRT flakuje. Masz: **baseline** + **actual** (dwa zrzuty „Live Floor" przed/po) + HTML
(**live-board.html**). Zdiagnozuj, **KTÓRY element przeciekł**, i podaj gotowy fix.

> **Jak czytać:** porównaj **baseline → actual**, znajdź obszar, który się różni, i dopasuj go do
> elementu w `live-board.html`. Opisuj realną różnicę między zrzutami, nie zgaduj. Na tej stronie
> przeciekać może **kilka** elementów naraz — wskaż każdy i rozróżnij źródło: losowość (maska)
> vs zegar (`clock` przed `goto`, nie maska).

Zwróć **wyłącznie** ten JSON (jeśli przeciekł więcej niż jeden element, użyj tablicy obiektów):

```json
{
  "leaked_element": "<selektor elementu z różnicą>",
  "root_cause": "dynamic_content | css_animation | anti_aliasing | lazy_load",
  "fix": "<konkretny mask: locator LUB brakująca technika: clock_before_goto / animations_disabled / caret_hide>",
  "reasoning": "<1-2 zdania po polsku>"
}
```
