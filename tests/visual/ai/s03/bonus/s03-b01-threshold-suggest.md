## Task — Threshold Recommender (S03 B01, bonus)
Propose a comparison tolerance **per component** for `toHaveScreenshot({...})` and justify each
choice in one sentence that would survive a PR review. One global `threshold: 0.2` means something
different on a full-bleed hero than on a 24×24 icon — so tune per component, with intent.
{{context}}

For each component pick from three levers (they measure different things):
- `threshold` (0–1, default 0.2) — per-pixel colour distance in YIQ; for design-heavy elements
  where a real colour shift matters (gradient hero → `0.1`).
- `maxDiffPixels` — absolute pixel count; deterministic and easy to defend (small/static UI:
  nav, form, footer → `20`–`50`).
- `maxDiffPixelRatio` (0–1) — same idea as a percentage; scales with size (image grid/gallery →
  `threshold: 0.15` + `maxDiffPixelRatio: 0.02`).

Rules: **prefer `maxDiffPixels`** when you can ("30 pixels" is more defensible than "is 0.1% a lot?").
Reserve `threshold: 0.0` for brand/logo and **only with Docker** (cross-OS anti-aliasing fails it
otherwise → use `maxDiffPixels: 10` as a proxy). If an element changes **structurally** (timestamp,
random id, counter) no threshold fixes it — recommend a `mask` instead.

Return **only** this JSON:

```json
[
  {
    "component": "<name>",
    "threshold": null,
    "maxDiffPixels": 30,
    "maxDiffPixelRatio": null,
    "mask": null,
    "justification": "<one sentence a reviewer would accept>"
  }
]
```

> **Boundary:** the model does not know your app's real design or your CI's real noise — its
> numbers are a **starting point**, not final values. Measure the actual noise after the first
> week of runs and tune to that. Accepting "AI Threshold Recommender" output unverified gives you
> pretty numbers detached from reality.
