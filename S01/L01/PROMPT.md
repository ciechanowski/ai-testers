# S01L01: prompty AI

## AI Prompty

### AI Snapshot Triage (efekt „wow”)

Trzy obrazki z raportu Playwright (baseline, actual, diff) przeciągasz do Cursora
lub Claude Pro razem z tym promptem: na swojej subskrypcji Cursora albo Claude Pro, bez klucza API.

```
Zadanie: Snapshot Triage (L01)
Masz 3 obrazki: baseline, actual, diff (magenta = różnice).

Jak czytać: opisuj zmianę porównując baseline → actual. diff to tylko mapa różnic
(kolor = piksele, które się różnią; przygaszone tło = bez zmian). NIE bierz kolorów diffa za
prawdziwy kolor elementu, ani przygaszonego tła za „wyblakło".

Kontekst: [tu wpisujesz fakt o pull requeście, np. to nagłówek strony (header, role=banner), design system Tailwind]

Czy ta różnica to realny bug, czy tylko szum (anti-aliasing / font rendering /
subpiksele)? Odpowiedz wyłącznie tym JSON-em:

{
  "severity": "critical | major | minor | noise",
  "action": "block | review | accept"
}

Reguła kciuka: noise → accept (auto-akceptacja baseline), realna zmiana → block,
wątpliwa → review (niech zdecyduje człowiek).
```

Przykładowa odpowiedź modelu:

```json
{
  "severity": "noise",
  "action": "accept"
}
```

**Zasada kontekstu:** kontekst podajesz jako *fakt o pull requeście*
(„czy ten PR rusza design system?”), nie jako gotowy wniosek („to jest bug”).
Model ma wywnioskować ocenę, a nie ją od ciebie przepisać.

**Granica:** werdykt to sugestia. Zawsze zerknij na `diff.png`, porównaj z kluczem
w repo, a `--update-snapshots` odpalaj dopiero po własnym potwierdzeniu.
Nigdy nie wysyłaj do modelu screenshotów z danymi osobowymi (PII) bez maskowania.
