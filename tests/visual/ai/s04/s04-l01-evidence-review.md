## Task — Evidence Review of a Trend Report (S04 L01)
You are auditing a **trend report produced from VRT Tracker metadata**. Paste the report together
with the raw JSON dump it was built from. The report is only worth acting on if every number in it
can be recomputed from that dump, and the failure mode here is quiet: a plausible sentence about
something the data never said.

Check three things, in this order.

**Arithmetic.** Recompute every `baseline_rate`, `current_rate` and `rate` from the dump. Flag any
figure you cannot reproduce, and any trend claimed from fewer than five builds.

**Scope.** The input is metadata: status, `diffPercent`, `pixelMisMatchCount`, branch, timestamp.
Any sentence describing what a screenshot *looks like* is a pixel claim and the model had no pixels.
"The header shifted down" is a pixel claim. "Fails on mobile-light only" is not.

**Attribution.** `chronically_flaky` requires failures across several branches. A test failing only
on one feature branch is that branch changing something, not flake.

Return **only** this JSON:

```json
{
  "unsupported_claims": [
    { "claim": "<quote from the report>", "why": "<which number does not reconcile, or what is missing>" }
  ],
  "pixel_claims": ["<quote of any sentence describing image content>"],
  "misattributed_flake": ["<test listed as flaky that only fails on one branch>"],
  "verdict": "usable"
}
```

- `verdict` is `usable`, `usable_with_edits` or `rejected`.
- `rejected` whenever a single `health_score` or rate cannot be recomputed from the dump. A number
  nobody can reproduce is worse than no number, because it gets quoted in a stand-up.

> **Boundary:** this review checks whether the report is *supported*, not whether the underlying
> tests are healthy. A perfectly sourced report can still point at the wrong fix, and no amount of
> metadata will tell you if a diff is a regression or an intended redesign. Deciding to delete a test
> stays with a human, and so does opening the images.
