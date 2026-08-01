# S02L04 — Audyt layoutu i18n (bug / intended / i18n-expected)

Krok 3 zadania domowego i **jedyny mechanizm, który wykrywa błąd DE**. Pixel diff go nie
złapie: zepsuty layout wchodzi do baseline'u przy pierwszym `--update-snapshots` i test
jest zielony na zawsze. Znajdujesz go przeglądem, nie porównaniem.

Zrób zrzuty `/payouts` w tym samym viewporcie w trzech językach i wklej je do modelu.

```
I'm attaching screenshots of the same page (/payouts) at the same viewport in
three languages: English [image 1], Polish [image 2], German [image 3].

Context: the UI strings come from i18next resource files. German compound nouns
are typically 30-40% longer than their English equivalents. The layout is
Tailwind CSS.

Task:
1. For each language, list every element whose text overflows, is clipped, is
   truncated with an ellipsis, or overlaps a neighbour.
2. Classify each observation:
   - "bug" - content is unreachable or unreadable (a clipped button label, text
     escaping its container)
   - "intended" - the layout reflows or wraps and stays readable
   - "i18n-expected" - the value legitimately differs per locale (currency
     symbol, number or date format)
3. For each "bug", name the likely Tailwind cause (a fixed width, a missing
   min-w-0 on a flex child, whitespace-nowrap with overflow-hidden, absent
   break-words) and the fix.
4. Which of these would a pixel diff against an existing baseline catch, and
   which would it miss because the baseline already contains the bug?

Format: a markdown table with columns: element, language, observation,
classification, tailwind cause, fix. Then a short verdict paragraph answering
question 4.
```

> **Zasada kontekstu:** podajesz **fakt o stronie** („stringi pochodzą z i18next, niemiecki
> bywa dłuższy"), nie gotowy wniosek („przycisk jest zepsuty"). Model ma sam zobaczyć.
>
> **Granica:** długość tekstu to *pre-check*. Werdykt „bug czy świadomy kompromis"
> podejmujesz Ty, patrząc na raport — nie model.
