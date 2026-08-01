## Task — ARIA Migration Assistant (S02 L03)
Semantic refactor: an inaccessible `<div role="...">` → a native HTML element (`<nav>`, `<button>`, `<a>`).
You have **before.aria.yml** (tree BEFORE) and **after.aria.yml** (tree AFTER migration — generated from the app).
{{context}}

> **How to read this:** compare the accessibility trees **before → after**. A pixel diff will NOT catch this —
> the appearance is often identical; only the **semantics** change. Judge structure (roles, names, hierarchy), not looks.

Return **only** this JSON:

```json
{
  "changes": [
    {
      "type": "role_changed | label_changed | structure_changed | item_added | item_removed",
      "description": "<what changed>",
      "impact_on_screen_reader": "<impact on the screen reader>"
    }
  ],
  "a11y_improvements": ["<e.g. keyboard Enter/Space for free>"],
  "needs_screenshot": false,
  "verdict": "approve | investigate | reject"
}
```

Native-element gains to point out: keyboard (Enter/Space with no manual handling), focus management,
screen-reader announcement. `needs_screenshot`: whether the appearance changes (usually **no** — ARIA is a
separate regression axis from pixels).
