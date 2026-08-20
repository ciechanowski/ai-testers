# S05B02: prompty AI

## AI Prompty

### Prompt 1, Reporter Template Generator
```
Generate a Playwright custom reporter in TypeScript:

REQUIREMENTS:
- Implements the Reporter interface
- Hooks: onBegin, onTestEnd, onEnd
- onTestEnd: collect VRT attachments (filter by name containing 'screenshot' or 'diff')
- onEnd: generate an HTML report with side-by-side expected|actual|diff
- Output path: test-results/vrt-report.html
- Style: minimal inline CSS, responsive (1024+)
- Limit: ~50 lines of code, readability > cleverness

OUTPUT: a complete .ts file ready to add in playwright.config.ts.
```
