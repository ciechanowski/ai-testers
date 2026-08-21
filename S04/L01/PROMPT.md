# S04L01: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Pierwszy prompt czyta historię buildów, drugi nie ufa temu, co pierwszy napisał.

### Trend Analyzer for VRT Tracker

Użyj, gdy masz w trackerze historię buildów i chcesz, żeby model odróżnił regresję narzędzia
od regresji aplikacji oraz wskazał testy chronicznie flaky. Wejściem jest JSON zrzucony z dashboardu.

```
Task: Trend Analyzer for VRT Tracker (S04 L01)
Read a build history dumped from the tracker's REST API and separate tool regression from app
regression. A single red build tells you something broke; thirty days of builds tell you what kind
of thing keeps breaking, which is the part a human cannot eyeball.
[paste the dashboard dump here]

The dump comes from GET /builds?projectId=<id>&take=50 and GET /test-runs?buildId=<id>, both with
a Bearer token from POST /users/login. Every test run carries status, diffPercent,
pixelMisMatchCount, branchName and a timestamp.

Non-negotiable rules
- Metadata only. You are reading failure rates and timestamps, not images. Never describe what a
  screenshot looks like, never claim a diff is "a layout shift" or "a colour change".
- Every rate must be computable from the input. If a test appears in fewer than five builds, say
  so instead of reporting a trend from two data points.
- suggested_action is a proposal, never a decision. remove in particular is a human call.

Return only this JSON:

{
  "trending_up": [
    {
      "test": "<test run name>",
      "baseline_rate": 0.02,
      "current_rate": 0.31,
      "builds_observed": 24,
      "likely_cause": "<what the metadata supports, e.g. 'started after 2026-01-09, all branches'>"
    }
  ],
  "chronically_flaky": [
    {
      "test": "<name>",
      "rate": 0.14,
      "builds_observed": 30,
      "suggested_action": "add_mask"
    }
  ],
  "patterns": ["<e.g. 'mobile-light fails 3x more often than desktop-light'>"],
  "health_score": 72
}

- chronically_flaky means failing regardless of which branch ran it. A test that only fails on one
  feature branch is a change, not flake.
- suggested_action is one of add_mask, tune_threshold, remove.
- health_score is 0 to 100 and must follow from the two lists, not from a general impression.
```

**Granica:** Trend Analyzer patrzy tylko na metadane (failure rate, timestamp, branch), a nie na piksele, więc nie powie Ci, czy konkretny diff to bug czy zmiana oczekiwana. Od klasyfikacji pojedynczego failu jest AI Triage z bonusu na branchu `bonus-ci-cd`, który dostaje baseline, zrzut i mapę różnic. Traktuj wyjście jako listę hipotez do przejrzenia, nie jako decyzję: `suggested_action: 'remove'` zawsze zatwierdza człowiek, bo model widzi statystykę, a nie kontekst produktu. Do promptu wrzucaj sam zrzut metadanych, bez danych wrażliwych z aplikacji.

### Evidence Review of the trend report

Użyj zaraz po Trend Analyzerze, zanim ktokolwiek zacznie kasować testy na podstawie raportu.
Trend Analyzer dostaje same metadane, a mimo to potrafi napisać zdanie o tym, jak wygląda zrzut.
Ten prompt sprawdza, czy każda liczba w raporcie da się odtworzyć z wejścia.

```
Task: Evidence Review of a Trend Report (S04 L01)
You are auditing a trend report produced from VRT Tracker metadata. Paste the report together
with the raw JSON dump it was built from. The report is only worth acting on if every number in it
can be recomputed from that dump, and the failure mode here is quiet: a plausible sentence about
something the data never said.

Check three things, in this order.

Arithmetic. Recompute every baseline_rate, current_rate and rate from the dump. Flag any
figure you cannot reproduce, and any trend claimed from fewer than five builds.

Scope. The input is metadata: status, diffPercent, pixelMisMatchCount, branch, timestamp.
Any sentence describing what a screenshot looks like is a pixel claim and the model had no pixels.
"The header shifted down" is a pixel claim. "Fails on mobile-light only" is not.

Attribution. chronically_flaky requires failures across several branches. A test failing only
on one feature branch is that branch changing something, not flake.

Return only this JSON:

{
  "unsupported_claims": [
    { "claim": "<quote from the report>", "why": "<which number does not reconcile, or what is missing>" }
  ],
  "pixel_claims": ["<quote of any sentence describing image content>"],
  "misattributed_flake": ["<test listed as flaky that only fails on one branch>"],
  "verdict": "usable"
}

- verdict is usable, usable_with_edits or rejected.
- rejected whenever a single health_score or rate cannot be recomputed from the dump. A number
  nobody can reproduce is worse than no number, because it gets quoted in a stand-up.
```

**Granica:** ten przegląd sprawdza, czy raport jest *udokumentowany*, a nie czy testy są zdrowe. Raport bez zarzutu pod względem źródeł nadal może wskazywać zły kierunek, bo żadna ilość metadanych nie powie, czy różnica to regres, czy zaplanowana zmiana designu. Decyzja o skasowaniu testu zostaje przy człowieku, tak samo jak obejrzenie obrazków.
