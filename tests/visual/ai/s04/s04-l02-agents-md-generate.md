## Task — AGENTS.md Generator (S04 L02)
Turn the VRT conventions this repo already enforces into **agent memory**: a short `AGENTS.md` that
Cursor, Claude Code and Codex all read before they write a line of test code. The point is that you
stop re-explaining the same six rules in every conversation.
{{context}}

Target: Playwright Test 1.50+, TypeScript, three projects (`desktop-light`, `mobile-light`,
`desktop-dark`). The long-form conventions already live in `PLAYWRIGHT_GUIDELINES.md`; `AGENTS.md`
points at that file rather than restating it.

### Non-negotiable rules
These are the hard rules the agent must follow when generating tests. Reproduce them faithfully, do
not soften them into suggestions:
- `page.clock.setFixedTime(...)` **before** `page.goto()`, never after
- `mask: [locator]` with `maskColor: '#FF00FF'`, never `display: none`
- locator priority `data-testid` > `role` / `label` > `text` > CSS
- tolerance via `maxDiffPixels`, never by raising `threshold`
- baseline in a **separate** commit, message `test: baseline update - <reason>`
- no `networkidle`, no `waitForTimeout`, wait on an explicit assertion instead

### Non-negotiable rules for the document itself
- **One source of truth.** Anything already written in `PLAYWRIGHT_GUIDELINES.md` gets a link, not a
  copy. Two copies of a rule become two different rules within a month.
- **Around 60 lines.** This is memory loaded into every session, not documentation. Length here is a
  running cost.
- **No secrets, no API keys, no internal URLs.** Use `<REDACTED>` in any example that would carry one.

Sections: Build & Test (the actual commands), VRT Conventions, Do / Don't, Where to look. Close with
a one-line `CLAUDE.md` example that imports `AGENTS.md` rather than duplicating it.

Return the file as a single Markdown code block.

> **Boundary:** the model writes a confident, generic document. It does not know which of these rules
> your team actually breaks, and that is the only thing that makes memory worth loading. Expect to
> cut half of what comes back. Run it through the **Agent Memory Review**
> ([`s04-l02-memory-review.md`](s04-l02-memory-review.md)) before committing.
