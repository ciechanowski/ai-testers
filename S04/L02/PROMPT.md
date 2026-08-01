# S04L02: prompty AI

## AI Prompty

### Prompt 1: AGENTS.md Generator
```
Generate AGENTS.md for a VRT test repo (agent-agnostic, read by Cursor / Claude Code / Codex).
Project: Playwright Test 1.50+, TypeScript, 3 projects (desktop-light, mobile-light, desktop-dark).
Include the HARD VRT rules the agent MUST follow when generating tests:
- page.clock.setFixedTime(...) before goto (never after)
- mask: [locator] + maskColor '#FF00FF' instead of display:none
- locator priority: data-testid > role > text > CSS
- threshold: prefer maxDiffPixels (see PLAYWRIGHT_GUIDELINES.md)
- baseline in a SEPARATE commit ('test: baseline update - <reason>')
- NO networkidle, NO waitForTimeout
Sections: Build & Test (commands), VRT Conventions, Do / Don't, Where to look (links to PLAYWRIGHT_GUIDELINES.md).
Keep it short (~60 lines) - this is agent memory, not a document.
At the end: a one-line CLAUDE.md example that imports AGENTS.md.
```

### Prompt 2: generator dokumentu referencyjnego
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
