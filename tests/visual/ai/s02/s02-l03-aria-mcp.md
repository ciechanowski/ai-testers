Use Playwright MCP. For the /gallery page:
1. browser_navigate, then browser_snapshot
   (read the live accessibility tree).
2. Write gallery.visual.spec.ts with toMatchAriaSnapshot
   on the main content — use roles & names from the snapshot.
3. Run: npx playwright test gallery --update-snapshots
4. Show me gallery.aria.yml; drop unstable nodes.
