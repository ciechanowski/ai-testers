## Zadanie — Snapshot Triage (L01)
Masz 3 obrazki: **baseline, actual, diff** (magenta = różnice).

> **Jak czytać:** opisuj zmianę porównując **baseline → actual**. `diff` to tylko mapa różnic
> (kolor = piksele, które się różnią; przygaszone tło = bez zmian). NIE bierz kolorów diffa za
> prawdziwy kolor elementu, ani przygaszonego tła za „wyblakło".

**Kontekst:** {{context}}

Czy ta różnica to **realny bug**, czy tylko **szum** (anti-aliasing / font rendering /
subpiksele)? Odpowiedz **wyłącznie** tym JSON-em:

```json
{
  "severity": "critical | major | minor | noise",
  "action": "block | review | accept"
}
```

Reguła kciuka: `noise → accept` (auto-akceptacja baseline), realna zmiana → `block`,
wątpliwa → `review` (niech zdecyduje człowiek).
