# S01L02: prompty AI

## Przykład z AI

### AI Snapshot Explainer – ręczny triage z uzasadnieniem

W odróżnieniu od L01 Snapshot Triage (tylko klasyfikacja bug/szum), tutaj wymagamy **dlaczego**.

```
Prompt: "Masz 3 obrazki: baseline, actual, diff. Kontekst: karta dzieła (/gallery),
rogi i border zmienione – token design systemu (ticket DS-214).
Odpowiedz JSON: {
  severity: 'critical|major|minor|noise',
  root_cause: 'design_intentional|font_rendering|layout_shift|data_change|bug',
  recommendation: 'update_baseline|fix_regression|adjust_threshold|add_mask',
  reasoning: '<1-2 zdania>'
}"
```

> **Patrz też:** AI Caveats sekcja w `VRT_Scope_v7.md` (`temperature: 0`, koszty, prywatność HTML/PII).
> **Kiedy używać:** ręczny triage PR. Automatyczny workflow w CI jest w materiale bonusowym na branchu `bonus-ci-cd`.
