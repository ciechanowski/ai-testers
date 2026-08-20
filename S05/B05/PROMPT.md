# S05B05: prompty AI

## AI Prompty

### Prompt 1, Prioritize axe violations
```
Here is an axe-core JSON report for the /pricing page:
[paste axe results]

Prioritize the violations for fixing:
- order by real user impact (not just axe severity)
- for each: translate "violation id" -> "what a real user experiences"
- flag which ones block a keyboard-only or screen-reader user entirely

Return JSON:
{ violations: [{ id, user_impact, blocking: bool, fix_hint, priority: 'high'|'med'|'low' }] }
```
