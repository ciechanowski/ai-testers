# S03L02: prompty AI

## AI Prompty

### Prompt 1 – Refactor flat test to Page Object (SOLID)
```
Refactor this flat Playwright VRT test into a Page Object following SOLID:
- locators and actions in the Page Object (SRP), no assertions inside the PO
- test data comes from the factory (tests/fixtures/artwork.factory.ts)
- network/setup from the existing fixtures (tests/fixtures/mock-handlers.ts)
- keep assertions (incl. toHaveScreenshot) in the spec
Return: the Page Object class + the slimmed-down spec that uses it.
```

### Prompt 2 – Review Page Object for SOLID
```
Review this Page Object for SOLID violations (SRP / OCP / DIP):
- any assertions (expect) that leaked into the PO?
- duplicated locators that should live in one place?
- raw CSS selectors that should be data-testid or role?
- does the spec depend on the PO abstraction, not on raw locators?
Suggest concrete fixes.
```
