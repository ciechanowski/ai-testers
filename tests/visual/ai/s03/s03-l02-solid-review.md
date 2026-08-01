## Task — SOLID Review of a Page Object (S03 L02)
Review a Playwright **Page Object** (and the spec that uses it) for SOLID violations. Paste both
into the chat. The rule the whole layering rests on: locators + actions in the PO, assertions in
the spec, data in the factory.

Check for:
- **SRP** — did any assertion (`expect`, `toHaveScreenshot`) leak into the PO? Is the class a
  "god object" covering several views instead of one?
- **DIP** — does the spec depend on the PO abstraction, or does it reach for raw locators anyway?
- **Duplication** — the same locator repeated across tests/classes instead of one named place.
- **Brittle selectors** — raw CSS (`page.locator('.grid > div')`) that should be `data-testid` or `role`.

Return **only** this JSON:

```json
{
  "assertions_leaked": false,
  "violations": [
    {
      "principle": "SRP | OCP | DIP",
      "issue": "<what is wrong and where>",
      "fix": "<concrete change>"
    }
  ],
  "duplicated_locators": false,
  "raw_css_selectors": false,
  "verdict": "approve | needs_changes"
}
```

- `verdict: approve` only when `violations` is empty and no assertion leaked into the PO.

> **Boundary:** the model's two favourite mistakes are the mirror of the refactor task — it
> either misses an assertion that crept into the PO, or invents an abstraction "for the future"
> that no one asked for. You approve the final shape.
