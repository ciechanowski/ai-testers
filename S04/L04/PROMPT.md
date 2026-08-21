# S04L04: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Zadanie ma dwa własne prompty i wraca do dwóch z lekcji trzeciej.

### 1. Wyprowadź `AGENTS.md` z samych testów

Prompt kroku pierwszego. Sens zadania siedzi w zakazie czytania: model ma nie zaglądać do
`CLAUDE.md`, `PLAYWRIGHT_GUIDELINES.md` ani do żadnego README, tylko wyprowadzić konwencje
z kodu, który je faktycznie stosuje. Każda reguła przychodzi z dowodem (`plik:linia`) i z formą
zakazaną zapisaną jako kod, bo reguła bez kontrformy przegrywa z prośbą użytkownika.

```
Task: Derive AGENTS.md from the specs (S04 L04, homework)

You are setting up agent memory for a Playwright visual regression repo you have never worked in.
Nobody will tell you the conventions. Read the tests and infer them.

Read only this

tests/visual/s01/*.visual.spec.ts
tests/visual/s02/*.visual.spec.ts
tests/visual/s03/*.visual.spec.ts
tests/pages/*.ts
tests/fixtures/*.ts
playwright.config.ts

Do not open CLAUDE.md, PLAYWRIGHT_GUIDELINES.md, AGENTS.md, anything under
tests/visual/ai/, or any README. If those files are already in your context, ignore them.
I want the conventions you can prove from code, not the ones someone already wrote down.

Produce AGENTS.md, max 60 lines

Every rule carries three things, on at most three lines:

1. The imperative. What the agent must do, phrased as an order, not a preference.
2. The evidence. file:line of one occurrence you inferred it from, plus how many files repeat it.
3. The counter-form. The exact wrong code the rule forbids, as // NEVER: <one line of code>.

A rule without a counter-form does not go in. „Prefer masking" loses to a user asking to hide an
element; // NEVER: element.style.display = 'none' does not.

Mark a rule LOW CONFIDENCE when you inferred it from a single occurrence.

Close with two sections

Cannot be derived from code, conventions you suspect this team holds but could not prove
from the files above. For each, name the evidence that would settle it (git history, CI config,
a review comment, a conversation). A prohibition that the code obeys everywhere is invisible: you
cannot see the absence of something nobody wrote.

Where I was guessing, every place you filled a gap with what Playwright projects usually do
rather than what this one does.

Return the file as a single Markdown code block.
```

### 2. Napraw regułę, która przegrała

Prompt biegu kontrolnego. Używasz go dopiero wtedy, gdy pamięć agenta przegra z bezpośrednim
poleceniem: agent zrobił to, o co prosił użytkownik, i złamał konwencję. Poprawiona reguła ma
odpowiadać na prośbę, a nie ją ignorować, bo użytkownik prosił o coś realnego.

```
Task: Repair the rule that lost (S04 L04, homework)

A rule in agent memory lost to a direct user request. The agent did what the user asked and broke
the convention. Rewrite the rule so the same request cannot win again.

RULE AS WRITTEN:
[paste it]

USER REQUEST THAT BEAT IT:
[paste the prompt, verbatim]

WHAT THE AGENT PRODUCED:
[paste the generated line of code or command]

The rewrite must

- stay within two lines, because this file loads on every request
- open with an imperative, never with „prefer", „we usually" or „try to"
- carry the forbidden form as literal code, not as a description of it
- answer the request instead of ignoring it. The rule lost because the user asked for something
  real. Say what the agent does when a user explicitly asks for the forbidden form: the substitute,
  and the one sentence it says back.

Then state, in one line, why the original lost: missing counter-form, hedged verb, or a rule that
never anticipated a user asking for the opposite.

Return only the rewritten rule and that one line.
```

### 3. Dwa prompty wracające z lekcji trzeciej

Praca domowa nie powtarza ich treści, tylko każe sprawdzić, czy działają na Twoim projekcie.
Pierwszym promptem z S04L03 (podsumowanie builda) klasyfikujesz różnice z własnego przebiegu,
jeśli tracker z S04L01 nadal stoi. Drugim (polityka zatwierdzania) generujesz sekcję
„Baseline approval" do `AGENTS.md` i przepuszczasz przez nią cztery sytuacje z zadania.
Sytuacja bez werdyktu znaczy, że polityka jest ozdobna.

**Granica:** żaden z tych promptów nie wykonuje zadania za Ciebie. Model pisze propozycję pamięci i propozycję zasad. Wartość pracy domowej jest w tym, co z tych propozycji odrzucisz i dlaczego, a nie w tym, ile z nich wkleisz. Do promptów nie wrzucaj kluczy ani danych dostępowych; w przykładach używaj `<REDACTED>`.
