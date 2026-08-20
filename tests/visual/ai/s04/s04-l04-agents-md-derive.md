## Task — Derive AGENTS.md from the specs (S04 L04, homework)

You are setting up agent memory for a Playwright visual regression repo you have never worked in.
Nobody will tell you the conventions. Read the tests and infer them.

### Read only this
```
tests/visual/s01/*.visual.spec.ts
tests/visual/s02/*.visual.spec.ts
tests/visual/s03/*.visual.spec.ts
tests/pages/*.ts
tests/fixtures/*.ts
playwright.config.ts
```

Do **not** open `CLAUDE.md`, `PLAYWRIGHT_GUIDELINES.md`, `AGENTS.md`, anything under
`tests/visual/ai/`, or any `README`. If those files are already in your context, ignore them.
I want the conventions you can prove from code, not the ones someone already wrote down.

### Produce `AGENTS.md`, max 60 lines

Every rule carries three things, on at most three lines:

1. **The imperative.** What the agent must do, phrased as an order, not a preference.
2. **The evidence.** `file:line` of one occurrence you inferred it from, plus how many files repeat it.
3. **The counter-form.** The exact wrong code the rule forbids, as `// NEVER: <one line of code>`.

A rule without a counter-form does not go in. „Prefer masking" loses to a user asking to hide an
element; `// NEVER: element.style.display = 'none'` does not.

Mark a rule **LOW CONFIDENCE** when you inferred it from a single occurrence.

### Close with two sections

**`## Cannot be derived from code`** — conventions you suspect this team holds but could not prove
from the files above. For each, name the evidence that would settle it (git history, CI config,
a review comment, a conversation). A prohibition that the code obeys everywhere is invisible: you
cannot see the absence of something nobody wrote.

**`## Where I was guessing`** — every place you filled a gap with what Playwright projects usually do
rather than what this one does.

Return the file as a single Markdown code block.

> **Boundary:** this is not the lesson's generator, which handed you the six rules and asked you to
> format them. Here nobody hands you anything, so the interesting output is not the rule list, it is
> the last two sections. Whatever lands there is exactly what agent memory exists for: the code
> already shows the rest.
