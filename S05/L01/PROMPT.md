# S05L01: prompty AI

## AI Prompty

### Ta lekcja nie ma własnego promptu AI

To jedyna lekcja tego dnia bez momentu z AI i jest tak celowo. Kończy się na stojącej, pustej instancji, a wszystko, co dotyczy modelu, wymaga najpierw danych. Auto-Analysis rusza dopiero na historii etykiet, więc prompt puszczony na świeżej instalacji nie miałby czego czytać.

AI wchodzi w tym dniu dwoma wejściami i oba mają własne lekcje:

- **Wbudowane Auto-Analysis** (lekcja druga). Model jest częścią produktu, więc nie piszesz do niego promptu ani nie wybierasz modelu. Twój wpływ na jakość jest pośredni i sprowadza się do dyscypliny w etykietowaniu. Prompt do przygotowania i sprawdzenia tych etykiet jest w [PROMPT.md lekcji drugiej](../L02/PROMPT.md).
- **ReportPortal MCP server** (lekcja trzecia). Tutaj rozmawiasz z agentem normalnie, tyle że agent ma dostęp do żywych danych z Twojej instancji. Prompt do analizy przebiegu jest w [PROMPT.md lekcji trzeciej](../L03/PROMPT.md).

### Czego świadomie nie promptujemy

Auto-Analysis nie ma promptu i nie da się go „poprawić słowami". Jeśli klasyfikuje źle, odpowiedź nie brzmi „napisz lepszy prompt", tylko „popraw etykiety i poczekaj na przetrenowanie". To istotna różnica wobec własnego triage z Dnia 1, gdzie prompt, model, `temperature` i koszt są w całości pod Twoją kontrolą.

Ciała promptów w całym kursie są po angielsku (konwencja od Dnia 2), otoczka i omówienie po polsku.
