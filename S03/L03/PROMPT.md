# S03L03: prompty AI

## AI Prompty

### Prompt 1 – AI drafts the skill
```
Turn the repeated prompts in our S03 prompty.md plus our factory conventions
(hardcoded IDs, ISO dates, no Math.random, a sliced fixed array) into a Claude Code Skill:
- create .claude/skills/vrt-factory/SKILL.md
- YAML frontmatter: name, a trigger-focused description, allowed-tools (Read Write Edit)
- step-by-step instructions with a concrete input/output example
- one responsibility only: data, not assertions and not Page Objects
Return the full SKILL.md.
```

### Prompt 2 – AI reviews the trigger
```
Review this skill's description field:
- is the trigger specific enough to auto-load ONLY for factory / mock-data requests?
- would it wrongly fire on unrelated VRT tasks (masking, thresholds, Page Objects)?
- rewrite it to be precise and list the trigger phrases it should match.
Return the improved description only.
```
