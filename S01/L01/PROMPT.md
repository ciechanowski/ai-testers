# S01L01: prompty AI

## Przykład z AI (jeden, nie trzy)

### AI Snapshot Triage – efekt „wow”

Demo na żywo: wklejasz trzy obrazki (baseline, actual, diff). AI odróżnia regresję od szumu w jednym promcie.

```
Prompt: "Masz 3 obrazki: baseline, actual, diff. Bug czy szum
(anti-aliasing/font rendering)?
Odpowiedz JSON: {
  severity: 'critical|major|minor|noise',
  action: 'block|review|accept'
}.
Kontekst: to nagłówek strony (header, role=banner), design system Tailwind."
```

> **Patrz też:** AI Caveats sekcja w `VRT_Scope_v7.md` (determinizm `temperature: 0`, koszty Claude Sonnet ~$0.003/image, prywatność PII w screenshotach). Pełna lista 7 promptów w bonusie B3.
>
> **Co przeniesione dalej:** AI Diff Analyzer dla pipeline'u CI (część A) trafił do materiału bonusowego o triage w CI na branchu `bonus-ci-cd`. Generowanie testów z opisu (część B) rozeszło się po S03 (factory, Page Object) i S04 (kontekst agenta). W L01 nie miałyby kontekstu – brakuje lekcji o Dockerze i CI.
