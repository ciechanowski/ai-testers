## Task — Determinism Review (S03 L01)
You are reviewing a **TypeScript factory function** used to mock an API in a VRT test. Paste the
factory (or drag the file) into the chat. A single non-deterministic value silently breaks the
baseline on the next run, so audit it line by line.

Hunt for hidden randomization or time dependence: `Math.random()`, `crypto.randomUUID()`,
`Date.now()`, bare `new Date()` (no fixed argument), `faker` with a live seed, incrementing
counters kept in module scope. Confirm all IDs, dates and prices are hardcoded.

Return **only** this JSON:

```json
{
  "deterministic": true,
  "violations": [
    {
      "location": "<field or line, e.g. createdAt>",
      "call": "<the offending call, e.g. new Date()>",
      "fix": "<hardcoded replacement, e.g. '2026-01-15T00:00:00.000Z'>"
    }
  ],
  "unit_test": "<one-line: call the factory 3× and expect(a).toEqual(b).toEqual(c)>"
}
```

- `deterministic: true` only when `violations` is empty — the same call returns byte-identical data.
- Prefer a **fixed replacement** over a mask: mock data should be frozen at the source, not hidden.

> **Boundary:** the model is confidently wrong here more than anywhere else — it can declare the
> factory "fully hardcoded" while leaving one `Date.now()` in place. Trust the `unit_test`
> (`3× call === toEqual`) over the prose.
