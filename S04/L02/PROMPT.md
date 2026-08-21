# S04L02: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Lekcja ma trzy prompty: jeden pisze pamięć agenta, drugi ją recenzuje przed commitem,
trzeci generuje dłuższy dokument referencyjny.

### AGENTS.md Generator

Użyj, gdy chcesz, żeby model napisał zwięzłą pamięć agenta z twardymi regułami VRT,
jeden plik czytany przez wiele narzędzi (Cursor / Claude Code / Codex).

```
Task: AGENTS.md Generator (S04 L02)
Turn the VRT conventions this repo already enforces into agent memory: a short AGENTS.md that
Cursor, Claude Code and Codex all read before they write a line of test code. The point is that you
stop re-explaining the same six rules in every conversation.
[paste here anything about your repo the rules below do not already cover]

Target: Playwright Test 1.50+, TypeScript, three projects (desktop-light, mobile-light,
desktop-dark). The long-form conventions already live in PLAYWRIGHT_GUIDELINES.md; AGENTS.md
points at that file rather than restating it.

Non-negotiable rules
These are the hard rules the agent must follow when generating tests. Reproduce them faithfully, do
not soften them into suggestions:
- page.clock.setFixedTime(...) before page.goto(), never after
- mask: [locator] with maskColor: '#FF00FF', never display: none
- locator priority data-testid > role / label > text > CSS
- tolerance via maxDiffPixels, never by raising threshold
- baseline in a separate commit, message test: baseline update - <reason>
- no networkidle, no waitForTimeout, wait on an explicit assertion instead

Non-negotiable rules for the document itself
- One source of truth. Anything already written in PLAYWRIGHT_GUIDELINES.md gets a link, not a
  copy. Two copies of a rule become two different rules within a month.
- Around 60 lines. This is memory loaded into every session, not documentation. Length here is a
  running cost.
- No secrets, no API keys, no internal URLs. Use <REDACTED> in any example that would carry one.

Sections: Build & Test (the actual commands), VRT Conventions, Do / Don't, Where to look. Close with
a one-line CLAUDE.md example that imports AGENTS.md rather than duplicating it.

Return the file as a single Markdown code block.
```

### Agent Memory Review (przed commitem)

Użyj zanim wrzucisz `AGENTS.md` do repo. Ten plik ładuje się do każdej sesji, więc jego wady
mnożą się przez liczbę rozmów: każda zbędna linia kosztuje przy każdym zapytaniu, a każda reguła
powtórzona za `PLAYWRIGHT_GUIDELINES.md` to przyszła sprzeczność. Wpis w `secrets_found`
wymusza `rewrite` niezależnie od reszty.

```
Task: Agent Memory Review (S04 L02)
You are reviewing an AGENTS.md / CLAUDE.md before it gets committed. Paste the file, plus
PLAYWRIGHT_GUIDELINES.md if you have it. Unlike ordinary documentation, this file is loaded into
every single session, so its faults compound: every wasted line is paid again on every request, and
every duplicated rule is a future contradiction.

Audit four things.

Length. Count the lines. Past roughly 60, ask what earns its place. Memory is not a manual.

Duplication. Any rule stated here and in PLAYWRIGHT_GUIDELINES.md should be a link instead.
Two copies drift apart, and then the agent follows the stale one.

Secrets. API keys, tokens, internal hostnames, real customer data. Any of these in a committed
memory file is a leak that also gets fed to a model on every call.

Actionability. "Write clean tests" tells an agent nothing. "clock.setFixedTime before goto"
changes generated code. Flag every rule that could not be mechanically checked.

Return only this JSON:

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

- verdict is commit, commit_after_edits or rewrite.
- Any entry in secrets_found forces rewrite, regardless of everything else.
```

**Generator dokumentu referencyjnego** (materiał dodatkowy, poza slajdami)
Użyj, gdy potrzebujesz dłuższego dokumentu referencyjnego (~200 linii) z konwencjami zespołu, deliverable, który pamięć agenta tylko podlinkowuje.

```
Generate PLAYWRIGHT_GUIDELINES.md for a project:
- QA team: 5 people (3 manual, 2 automation)
- Framework: Playwright Test 1.50+, TypeScript
- App: React SPA, 20 pages, Tailwind design system, dark mode
- Scale: ~150 VRT tests planned, 3 projects (desktop-light, mobile-light, desktop-dark)
- Constraints: monorepo, CI = GitHub Actions, limited free tier

Sections:
1. Naming conventions (test files, snapshots, baselines)
2. Baseline management (where files live, PR workflow, who updates)
3. Threshold guidelines (per component)
4. Masking policy (mask vs threshold)
5. PR workflow (baseline-only commits, AI triage rules)
6. Common pitfalls + links to Playwright docs

Output: a complete markdown file, ~200 lines.
```

**Granica:** pamięć agenta i dokument referencyjny wygenerowane przez model ZAWSZE przejrzyj, zanim wrzucisz je do repo. Trzy rzeczy do sprawdzenia. Po pierwsze, jedno źródło prawdy, `CLAUDE.md` ma importować `AGENTS.md`, a nie duplikować reguł, inaczej pliki się rozjadą i agent dostanie sprzeczne konwencje. Po drugie, zwięzłość, jeśli pamięć puchnie powyżej ~60 linii, agent zaczyna gubić twarde reguły w szumie; długie rzeczy wypchnij do `PLAYWRIGHT_GUIDELINES.md`. Po trzecie, sekrety, model potrafi wstawić w przykładach realistyczne klucze albo API keys, które jako kontekst mogą wrócić echem w odpowiedzi; przed commitem scrubuj przykłady i użyj placeholderów `<REDACTED>`. Prompt do `PLAYWRIGHT_GUIDELINES.md` musi zawierać konkret o projekcie (rozmiar zespołu, wersja frameworka, typ aplikacji, skala), bez tego dostaniesz generyczny dokument, który nikomu nie pomoże.
