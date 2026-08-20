# S05B06: prompty AI

## AI Prompty

### Prompt 1: manifest paczki z opisu zawartości
```
Generate a .claude-plugin/plugin.json manifest for a Claude Code plugin that
packages our Visual Regression Testing toolkit.

CONTENTS TO BUNDLE:
- skills/vrt-spec/SKILL.md      - authors one deterministic *.visual.spec.ts
- skills/vrt-pom/SKILL.md       - authors one Page Object class
- skills/vrt-factory/SKILL.md   - generates deterministic factory data
- skills/vrt-i18n/SKILL.md      - adds the en/pl/de language axis to a spec

CONSTRAINTS:
- Plugin name must be kebab-case and namespace the skills as /<plugin>:<skill>
- Explicit semantic version, not a git SHA, because the team pins versions
- Include author, description, license MIT, and keywords for discovery
- Do NOT invent fields; use only fields from the official plugin manifest schema

OUTPUT: the plugin.json file plus a one-line comment per field explaining why it is there.
```

### Prompt 2: przegląd struktury paczki
```
Review this Claude Code plugin structure and tell me what breaks:

vrt-tools/
  .claude-plugin/
    plugin.json
    skills/vrt-spec/SKILL.md
    hooks.json
  CLAUDE.md
  mcp.json

Check specifically:
- Which files are in the wrong place, and where do they belong?
- Which file will simply be ignored by Claude Code, and why?
- What is the correct filename and location for the MCP server config?
Answer as a corrected file tree plus one line of justification per change.
```
