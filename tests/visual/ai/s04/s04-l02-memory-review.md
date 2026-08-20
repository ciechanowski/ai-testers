## Task — Agent Memory Review (S04 L02)
You are reviewing an **`AGENTS.md` / `CLAUDE.md`** before it gets committed. Paste the file, plus
`PLAYWRIGHT_GUIDELINES.md` if you have it. Unlike ordinary documentation, this file is loaded into
every single session, so its faults compound: every wasted line is paid again on every request, and
every duplicated rule is a future contradiction.

Audit four things.

**Length.** Count the lines. Past roughly 60, ask what earns its place. Memory is not a manual.

**Duplication.** Any rule stated here *and* in `PLAYWRIGHT_GUIDELINES.md` should be a link instead.
Two copies drift apart, and then the agent follows the stale one.

**Secrets.** API keys, tokens, internal hostnames, real customer data. Any of these in a committed
memory file is a leak that also gets fed to a model on every call.

**Actionability.** "Write clean tests" tells an agent nothing. "`clock.setFixedTime` before `goto`"
changes generated code. Flag every rule that could not be mechanically checked.

Return **only** this JSON:

```json
{
  "line_count": 84,
  "duplicated_rules": [
    { "rule": "<quote>", "already_in": "PLAYWRIGHT_GUIDELINES.md §3.3", "replace_with": "<link line>" }
  ],
  "secrets_found": [
    { "line": "<quote with the value masked>", "kind": "api_key" }
  ],
  "vague_rules": [
    { "rule": "<quote>", "why": "<what an agent cannot do with it>", "rewrite": "<checkable version>" }
  ],
  "cut_candidates": ["<quote of a line that costs more than it returns>"],
  "verdict": "commit"
}
```

- `verdict` is `commit`, `commit_after_edits` or `rewrite`.
- Any entry in `secrets_found` forces `rewrite`, regardless of everything else.

> **Boundary:** the model can measure length, spot duplication and match secret-shaped strings. It
> cannot tell you which rule your team keeps breaking, and that is exactly what belongs in memory.
> The judgement call about what to keep stays with whoever reviews the pull requests.
