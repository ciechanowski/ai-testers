# S05L03: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.

Warunek wstępny dla obu promptów: podpięty MCP server ReportPortala ze zmiennymi `RP_HOST`, `RP_API_TOKEN` i `RP_PROJECT`, a w projekcie historia przebiegów, na przykład z `npm run rp:seed:demo`.

### Prompt 1: analiza przebiegu przez MCP

Zamiast klikać po dashboardzie, pytasz agenta.

```
Using the ReportPortal MCP server, analyze our latest Playwright VRT launch.

STEPS:
1. Get the last launch by name "AiTesters VRT"
2. List all test items with status FAILED
3. For each failure, fetch the logs and any image attachments

ANALYZE:
- Which failures are visual regressions (pixel diff) vs functional errors?
- Which ones does Auto-Analysis already classify, and with which defect
  type? Do you agree with each classification?
- Group the failures by likely root cause, not by test name.

CONSTRAINT: do not apply or change any labels yourself; only propose them.

Return JSON:
{
  visual_regressions: [{ test, suspected_cause, agrees_with_autoanalysis }],
  disputed_classifications: [{ test, rp_defect_type, your_defect_type, why }],
  suggested_manual_labels: [{ item_id, defect_type, comment }]
}
```

**Dlaczego akurat tak:** najcenniejsza jest sekcja `disputed_classifications`, czyli przypadki, w których agent nie zgadza się z wbudowanym Auto-Analysis. To najlepszy materiał na ręczną etykietę, bo poprawiasz dokładnie tam, gdzie model się myli, więc każda poprawka niesie najwięcej informacji treningowej. Grupowanie „po przyczynie, nie po nazwie testu" jest celowe: przy testach wizualnych czterdzieści czerwonych testów to zwykle kilka realnych problemów. Ograniczenie `CONSTRAINT` też nie jest ozdobnikiem, bo agent ma przez MCP realną możliwość zmiany typu defektu, a nadanie etykiety bez udziału człowieka trafia wprost do danych treningowych modelu.

### Prompt 2: konwencja atrybutów i dashboard pod jedno pytanie

Prompt pomocniczy, przydatny przy przenoszeniu wzorca do własnego projektu. Zakłada, że agent widzi konfigurację Playwrighta i istniejące przebiegi.

```
Review how our Playwright visual suite reports to ReportPortal and propose a
reporting convention we can commit to.

INPUT: our playwright.config.ts projects and the attributes currently sent.

STEPS:
1. List every attribute key/value pair we currently send, at launch and at item
   level, and flag inconsistencies between projects.
2. Propose a minimal, stable attribute set (max 5 keys) that lets us answer:
   does dark mode break more often than light mode?
3. For that question, describe one dashboard: which filter it needs, which
   widgets sit on it, and what each widget answers.

Rules:
- Attribute values must be hard-coded, not derived from the Playwright config;
  a viewport change must never silently split the history of a widget.
- A widget always sits on a filter; say which filter each widget uses.

Return: a table of attributes (key, values, why) plus the dashboard spec.
```

**Dlaczego akurat tak:** ograniczenie do pięciu kluczy jest tu ważniejsze niż wygląda, bo agent zostawiony bez limitu zaproponuje kilkanaście atrybutów i konwencja umrze w pierwszym tygodniu. Reguła o wartościach wpisanych na sztywno jest w prompcie wprost, bo model domyślnie proponuje wyliczanie ich z konfiguracji projektu, co jest eleganckie i psuje spójność historii przy pierwszej zmianie rozdzielczości. Punkt trzeci wymusza z kolei to, o co chodzi w całej lekcji: dashboard ma odpowiadać na jedno pytanie i każdy widget musi mieć wskazany filtr, na którym stoi.

### Czego świadomie nie promptujemy

Nie prosimy agenta o zatwierdzanie ani zmianę etykiet, mimo że MCP daje mu takie narzędzie. Powód jest ten sam co przy przeglądzie builda w trackerze z S04: etykieta jest decyzją, która wraca do zespołu i do modelu, więc zostaje po stronie człowieka. Agent przygotowuje materiał, człowiek rozstrzyga.
