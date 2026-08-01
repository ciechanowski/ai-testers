# S03L01: prompty AI

## AI Prompty

### Prompt 1 – Mock data factory
```
Generate deterministic mock data for the GET /api/artworks endpoint.
Requirements:
- 6 artworks, hardcoded UUIDs (uuid v4 format, but fixed)
- 3 categories: Digital, Photography, Animation
- Prices: 150, 280, 420, 1200, 3500, 8900
- Dates: ISO 8601 (2026-01-15)
- featured: 3 of 6 true
- TypeScript: interface Artwork + factory function
Every factory() call returns identical data.
```

### Prompt 2 – Determinism verification
```
I have a TypeScript factory function `createArtworks()`.
Check whether it is truly deterministic:
- Does it use Math.random() / Date.now() / crypto.randomUUID()?
- Are all IDs, dates and prices hardcoded?
- Is the order of array elements stable?
If you find a source of non-determinism, show how to fix it.
```

> **Zapowiedź (S04/L02):** te twarde reguły – żadnego `Math.random()`, `Date.now()`, `new Date()` ani `crypto.randomUUID()` w factory – to idealny kandydat do `AGENTS.md` / `CLAUDE.md`. Zapisane raz w pamięci agenta, model stosuje je automatycznie przy każdym generowaniu factory, bez powtarzania w prompcie. Pełne omówienie w S04/L02.
