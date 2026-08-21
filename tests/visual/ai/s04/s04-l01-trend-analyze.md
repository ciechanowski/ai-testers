## Task — Trend Analyzer for VRT Tracker (S04 L01)
Read a **build history dumped from the tracker's REST API** and separate tool regression from app
regression. A single red build tells you something broke; thirty days of builds tell you *what kind*
of thing keeps breaking, which is the part a human cannot eyeball.
{{context}}

The dump comes from `GET /builds?projectId=<id>&take=50` and `GET /test-runs?buildId=<id>`, both with
a Bearer token from `POST /users/login`. Every test run carries `status`, `diffPercent`,
`pixelMisMatchCount`, `branchName` and a timestamp.

### Non-negotiable rules
- **Metadata only.** You are reading failure rates and timestamps, not images. Never describe what a
  screenshot looks like, never claim a diff is "a layout shift" or "a colour change".
- **Every rate must be computable** from the input. If a test appears in fewer than five builds, say
  so instead of reporting a trend from two data points.
- **`suggested_action` is a proposal, never a decision.** `remove` in particular is a human call.

Return **only** this JSON:

```json
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
```

- `chronically_flaky` means failing regardless of which branch ran it. A test that only fails on one
  feature branch is a change, not flake.
- `suggested_action` is one of `add_mask`, `tune_threshold`, `remove`.
- `health_score` is 0 to 100 and must follow from the two lists, not from a general impression.

> **Boundary:** the model sees statistics, not pixels and not your product. It cannot tell you whether
> a given diff is a bug or an intended redesign, and it will happily invent a cause for a trend that
> is really one noisy afternoon of CI. For classifying a single failure you need the images, which is
> what the Day 1 triage prompt does ([`../s01/s01-l01-triage.md`](../s01/s01-l01-triage.md)).
> Run this report through the **Evidence Review**
> ([`s04-l01-evidence-review.md`](s04-l01-evidence-review.md)) before you act on it.
