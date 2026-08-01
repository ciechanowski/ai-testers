# S02L04 — MCP: szkielet specu dla `/payouts`

Krok 1 zadania domowego. Playwright MCP czyta **żywe drzewo dostępności**, więc lokatory
pochodzą z prawdziwej strony, a nie z pamięci modelu. MCP da Ci szkielet — determinizm
dokładasz sam.

```
Using Playwright MCP: navigate to http://localhost:5173/payouts, take a
browser_snapshot of the region with data-testid "payouts-panel", and use
browser_generate_locator for the tab navigation and for the two action controls
at the bottom of the recipient card.

Then write a Playwright VRT spec skeleton that screenshots
getByTestId('payouts-panel') and adds toMatchAriaSnapshot() for the tab
navigation. Use role-based locators from the snapshot, not CSS.

Do NOT add masking, clock stabilization or thresholds - I will review the page
myself and add them. Tell me instead which elements you suspect are
non-deterministic, and why.

One more thing: compare the two action controls at the bottom. Report what role
each one exposes in the snapshot, and whether that matches how it looks.
```

> **Granica:** MCP jest akceleratorem dev-time, interaktywnym — nie wchodzi do CI.
> `page.clock`, `mask` i nazwy snapshotów z `-${lang}` dokładasz Ty. To reguła Dnia 2.
