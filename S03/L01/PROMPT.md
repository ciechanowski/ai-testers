# S03L01: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Prompty chodzą parą i w tej kolejności: pierwszy generuje factory, drugi jej nie ufa.

### Generowanie mock data

Użyj, gdy potrzebujesz szybko wygenerować typowany, deterministyczny fixture do mockowania API w teście VRT.
Prompt narzuca konwencję z repo: `interface` na kształt, stała tablica bazowa i `slice(count)`,
dzięki czemu to samo wywołanie zwraca co do bajta te same dane.

```
Task: Factory Generator (S03 L01)
Generate a deterministic TypeScript factory to feed a mocked API in a VRT test. The factory
freezes the data so toHaveScreenshot() compares pixels, not yesterday's records.
[here you describe the data: how many items, which categories, what price range]

Deliver an interface plus a factory function that returns an array of those objects, following the
repo's factory convention: an interface for the shape, a fixed base array of ready objects, and
slice(count) to return the first N. (tests/fixtures/artwork.factory.ts is an existing example of
that convention, for a new entity, keep the same shape, don't copy its data.)

Non-negotiable rules
- Every value hardcoded. No Math.random(), no crypto.randomUUID(), no Date.now(), no
  bare new Date(). IDs in a readable sequence (art-001, artist-01), dates as fixed ISO 8601
  strings, prices as integers (cents).
- TypeScript, zero any. The interface describes the shape; the factory returns T[].
- A fixed base array + slice(count) so the same call returns byte-identical data every run.

Return the interface + factory as a single TypeScript code block. After it, in one line, say how
to prove determinism: call the factory 3× and compare with toEqual.
```

### Weryfikacja determinizmu

Użyj, gdy chcesz, żeby model zrobił code review gotowej factory pod kątem ukrytej randomizacji
i zaproponował test. To ten prompt, a nie poprzedni, decyduje o tym, czy fixture wejdzie do repo.

```
Task: Determinism Review (S03 L01)
You are reviewing a TypeScript factory function used to mock an API in a VRT test. Paste the
factory (or drag the file) into the chat. A single non-deterministic value silently breaks the
baseline on the next run, so audit it line by line.

Hunt for hidden randomization or time dependence: Math.random(), crypto.randomUUID(),
Date.now(), bare new Date() (no fixed argument), faker with a live seed, incrementing
counters kept in module scope. Confirm all IDs, dates and prices are hardcoded.

Return only this JSON:

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

- deterministic: true only when violations is empty, the same call returns byte-identical data.
- Prefer a fixed replacement over a mask: mock data should be frozen at the source, not hidden.
```

**Granica:** wygenerowaną factory ZAWSZE przepuść przez code review pod kątem ukrytej randomizacji: szukaj `Math.random()`, `Date.now()`, `new Date()` i `crypto.randomUUID()`. Model bywa pewny siebie i błędny zarazem: potrafi zapewnić, że dane są na sztywno, a mimo to zostawić jedno wywołanie generujące wartość zmienną w czasie, które rozjedzie baseline przy następnym uruchomieniu. Finalnie poprawność zatwierdza człowiek, najlepiej wsparty testem `3× wywołanie === toEqual`.
