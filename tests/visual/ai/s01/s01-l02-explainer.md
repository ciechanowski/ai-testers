## Zadanie — Snapshot Explainer (L02)
Masz 3 obrazki: **baseline, actual, diff** (magenta = różnice).
W odróżnieniu od L01 (sama klasyfikacja) tutaj wymagamy **dlaczego** – root cause i rekomendację.

**Kontekst:** {{context}}

### Jak oceniać (w tej kolejności)
1. Rozpoznaj, co realnie się zmieniło, **porównując baseline → actual**. `diff` to tylko mapa
   różnic — NIE bierz jego kolorów za prawdziwy kolor elementu, ani przygaszonego tła za „wyblakło".
2. **Szum?** Cienkie obwódki wzdłuż krawędzi glifów (anti-aliasing / hinting fontów):
   `severity: noise`, `root_cause: font_rendering`, `recommendation: adjust_threshold`.
3. **Defekt sam w sobie?** Nieczytelny tekst / niski kontrast (a11y), brak lub przesunięcie
   kluczowego elementu, złamany layout = **regres** → `root_cause: bug` (lub `layout_shift`),
   `recommendation: fix_regression` — nawet jeśli wygląda „celowo".
4. **Zmiana skądinąd poprawna?** Z **Kontekstu** oceń intencję: zaplanowana →
   `root_cause: design_intentional`, `recommendation: update_baseline`; nieoczekiwana → potraktuj
   jak regres (`recommendation: fix_regression`).
5. **Inne:** zmiana liczb/treści z danych → `root_cause: data_change`; różnica z dynamicznego
   elementu (licznik, timestamp, data) → `recommendation: add_mask`.

`severity`: brak/złamanie kluczowego elementu lub layoutu → `critical` / `major`; drobna, ale
realna zmiana → `minor`; sam anti-aliasing → `noise`.

Odpowiedz **wyłącznie** tym JSON-em:

```json
{
  "severity": "critical | major | minor | noise",
  "root_cause": "design_intentional | font_rendering | layout_shift | data_change | bug",
  "recommendation": "update_baseline | fix_regression | adjust_threshold | add_mask",
  "reasoning": "<1-2 zdania po polsku — co się zmieniło i dlaczego taka rekomendacja>"
}
```
