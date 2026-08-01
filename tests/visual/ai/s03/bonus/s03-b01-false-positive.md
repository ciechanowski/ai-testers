## Task — False Positive Analysis (S03 B01, bonus)
You have VRT tests that go **red too often**. For each, decide the real cause and the right cure —
because the wrong reflex (bump the threshold) is exactly how a suite dies: threshold creep from
0.1 → 0.15 → 0.2 → 0.5 until it catches nothing but a blank screen.
{{context}}

For each test, diagnose the root cause **before** touching any number:
- **app_bug** — a real regression the test correctly caught; do not silence it.
- **threshold_too_low** — genuine cosmetic noise (anti-aliasing, JPEG compression) below the set
  tolerance; a small, justified, PR-reviewed bump is fair.
- **missing_mask** — an element that changes **structurally** (timestamp, random id, live counter);
  no threshold covers this — mask it and keep the rest strict.

Also weigh whether S01 stabilization (clock / animations / fonts) and the L01 API mock are actually
in place — most flakiness comes from those three, not from "tolerance too low".

Return **only** this JSON:

```json
[
  {
    "test": "<name>",
    "verdict": "app_bug | threshold_too_low | missing_mask",
    "recommendation": "raise_threshold | add_mask | fix_application",
    "reasoning": "<one sentence>"
  }
]
```

- Every tolerance change must come with a "why" comment in code and a conscious PR review — never a
  silent number bump.

> **Boundary:** the model does not know your app's design or your CI's real noise floor. Treat the
> verdict as a triage hint; confirm structural changes belong to `mask` and cosmetic noise to
> `maxDiffPixels`, and measure the real noise before locking values.
