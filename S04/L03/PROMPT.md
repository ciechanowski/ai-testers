# S04L03: prompty AI

## AI Prompty

### Prompt 1: Test the VRT skill
```
1. User: "Write a VRT test for the /checkout page"
2. Claude detects the trigger from the VRT skill description ("VRT test", "toHaveScreenshot")
3. The skill body instructs: use data-testid, the factory pattern from S03/L01, threshold per PLAYWRIGHT_GUIDELINES.md
4. Claude generates a test that MATCHES the project conventions, not a generic template
5. User: "Review this test"
6. The skill's "code review" section -> Claude checks anti-patterns from S01/L03 and S03/L02
```

### Prompt 2: Skill vs MCP decision
```
For my VRT workflow I need: generate tests, triage diffs, review test PRs.
None of these keep state between calls.
Should I package this as a Claude Skill or an MCP server? Justify against:
- statefulness (do I need a DB / browser session?)
- distribution (repo vs separate host)
- activation (trigger words vs explicit tool call)
Return a recommendation with one reason per criterion.
```
