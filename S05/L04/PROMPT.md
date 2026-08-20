# S05L04: prompty AI

## AI Prompty

**Co łączy te czerwone: agent czyta przebieg przez MCP**

Uruchamiasz po dwóch biegach, gdy w panelu jest już przebieg z regresją, i po tym, jak sam postawisz tezę na podstawie widgetów. Kolejność ma znaczenie: chodzi o porównanie dwóch niezależnych odpowiedzi, a nie o podpowiedź. Odpowiedź agenta zapisujesz w `solution-<imie>.md` razem z jednym zdaniem o tym, gdzie się z nim nie zgadzasz.

```
Using the ReportPortal MCP server, analyze the latest launch named
"AiTesters VRT homework".

STEPS:
1. Get that launch and list every test item with its status AND its
   attributes (viewport, colorScheme, device, page).
2. Ignore the test names for now. Work on the attributes only.

ANALYZE:
- Which attribute value do ALL failed items share, and do any passing items
  share it too? Name the single attribute that separates red from green.
- If no attribute separates them, say so explicitly. That is a valid answer
  and it means the regression is not environment-scoped.
- From that split alone, what is the most likely root cause: a theme token,
  a breakpoint-scoped layout rule, or a global restyle?
- Propose a defect type per failed item (Product Bug, Automation Bug,
  System Issue, No Defect) with one sentence of justification.

CONSTRAINTS:
- Do not apply or change any defect type yourself. Propose only.
- If the data does not support a conclusion, answer "insufficient data"
  instead of guessing.

Return JSON:
{
  "separating_attribute": { "key": "...", "value": "...", "confidence": "..." },
  "root_cause_hypothesis": "...",
  "proposed_labels": [{ "item": "...", "defect_type": "...", "why": "..." }]
}
```

Dwa fragmenty są w tym prompcie najważniejsze. Zdanie o ignorowaniu nazw testów zabiera modelowi najłatwiejszą drogę na skróty, czyli streszczenie listy awarii zamiast szukania przyczyny. Zgoda na odpowiedź „żaden atrybut ich nie rozdziela" jest jeszcze ważniejsza: bez niej model dopasuje jakąkolwiek regułę, bo dokładnie o to został poproszony, a przy jednym z trzech wariantów zadania poprawną odpowiedzią jest właśnie brak wzoru.

Zakaz zmieniania etykiet też jest tam celowo. Model chętnie kończy propozycją „mogę to za Ciebie oznaczyć", a to jest dokładnie ta decyzja, która ma zostać po stronie człowieka, bo staje się materiałem treningowym dla klasyfikatora.

**Weryfikacja odpowiedzi agenta, jeśli brzmi zbyt pewnie**

Pomocniczo, gdy agent podaje przyczynę bez pokazania danych, na których ją oparł.

```
Show the raw evidence for your conclusion: for each of the nine test items,
list its status and the value of the attribute you claim is decisive.
If any item contradicts your hypothesis, say so before defending it.
```
