# S02L03: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.

### ARIA snapshot z żywego drzewa (Playwright MCP)

Prompt z ćwiczenia lekcji. Agent sam wchodzi na `/gallery`, czyta żywe drzewo dostępności
przez `browser_snapshot` i pisze z niego spec z `toMatchAriaSnapshot`. Baseline nie jest
zgadywany, bo powstaje z drzewa, które agent naprawdę zobaczył. Twoja rola zaczyna się
przy kroku czwartym: to Ty wyrzucasz niestabilne węzły.

```
Use Playwright MCP. For the /gallery page:
1. browser_navigate, then browser_snapshot
   (read the live accessibility tree).
2. Write gallery.visual.spec.ts with toMatchAriaSnapshot
   on the main content, use roles & names from the snapshot.
3. Run: npx playwright test gallery --update-snapshots
4. Show me gallery.aria.yml; drop unstable nodes.
```

### ARIA Migration Assistant (before kontra after)

Drugi moment AI tej lekcji. Dajesz modelowi dwa drzewa, sprzed i po migracji z `div[role=...]`
na natywne elementy, i pytasz, co zmieniło się semantycznie. Pixel diff tego nie złapie,
bo wygląd bywa identyczny, a zmienia się tylko znaczenie.

```
Task: ARIA Migration Assistant (S02 L03)
Semantic refactor: an inaccessible <div role="..."> → a native HTML element (<nav>, <button>, <a>).
You have before.aria.yml (tree BEFORE) and after.aria.yml (tree AFTER migration, generated from the app).
[paste both trees here: before.aria.yml and after.aria.yml]

How to read this: compare the accessibility trees before → after. A pixel diff will NOT catch this -
the appearance is often identical; only the semantics change. Judge structure (roles, names, hierarchy), not looks.

Return only this JSON:

{
  "changes": [
    {
      "type": "role_changed | label_changed | structure_changed | item_added | item_removed",
      "description": "<what changed>",
      "impact_on_screen_reader": "<impact on the screen reader>"
    }
  ],
  "a11y_improvements": ["<e.g. keyboard Enter/Space for free>"],
  "needs_screenshot": false,
  "verdict": "approve | investigate | reject"
}

Native-element gains to point out: keyboard (Enter/Space with no manual handling), focus management,
screen-reader announcement. needs_screenshot: whether the appearance changes (usually no, ARIA is a
separate regression axis from pixels).
```

**Zasada kontekstu:** podajesz modelowi *fakty*, stary snapshot i kierunek
migracji, a nie własny wniosek o jakości. Werdykt approve/investigate/reject ma
wynikać z porównania drzew, nie z Twojej sugestii.

**Granica:** ARIA snapshot i AI łapią strukturę, ale **nie** kontrast, kolejność
focusa ani pułapki klawiaturowe. Migracji roli (`<button>` → `<div role>`) nie
wstrzykniesz CSS-em, to zmiana DOM, więc ćwiczysz na parze before/after, nie na
live-demo. Twardy audyt dostępności: axe-core plus manualny test czytnikiem.
