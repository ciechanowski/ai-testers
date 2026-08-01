## Task — Dark Mode Audit (S02 L01)
You have 2 screenshots of the same page: **light mode** and **dark mode**.
{{context}}

> **How to read this:** audit **dark mode** against WCAG AA, comparing it with the light variant. You
> **ESTIMATE contrast visually** — this is a **pre-check**, NOT a proof of compliance (for that use axe-core /
> Lighthouse / dedicated tools). Describe real differences between the screenshots.

Return **only** this JSON:

```json
{
  "wcag_aa_pass": true,
  "violations": [
    {
      "element": "<element description>",
      "ratio_required": "4.5:1 | 3:1",
      "ratio_estimated": "<estimate>",
      "severity": "critical | major | minor",
      "fix": "<e.g. lighter text shade>"
    }
  ]
}
```

Check: text contrast (≥ 4.5:1 normal, ≥ 3:1 large/UI), visibility of icons/logo on a dark background,
link distinguishability (not by color alone — underline/weight), visible focus rings on a dark background.

⚠️ Contrast values are **ESTIMATED** by a vision model — do NOT use the output as proof of WCAG compliance.
