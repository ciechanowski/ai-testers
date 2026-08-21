# S01L04: prompty AI

## AI Prompty

W zadaniu domowym musisz udokumentować **co najmniej jeden** z dwóch promptów
poniżej w pliku `solution-<imie>.md`. Oba odpalasz tam, gdzie masz subskrypcję: w Cursorze z wybranym
modelem Claude albo w Claude Code lub na claude.ai z planem Claude Pro.
Wystarczy jedna z tych dróg i żadna nie wymaga klucza API.

### Prompt 1: Analiza HTML (wskazanie elementów do maskowania)

Otwierasz stronę, kopiujesz fragment HTML i prosisz model, żeby wskazał
dynamiczne elementy oraz gotowe selektory do `mask: [locator]`. Kontekst
podajesz jako fakt o stronie, nie jako gotowy wniosek.

```
Przeanalizuj HTML sekcji studio-dashboard (strona /studio). Część widgetów
losuje wartości (Math.random), część zależy tylko od czasu, a zegar w teście
jest zamrożony przez page.clock. Podziel elementy na must / should / nice do
mask: [locator] (preferuj getByTestId). Nie maskuj elementów czasowych.
```

Przykładowa odpowiedź modelu:

```json
{
  "must_mask": [
    { "selector": "page.getByTestId('studio-revenue')", "why": "Math.random, losowy przychód" },
    { "selector": "page.getByTestId('studio-viewers')", "why": "Math.random, losowa liczba" },
    { "selector": "page.getByTestId('studio-session')", "why": "losowy hex na mount" },
    { "selector": "page.getByTestId('studio-feed')", "why": "losowa treść i kolejność" }
  ],
  "do_not_mask": [
    { "selector": "page.getByTestId('studio-payout')", "why": "odliczanie, zamraża je page.clock" },
    { "selector": "page.getByTestId('studio-clock')", "why": "zegar, zamraża go page.clock" }
  ]
}
```

### Prompt 2: Review stabilności baseline

Po wygenerowaniu baseline odpalasz test 3× i prosisz model, żeby wskazał, co
może flakować i co dorzucić do maski. To wariant „AI jako code reviewer”, a nie
generator kodu.

```
Uruchom ten test 3 razy na /studio. Czy screenshoty są identyczne?
Jeśli nie, który widget flakuje? Który to Math.random, a który tylko czas?
Sugeruj co dodać do mask: [] (a czego nie maskować, bo łapie to page.clock).
```

Przykładowa odpowiedź modelu:

```json
{
  "stable": false,
  "flaky_elements": [
    { "selector": "page.getByTestId('studio-conversion')", "why": "Math.random, nie było w masce" }
  ],
  "recommendation": "dodaj studio-conversion do mask: []; studio-payout zostaw bez maski (page.clock)"
}
```

**Zasada kontekstu:** kontekst podajesz jako *fakt o stronie* („ten element czyta
`Date.now()`”), nie jako gotowy werdykt („to trzeba zamaskować”). Model ma
wywnioskować ocenę i selektor, a nie przepisać twoją decyzję.

**Granica:** werdykt AI jest sugestią, którą potwierdzasz sam: uruchom test 3×
i sprawdź realnie, czy diff to zero. `--update-snapshots` odpalaj dopiero po
własnym potwierdzeniu, a do modelu nigdy nie wysyłaj screenshotów z danymi
osobowymi (PII) bez maskowania.
