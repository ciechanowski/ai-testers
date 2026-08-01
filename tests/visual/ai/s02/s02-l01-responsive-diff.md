## Task — Responsive Diff Analyzer (S02 L01)
You have screenshots of the same page from Playwright projects: **mobile-light (iPhone 13, below `lg`)** and
**desktop-light / desktop-dark (1920 px, at or above `lg`)**. Breakpoint `lg = 1024 px`.
{{context}}

> **How to read this:** compare **mobile → desktop** (light and dark). For EACH difference decide whether it is
> intended **responsive** behavior (sidebar collapsing to chips, hamburger instead of a link list, column reflow)
> or a **BUG** (horizontal scroll on mobile, overlapping elements, clipped CTA, touch target < 44×44 px — that is
> the Apple HIG / WCAG AAA threshold, not AA). Describe real differences between the screenshots — do not guess.

Return **only** this JSON:

```json
{
  "responsive_correct": true,
  "issues": [
    {
      "viewport": "mobile | desktop-light | desktop-dark",
      "severity": "critical | major | minor",
      "observation": "<what is visible>",
      "classification": "responsive | bug",
      "fix": "<specific CSS fix when it is a bug>"
    }
  ]
}
```

- **responsive** — collapse/hamburger/reflow is expected behavior; do NOT report it as a bug.
- **bug** — horizontal scroll on mobile, overlapping elements, clipped content, touch target too small.
