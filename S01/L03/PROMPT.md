# S01L03: prompty AI

## Przykład z AI

### AI HTML Analyzer – sugestie masek

```
Prompt: "Przeanalizuj HTML strony /live (Live Floor) – kilka dynamicznych elementów
naraz. Zwróć JSON:
{
  must_mask:    [{ selector, reason }],  // random (Math.random), session-id, dane live
  should_mask:  [{ selector, reason }],  // dane z API (ceny, liczby produktów)
  nice_to_mask: [{ selector, reason }]   // realne ryzyko, którego config nie łapie
}
NIE maskuj tego, co stabilizuje config (animacje) ani zegar (Date.now()).
Format selektorów: data-testid > role > CSS class (priority order)."
```

**Odpowiedź AI** (skrócona):
```json
{
  "must_mask": [
    { "selector": "[data-testid='bid-ticker']", "reason": "Math.random() co 1s – clock tego nie zamraża" },
    { "selector": "[data-testid='online-now']", "reason": "losowa liczba kolekcjonerów live co 2s" },
    { "selector": "[data-testid='server-latency']", "reason": "telemetria ms (Math.random) co 2s" },
    { "selector": "[data-testid='session-id']", "reason": "losowy hex – inny przy każdym reloadzie" },
    { "selector": "[data-testid='live-counter']", "reason": "Math.random() co 3s" }
  ],
  "should_mask": [
    { "selector": "[data-testid='floor-price']", "reason": "cena z API – w teście stała, maskuj wąsko tylko jeśli zacznie szumieć" }
  ],
  "nice_to_mask": []
}
```

> **Pułapki, których AI maskować NIE powinno** (a często chce): `countdown-timer` i `last-updated` liczą się z `Date.now()` → zamraża je `page.clock`, nie maska; `live-pulse` (`animate-ping`) to animacja CSS → wyłącza ją `animations: 'disabled'`. Dobry analyzer rozróżnia „dynamiczne, bo losowe" (maska) od „dynamiczne, bo z zegara / animacji" (config). Jeśli wrzuci maskę na countdown – to sygnał, że nie uwzględnił konfiguracji z lekcji.

> **Uwaga o selektorach:** `floor-price` ma `data-testid`, ale gdyby cena renderowała się jak na `/gallery` (`<span class="… font-bold …">` bez `data-testid`), AI fallbackuje do selektora CSS – w realnym projekcie lepiej dodać `data-testid` i zawęzić maskę.

Wklejasz wprost do `mask: []`.

> **Patrz też:** AI Caveats sekcja w `VRT_Scope_v7.md` (`temperature: 0`, koszty, prywatność HTML/PII w prompcie).
