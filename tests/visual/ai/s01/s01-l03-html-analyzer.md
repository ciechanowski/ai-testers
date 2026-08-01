## Zadanie — HTML Analyzer (L03)
Przeanalizuj załączony HTML (plik **live-board.html** — sekcja „Live Floor" Pixelarium,
strona `/live`). To dashboard z **kilkoma** dynamicznymi elementami naraz. Wskaż te, które
trzeba **zamaskować** w teście VRT, bo zaszumią baseline — i te, których maskować **nie wolno**.

Zwróć **wyłącznie** ten JSON:

```json
{
  "must_mask":    [{ "selector": "", "reason": "" }],
  "should_mask":  [{ "selector": "", "reason": "" }],
  "nice_to_mask": [{ "selector": "", "reason": "" }]
}
```

- **must_mask** — treść, której nie ustabilizujesz inaczej: **losowe liczby** (Math.random),
  **dane live z API/analytics**, **session-id / request-id**, timestampy spoza kontroli `page.clock`.
- **should_mask** — dane z API, które w teście bywają stałe (ceny, liczby produktów) — maskuj wąsko.
- **nice_to_mask** — tylko realne ryzyko, którego config nie łapie.

**Załóż konfigurację z lekcji:** `animations: 'disabled'`, `caret: 'hide'`, dostępny `page.clock`
ustawiony **przed** `goto`. Maska to **ostateczność** — najpierw stabilizujesz configiem, dopiero
potem maskujesz resztę. Dlatego **NIE proponuj masek** na to, co te techniki już stabilizują:

- **animacje CSS** (np. `animate-ping` w odznace `live-pulse`) — wyłącza je `animations: 'disabled'`,
- **efekty hover/transition, kursor** — nie pojawią się bez interakcji,
- **elementy liczone z czasu** (`Date.now()` → `countdown-timer`, `last-updated`) — zamraża je `page.clock`.

Uwaga-pułapka: `page.clock` zamraża **czas**, ale **NIE** zatrzymuje `Math.random()` — licznik losowy,
ticker ofert czy session-id i tak są `must_mask`. Rozróżnij „dynamiczne, bo losowe" (maska) od
„dynamiczne, bo z zegara" (clock, nie maska).

Format selektorów wg priorytetu: **data-testid > role > klasa CSS**.
