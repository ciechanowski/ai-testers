# S02L01: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Lekcja ma trzy prompty: jeden pisze test, dwa oceniają zrzuty, które ten test wyprodukował.
Slajd pokazuje je w skrócie.

### Generator testu na trzy projekty

Prompt z lekcji. Nie opisujesz w nim selektorów ani viewportów, tylko wskazujesz pliki,
z których model ma je odczytać. Dzięki temu test wychodzi zgodny z realną konfiguracją repo,
a nie z tym, co model pamięta z innych projektów.

```
Write a Playwright VRT test for the Pixelarium homepage.

Read first (don't guess):
- app/src/pages/HomePage.tsx  -> real selectors
- playwright.config.ts -> projects already exist:
  desktop-light, mobile-light, desktop-dark. USE them.
- App runs at http://localhost:5173, route '/'.

Requirements:
- Put everything under tests/visual/ai/ (the AI folder),
  in a task subfolder, e.g. tests/visual/ai/s02-l01-responsive/.
- One toHaveScreenshot() assertion, run by all 3 projects.
- No setViewportSize(): viewport + colorScheme come from projects.
- Stabilize: page.clock.setFixedTime() before goto,
  animations:'disabled', await an explicit element assertion (not networkidle).
- Find dynamic regions yourself (e.g. footer year in
  app/src/components/layout/Footer.tsx) and mask them.
```

### Responsive Diff Analyzer

Zrzuty `/gallery` z projektów Playwrighta (mobile-light, desktop-light, desktop-dark)
przeciągasz do Cursora lub Claude Pro i pytasz, czy różnice to zamierzony responsive design,
czy regresja. Kontrakt JSON jest tu ważniejszy niż sama odpowiedź: wymusza decyzję
`responsive` albo `bug` przy każdej różnicy, zamiast opowieści o wyglądzie.

```
Task: Responsive Diff Analyzer (S02 L01)
You have screenshots of the same page from Playwright projects: mobile-light (iPhone 13, below lg) and
desktop-light / desktop-dark (1920 px, at or above lg). Breakpoint lg = 1024 px.
[paste the screenshots here: mobile-light, desktop-light, desktop-dark]

How to read this: compare mobile → desktop (light and dark). For EACH difference decide whether it is
intended responsive behavior (sidebar collapsing to chips, hamburger instead of a link list, column reflow)
or a BUG (horizontal scroll on mobile, overlapping elements, clipped CTA, touch target < 44×44 px, that is
the Apple HIG / WCAG AAA threshold, not AA). Describe real differences between the screenshots, do not guess.

Return only this JSON:

{
  "responsive_correct": true,
  "issues": [
    {
      "viewport": "mobile | desktop-light | desktop-dark",
      "severity": "critical | major | minor",
      "observation": "<what is visible>",
      "classification": "responsive | bug",
      "fix": "<specific CSS fix when it is a bug>"
    }
  ]
}

- responsive: collapse/hamburger/reflow is expected behavior; do NOT report it as a bug.
- bug: horizontal scroll on mobile, overlapping elements, clipped content, touch target too small.
```

### Dark Mode Audit (pre-check WCAG)

```
Task: Dark Mode Audit (S02 L01)
You have 2 screenshots of the same page: light mode and dark mode.
[paste the screenshots here: light mode and dark mode of the same page]

How to read this: audit dark mode against WCAG AA, comparing it with the light variant. You
ESTIMATE contrast visually, this is a pre-check, NOT a proof of compliance (for that use axe-core /
Lighthouse / dedicated tools). Describe real differences between the screenshots.

Return only this JSON:

{
  "wcag_aa_pass": true,
  "violations": [
    {
      "element": "<element description>",
      "ratio_required": "4.5:1 | 3:1",
      "ratio_estimated": "<estimate>",
      "severity": "critical | major | minor",
      "fix": "<e.g. lighter text shade>"
    }
  ]
}

Check: text contrast (≥ 4.5:1 normal, ≥ 3:1 large/UI), visibility of icons/logo on a dark background,
link distinguishability (not by color alone, underline/weight), visible focus rings on a dark background.

⚠️ Contrast values are ESTIMATED by a vision model, do NOT use the output as proof of WCAG compliance.
```

**Zasada kontekstu:** podaj modelowi *fakt o widoku* (jaki viewport, jaki wzorzec
responsywny), a nie gotowy werdykt („to bug”). Model ma sam ocenić, czy collapse
jest zamierzony.

**Granica:** kontrast WCAG szacowany przez vision AI to **pre-check, nie dowód
zgodności**. Model patrzy na obrazek i zgaduje proporcję kontrastu, twardy audyt
zrób narzędziem liczącym realne wartości kolorów (`@axe-core/playwright`,
Lighthouse). Werdykt o responsive też zatwierdzasz sam, po zerknięciu na `diff`.
