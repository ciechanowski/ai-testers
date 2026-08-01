## Task — Agent Skill Draft (S03 L03)
Turn the prompts you keep re-pasting (the S03 `prompty.md` files) plus the repo's factory
conventions into a reusable **Claude Code Skill** — a `SKILL.md` that the agent auto-loads when the
task matches, instead of copy-pasting a prompt from chat history.

Build `.claude/skills/vrt-factory/SKILL.md`:
- **YAML frontmatter**: `name`, a **trigger-focused `description`**, `allowed-tools: Read Write Edit`.
  The `description` is the whole game — progressive disclosure means only `name` + `description`
  sit in context until the trigger matches, so write it like a good test name: a concrete verb +
  object ("generate factory / mock data for a visual test") and say what it does **not** cover.
- **Body (Markdown)**: the non-negotiable rules from L01 (hardcoded IDs, no `Math.random()` /
  `Date.now()`, ISO 8601 dates, a sliced fixed array, match `tests/fixtures/artwork.factory.ts`),
  the steps (read the existing factory first to catch the style → generate data + interface →
  say how to verify determinism), and one concrete input/output example.
- **One responsibility only**: data. Not assertions, not Page Objects, not thresholds (that is SRP
  from L02 applied to skills — a narrow trigger is why the skill fires *in time*, not at everything).

Return the full `SKILL.md`.

> **Boundary:** the model distills structure well from prompts you already write, but the trigger
> and final shape are yours to approve. Then review the trigger with
> [`s03-l03-trigger-review.md`](s03-l03-trigger-review.md) — a vague `description` is a skill that
> quietly fires in the wrong place.
