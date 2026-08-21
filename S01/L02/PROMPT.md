# S01L02: prompty AI

## AI Prompty

### AI Snapshot Explainer (triage z uzasadnieniem)

W odróżnieniu od L01 Snapshot Triage (sama klasyfikacja bug/szum) tutaj wymagamy
*dlaczego*: przyczyny i rekomendowanej akcji. Trzy obrazki z raportu Playwright
(baseline, actual, diff) przeciągasz do Cursora lub Claude Pro razem z tym promptem,
na swojej subskrypcji Cursora albo Claude Pro, bez klucza API. Prompt to dokładnie załącznik `PROMPT.md`,
który gotowy test dokleja do raportu przy faile.

```
Zadanie: Snapshot Explainer (L02)
Masz 3 obrazki: baseline, actual, diff (magenta = różnice).
W odróżnieniu od L01 (sama klasyfikacja) tutaj wymagamy dlaczego: root cause i rekomendację.

Kontekst: [wstawia go test przy faile, np. karta dzieła na /gallery, design system Tailwind, ten PR celowo aktualizuje tokeny]

Jak oceniać (w tej kolejności)
1. Rozpoznaj, co realnie się zmieniło, porównując baseline → actual. diff to tylko mapa
   różnic, NIE bierz jego kolorów za prawdziwy kolor elementu, ani przygaszonego tła za „wyblakło".
2. Szum? Cienkie obwódki wzdłuż krawędzi glifów (anti-aliasing / hinting fontów):
   severity: noise, root_cause: font_rendering, recommendation: adjust_threshold.
3. Defekt sam w sobie? Nieczytelny tekst / niski kontrast (a11y), brak lub przesunięcie
   kluczowego elementu, złamany layout = regres → root_cause: bug (lub layout_shift),
   recommendation: fix_regression, nawet jeśli wygląda „celowo".
4. Zmiana skądinąd poprawna? Z Kontekstu oceń intencję: zaplanowana →
   root_cause: design_intentional, recommendation: update_baseline; nieoczekiwana → potraktuj
   jak regres (recommendation: fix_regression).
5. Inne: zmiana liczb/treści z danych → root_cause: data_change; różnica z dynamicznego
   elementu (licznik, timestamp, data) → recommendation: add_mask.

severity: brak/złamanie kluczowego elementu lub layoutu → critical / major; drobna, ale
realna zmiana → minor; sam anti-aliasing → noise.

Odpowiedz wyłącznie tym JSON-em:

{
  "severity": "critical | major | minor | noise",
  "root_cause": "design_intentional | font_rendering | layout_shift | data_change | bug",
  "recommendation": "update_baseline | fix_regression | adjust_threshold | add_mask",
  "reasoning": "<1-2 zdania po polsku, co się zmieniło i dlaczego taka rekomendacja>"
}
```

Przykładowa odpowiedź modelu (przypadek `card-design`: zmiana zaplanowana):

```json
{
  "severity": "minor",
  "root_cause": "design_intentional",
  "recommendation": "update_baseline",
  "reasoning": "Border i zaokrąglenie karty spójne z zaplanowanymi tokenami design systemu (PR). Layout nienaruszony, update baseline + opis w PR."
}
```

**Zasada decyzji:** pole `recommendation` mapujesz wprost na akcję: `update_baseline`
to akceptacja (`npm run test:vrt:update` / `--update-snapshots`), `fix_regression` to
sygnał, że poprawiasz kod i wracasz do zielonego. To te same dwie gałęzie triażu,
które nazywa za ciebie model.

**Zasada kontekstu:** kontekst podajesz jako *fakt o pull requeście*
(„ten PR celowo aktualizuje design system”), nie jako gotowy wniosek („to jest celowa
zmiana”). Model ma ocenić z diffa, czy to, co widzi, jest z tym kontekstem spójne.

**Granica:** werdykt to sugestia. Zawsze zerknij na `diff.png`, traktuj `reasoning`
z dystansem (werdykt bywa OK, mimo że uzasadnienie zmyślone), a `--update-snapshots`
odpalaj dopiero po własnym potwierdzeniu. Nigdy nie wysyłaj do modelu screenshotów
z danymi osobowymi (PII) bez maskowania.
