# S04L01: prompty AI

## AI Prompty

### Prompt 1: Trend Analyzer for VRT Tracker
```
VRT builds + test runs from the last 30 days
(JSON from GET /builds and GET /test-runs):
[paste JSON]

Analyze:
- which tests have a trending-up failure rate (tool regression, not app regression)?
- which tests are chronically flaky (>10% failure regardless of PR)?
- any correlations (mobile failing more than desktop, dark mode more than light)?

Return JSON:
{
  trending_up: [{ test, baseline_rate, current_rate, likely_cause }],
  chronically_flaky: [{ test, rate, suggested_action: 'add_mask'|'tune_threshold'|'remove' }],
  patterns: [string],
  health_score: 0-100
}
```

### Prompt 2: Evidence Review of the trend report

Kiedy użyć: zaraz po Prompcie 1, zanim ktokolwiek zacznie kasować testy na podstawie raportu.
Trend Analyzer dostaje same metadane, a mimo to potrafi napisać zdanie o tym, jak wygląda zrzut.
Ten prompt sprawdza, czy każda liczba w raporcie da się odtworzyć z wejścia.

```
Audit a trend report built from Visual Regression Tracker metadata.
Paste the report and the raw JSON dump it came from.

CHECK, in this order:
- arithmetic: recompute every rate from the dump; flag any figure you cannot reproduce,
  and any trend claimed from fewer than 5 builds
- scope: the input is metadata (status, diffPercent, branch, timestamp). Any sentence
  describing what a screenshot LOOKS LIKE is a pixel claim the model could not have made
- attribution: `chronically_flaky` requires failures across several branches. A test
  failing on one feature branch is that branch changing something, not flake

Return only:
{
  unsupported_claims: [{ claim, why }],
  pixel_claims: [string],
  misattributed_flake: [string],
  verdict: 'usable' | 'usable_with_edits' | 'rejected'
}

Reject whenever a single rate or health_score cannot be recomputed from the dump.
```

**Dlaczego akurat tak:** liczba, której nikt nie odtworzy, jest gorsza niż brak liczby, bo trafia
na stand-up i zaczyna żyć własnym życiem. Kubełek `pixel_claims` istnieje, bo model bardzo chętnie
dopisuje wizualne uzasadnienie do statystyki, której nie widział na oczy.
