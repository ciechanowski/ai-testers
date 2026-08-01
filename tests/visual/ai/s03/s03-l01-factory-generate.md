## Task — Factory Generator (S03 L01)
Generate a **deterministic TypeScript factory** to feed a mocked API in a VRT test. The factory
freezes the data so `toHaveScreenshot()` compares pixels, not yesterday's records.
{{context}}

Deliver an `interface` plus a factory function that returns an array of those objects, following the
repo's factory convention: an `interface` for the shape, a fixed base array of ready objects, and
`slice(count)` to return the first N. (`tests/fixtures/artwork.factory.ts` is an existing example of
that convention — for a *new* entity, keep the same shape, don't copy its data.)

### Non-negotiable rules
- **Every value hardcoded.** No `Math.random()`, no `crypto.randomUUID()`, no `Date.now()`, no
  bare `new Date()`. IDs in a readable sequence (`art-001`, `artist-01`), dates as fixed ISO 8601
  strings, prices as integers (cents).
- **TypeScript, zero `any`.** The `interface` describes the shape; the factory returns `T[]`.
- **A fixed base array + `slice(count)`** so the same call returns byte-identical data every run.

Return the `interface` + factory as a single TypeScript code block. After it, in one line, say how
to prove determinism: call the factory 3× and compare with `toEqual`.

> **Boundary:** the model is fast at drafting data but confidently wrong about hidden randomization.
> Always run the generated factory through the **Determinism Review** ([`s03-l01-determinism-review.md`](s03-l01-determinism-review.md))
> before trusting it — a human approves the final fixture.
