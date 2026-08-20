## Task — Approval Discipline Review (S04 L03)
You are auditing something written about **baseline approval**: either a build summary headed for a
pull request, or a policy section headed for `AGENTS.md`. Paste it, together with the tracker JSON or
the process it describes.

One failure mode matters more than the rest. A model asked to summarise a visual diff drifts toward
a conclusion, and the conclusion it reaches for is "this looks fine, approve it". That is precisely
the decision a team does not delegate, and it arrives dressed as helpfulness rather than as a claim.

Check four things.

**Approval creep.** Any sentence nudging toward approving: "looks safe", "no visual impact", "can be
merged", "nothing to worry about". Quote each one. A summary may describe and classify; it may not
conclude.

**Evidence.** Every listed test run needs its `diffPercent`. Anything classed `expected` needs a
matching claim in the pull request description. Missing evidence should have produced `suspicious`.

**Branch semantics.** Approving on a branch and approving with `merge` are different acts with
different blast radius. Flag any text that blurs them, and any that treats `autoApproved` as if a
person had looked at it.

**Stale baselines.** A diff caused by a fresher baseline on the base branch is not a regression.
Flag it if it was filed as one, or if the bucket is missing entirely.

Return **only** this JSON:

```json
{
  "approval_recommended": [
    { "quote": "<the sentence that recommends approving>", "rewrite": "<neutral description instead>" }
  ],
  "missing_evidence": [
    { "test": "<name>", "missing": "diffPercent" }
  ],
  "branch_semantics_errors": ["<quote conflating branch approval with merge approval>"],
  "stale_baseline_misfiled": ["<test filed as a regression that the precedence rule explains>"],
  "verdict": "usable"
}
```

- `verdict` is `usable`, `usable_with_edits` or `rejected`.
- Any entry in `approval_recommended` forces at least `usable_with_edits`, no matter how well
  evidenced the rest is.

> **Boundary:** this checks discipline and sourcing, not whether the screens are actually correct.
> A summary can pass every check here and still miss a real regression, because none of this opens
> the images. Someone still has to look.
