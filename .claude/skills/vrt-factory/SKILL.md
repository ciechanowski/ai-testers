---
name: vrt-factory
description: Generate deterministic TypeScript factory functions for VRT tests in this repo. Use when the user asks for mock data, a factory, seed data, or test fixtures for a visual/Playwright test. Trigger phrases include "factory", "mock data", "seed data", "test data", "fixture for the gallery/list". NOT for assertions, Page Objects, masking, or threshold tuning.
allowed-tools: Read Write Edit
---

# vrt-factory — deterministic test data for VRT

Model solution skill for **S03L03 (Agent Skills dla VRT)**. It encodes the factory
conventions taught in S03L01/L02 so you never re-type them into a prompt again.

One responsibility: **produce deterministic factory data**. It does not write
assertions, Page Objects, mocks/handlers, or tune thresholds — those live elsewhere.

## Rules (non-negotiable)

- **Deterministic only.** No `Math.random()`, no `Date.now()`, no `new Date()` without
  a fixed argument, no `faker` with a live seed. The same call must return byte-identical
  data every run — otherwise the VRT baseline is unstable.
- **Hardcoded IDs** in a readable sequence (`art-001`, `artist-01`, …).
- **Dates are fixed ISO 8601 strings** (`'2025-09-15T10:00:00Z'`).
- **Expose `createXList(count = N)`** that returns `fixedArray.slice(0, count)` — one
  fixed source array, sliced. Never generate items in a loop.
- **Match the house style** already in `tests/fixtures/artwork.factory.ts` (interface +
  factory function, same field names and shapes).

## Steps

1. **Read `tests/fixtures/artwork.factory.ts`** first to pick up the exact style
   (interface shape, naming, `slice(count)` pattern, `_`-separated number literals).
2. **Generate** the TypeScript `interface` + the `createXList()` factory with a fixed
   array of realistic-but-static entries.
3. **State how to verify determinism**: call the factory 3× and deep-compare the output;
   they must be identical. Suggest the S03L01 prompt: *"Is my factory data truly
   deterministic? Call it 3x and compare the output."*

## Example (target shape)

```ts
export interface ReviewData {
  id: string;
  author: string;
  rating: number;
  createdAt: string; // fixed ISO string
}

export function createReviewList(count = 3): ReviewData[] {
  const reviews: ReviewData[] = [
    { id: 'rev-001', author: 'Maya Chen',  rating: 5, createdAt: '2025-09-15T10:00:00Z' },
    { id: 'rev-002', author: 'Luca Rossi', rating: 4, createdAt: '2025-10-01T14:30:00Z' },
    { id: 'rev-003', author: 'Ava Park',   rating: 5, createdAt: '2025-08-20T09:00:00Z' },
  ];
  return reviews.slice(0, count);
}
```

## Comments in generated code

Keep the output lean. A **2–3 line file header** (what this file is + why, in one breath) —
then let the code speak. **No step-by-step narration inline** (drop `// hardcoded IDs`,
`// fixed ISO`, `// slice, never a loop` beats). Add a single short `//` only where a value
is genuinely non-obvious. These are teaching files, but on video the *spoken* narration
carries the "why" — the comments must not pre-empt the punchline.

## Guardrails

- If the request is about assertions, Page Objects, masking, or thresholds — say this
  skill does not cover it and point to the relevant S03 lesson instead.
- Never invent secrets, tokens, or real user data. Use static, obviously-fake values.
- The human reviews the generated factory; the skill accelerates, it does not decide.
