# S02L02: prompty AI

## Workflow: agent generuje szkielet

Prompt (po angielsku – krócej, taniej w tokenach):

```
Open /about on http://localhost:5173, take an accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots getByRole('main') and adds a
toMatchAriaSnapshot. Use role-based locators from the snapshot, not CSS.
```

Co robi agent (narzędzia MCP):

1. `browser_navigate` → `/about`
2. `browser_snapshot` → drzewo ról (`main › heading "About" › section "Statistics" › …`)
3. `browser_generate_locator` → `getByRole('main')` (lokator z realnego drzewa, nie z CSS)
4. pisze szkielet: `toHaveScreenshot()` + `toMatchAriaSnapshot()`
