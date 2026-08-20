# S04L04: prompty AI

## AI Prompty

Praca domowa Dnia 4 korzysta z dwóch promptów trzymanych w plikach, bo wczytuje je
`tests/visual/ai/prompts.ts` (`agentsMdDerivePrompt`, `ruleRepairPrompt`).

### Prompt 1: pamięć wyprowadzona z kodu, nie podyktowana

Pełna treść: [`tests/visual/ai/s04/s04-l04-agents-md-derive.md`](../../tests/visual/ai/s04/s04-l04-agents-md-derive.md).

Agent czyta wyłącznie specki, Page Objecty, factory i config, a `CLAUDE.md`
oraz `PLAYWRIGHT_GUIDELINES.md` ma zignorować. Z tego wyprowadza `AGENTS.md`,
w którym każda reguła niesie rozkaz, dowód w postaci `plik:linia` i formę zakazaną
jako `// NEVER: <linia kodu>`. Najciekawsze są dwie ostatnie sekcje: czego z kodu
wyprowadzić się nie da i gdzie model zgadywał.

### Prompt 2: naprawa reguły, która przegrała

Pełna treść: [`tests/visual/ai/s04/s04-l04-rule-repair.md`](../../tests/visual/ai/s04/s04-l04-rule-repair.md).

Wejściem jest reguła, prompt użytkownika, który ją pokonał, i kod, jaki agent wtedy
wyprodukował. Przepisana reguła ma zmieścić się w dwóch liniach i odpowiedzieć na
prośbę zamiast ją ignorować, bo reguła bez odpowiedzi na „ukryj to" przegra z „ukryj to"
niezależnie od liczby wielkich liter.

### Prompty z lekcji, używane w krokach 2 i 3

Politykę zatwierdzania baseline'ów i klasyfikację różnic z builda bierzesz z lekcji
S04L03, plik [`S04/L03/PROMPT.md`](../L03/PROMPT.md).
