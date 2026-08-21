# S05L02: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.

W tej lekcji AI wchodzi dwoma wejściami i tylko jedno z nich promptujesz. Pierwsze to **wbudowane Auto-Analysis**: model jest częścią produktu, więc nie piszesz do niego promptu, nie wybierasz modelu i nie ustawiasz `temperature`, a Twój wpływ na jakość jest pośredni i sprowadza się do dyscypliny w etykietowaniu. Drugie to **agent, który przygotowuje materiał dla tego modelu**, czyli sprawdza ustawienia analizatora, liczy oznaczone elementy i proponuje brakujące etykiety.

### Prompt: uczenie maszynowe dla własnego zestawu

Prompt z zadania lekcji. Zakłada podpięty MCP server ReportPortala (konfiguracja jest w lekcji trzeciej) albo dostęp do API instancji.

```
Set up ReportPortal Auto-Analysis for our Playwright visual suite, so it starts
classifying failures on its own. Project "aitesters_vrt", self-hosted, ml profile on.

STEPS:
1. Report the current analyzer settings: auto-analyzer, minimum should match,
   unique error analysis, pattern analysis.
2. Count labelled items per defect type, compare with the Auto-Analysis retraining
   threshold: 300 labelled items plus 100 new ones.
3. For every item still in To Investigate, propose a defect type with a one-line
   justification. A pixel diff after an intentional design change is an Automation
   Bug (stale baseline), never a Product Bug.
4. Propose one Pattern Analysis rule (string or regex) for the most frequent failure.

Return JSON: { settings, labelled: { pb, ab, si, nd, ti }, items_missing_to_retrain,
proposed_labels: [{ item_id, defect_type, why }], pattern_rule: { name, type, value } }
```

**Dlaczego akurat tak:** cztery kroki idą od stanu faktycznego do propozycji, a nie odwrotnie. Krok pierwszy jest po to, żeby nie diagnozować w ciemno: zespoły często czekają na Auto-Analysis, mając Pattern Analysis wyłączone albo odwrotnie. Krok drugi zamienia mgliste „chyba jeszcze za mało danych" w konkretną liczbę brakujących elementów, bo próg przetrenowania to 300 oznaczonych plus 100 nowych. Krok trzeci to jedyne miejsce, w którym agent podejmuje decyzję merytoryczną, dlatego reguła o zmianie wyglądu jest wpisana w prompt wprost: różnica po świadomej zmianie wyglądu to `Automation Bug`, czyli nieaktualny baseline, a nie `Product Bug`. Krok czwarty zdejmuje z modelu to, co da się złapać zwykłą regułą, bo powtarzalna awaria infrastruktury nie musi czekać na uczenie.

**Czego pilnować przy odpowiedzi:** punkt trzeci to miejsce, w którym agent myli się najczęściej, a każda zła etykieta uczy model na miesiące. Propozycje dla różnic wizualnych sprawdź sam, zanim je zatwierdzisz. Wynik w JSON-ie jest celowy: `proposed_labels` ma być listą do przejrzenia, a nie zestawem zmian nanoszonych automatycznie.

**Definicja ukończenia zadania:** czerwony test ze świeżego przebiegu dostaje typ defektu bez Twojego kliknięcia, a w historii zmian elementu widnieje `AA`.

### Czego świadomie nie promptujemy

Auto-Analysis nie ma promptu i nie da się go „poprawić słowami". Jeśli klasyfikuje źle, odpowiedź nie brzmi „napisz lepszy prompt", tylko „popraw etykiety i poczekaj na przetrenowanie". To istotna różnica wobec własnego triage z Dnia 1, gdzie prompt, model, `temperature` i koszt są w całości pod Twoją kontrolą, i dobry moment, żeby nazwać ten podział wprost: czasem AI jest zdolnością wbudowaną w narzędzie, a czasem instrukcją, którą piszesz sam.
