## Task — Skill Trigger Review (S03 L03)
Review the `description` field of an Agent Skill. Paste the `SKILL.md` frontmatter into the chat.
Because of progressive disclosure, `description` is the **only** thing that decides *whether and
when* the skill loads — a fuzzy trigger fires everywhere or nowhere.

Judge the trigger for `vrt-factory` (whose one job is generating deterministic factory / mock data):
- Is it specific enough to auto-load **only** for factory / mock-data / test-fixture requests?
- Would it wrongly fire on unrelated VRT tasks — masking, threshold tuning, Page Objects, ARIA?
- Does it name the concrete trigger phrases and state what the skill does **not** cover?

Return **only** this JSON:

```json
{
  "specific_enough": false,
  "would_misfire_on": ["<e.g. masking, thresholds, Page Objects>"],
  "trigger_phrases": ["factory", "mock data", "seed data", "test fixture"],
  "improved_description": "<one precise description: verb + object, trigger phrases, explicit NOT-scope>"
}
```

- `specific_enough: true` only when the trigger cannot reasonably fire on masking / thresholds / POM.

> **Boundary:** a too-broad `description` (fires "at everything") and a "skill-moloch" that bundles
> data + assertions + Page Objects both break the L02 rule — one skill, one responsibility, a
> trigger as concrete as a test name. You approve the final `description`.
