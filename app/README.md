# Pixelarium – Digital Art Gallery

Aplikacja demo do nauki Visual Regression Testing (VRT) z Playwright.

## Uruchomienie

```bash
cd app
npm install
npm run dev
```

Aplikacja startuje na `http://localhost:5173`

## Strony

| Strona | URL | Opis |
|--------|-----|------|
| Home | `/` | Sekcja hero z animowanym gradientem, licznik odwiedzin na żywo, odliczanie do wystawy, wyróżnione dzieła, karuzela opinii |
| Gallery | `/gallery` | 12 dzieł, filtry kategorii, sortowanie, wyszukiwarka, paginacja, przyciski polubień |
| Artwork Detail | `/artwork/:id` | Szczegóły dzieła, cena w 3 walutach, krokowy wybór ilości (stepper), powiązane dzieła |
| Cart | `/cart` | Koszyk z formularzem zamówienia, stan pusty/wypełniony, znacznik czasu „ostatnia aktualizacja" |
| Login | `/login` | Formularz logowania z alertem błędu, logowanie przez serwisy społecznościowe (Google, GitHub) |
| About | `/about` | Historia, zespół, formularz kontaktowy, animowany licznik, mapa |

## Funkcje kluczowe dla VRT

### Elementy dynamiczne (do maskowania / zamrażania zegara)
- `data-testid="live-counter"` – licznik odwiedzin, aktualizacja co 3s
- `data-testid="countdown-timer"` – odliczanie do wystawy, tyka co 1s
- `data-testid="testimonial-timestamp"` – „2h temu" przy opiniach
- `data-testid="last-updated"` – znacznik czasu w koszyku
- `data-testid="loading-spinner"` – wskaźnik ładowania przy filtrach galerii

### Animacje (do wyłączania: `animations: 'disabled'`)
- Gradient sekcji hero w CSS (`@keyframes gradient-shift`)
- Karuzela opinii (automatyczna rotacja co 5s)
- Efekty po najechaniu na karty (`transition: transform`)
- Powiększenie obrazu na stronie szczegółów (`transform: scale(1.05)`)
- Animowany licznik na stronie About (zliczanie przy przewijaniu)
- Pulsowanie przycisku polubienia (`@keyframes pulse-once`)
- Wsuwane menu mobilne (`@keyframes slide-in`)

### Responsywność (3 viewporty)
- Mobile: 375px – 1 kolumna, menu hamburger
- Tablet: 768px – 2 kolumny, pełna nawigacja
- Desktop: 1920px – 3–4 kolumny, przestronny układ

### Tryb ciemny
- Przełącznik w nagłówku (`aria-pressed`)
- `prefers-color-scheme` przez Tailwind `darkMode: 'class'`
- Playwright: `colorScheme: 'dark'` w projekcie

### ARIA / dostępność (do `toMatchAriaSnapshot()`)
- Semantyczny HTML: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`
- Formularze z widocznymi `<label>` (logowanie, zamówienie, kontakt)
- Przyciski polubień: `aria-pressed="true|false"`
- Plakietka koszyka: `aria-live="polite"`
- Komunikaty błędów: `role="alert"`
- Menu mobilne: `role="dialog"`, `aria-modal="true"`

### i18n (3 języki)
- English (domyślny), Polski, Deutsch
- Przełącznik języka w nagłówku z `aria-current`
- Ceny formatowane wg lokalizacji: `$120.00` / `480,00 zł` / `120,00 EUR`

## Mock API

Serwer deweloperski Vite udostępnia endpointy JSON do przechwytywania przez `page.route()`:

```
GET /api/artworks        — lista 12 dzieł
GET /api/artworks/:id    — pojedyncze dzieło
GET /api/artists         — lista 4 artystów
GET /api/testimonials    — lista 4 opinii
```

## Mapowanie stron na sesje kursu

| Sesja | Temat | Strony / elementy |
|-------|-------|-------------------|
| S01 L01 | BackstopJS | Homepage hero, Gallery grid |
| S01 L02 | `toHaveScreenshot()` | Homepage full-page, ArtworkCard element |
| S01 L03 | Stabilizacja + maskowanie | LiveCounter, CountdownTimer, carousel, spinner, caret |
| S01 L04 | Responsywność + tryb ciemny | Wszystkie strony × 3 viewporty + dark |
| S02 L01 | `toMatchAriaSnapshot()` | LoginPage form, CartPage checkout, Header nav |
| S02 L02 | Docker + CI | Pełny zestaw testów w kontenerze |
| S03 | AI + VRT | Gallery/Detail visual changes, Percy |
| S04 | VRT_GUIDE.md + Skill | Wszystkie strony jako referencja |
| S05 | Capstone | Pełny przepływ |

## Tech stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS 3 (`darkMode: 'class'`)
- react-router-dom 7
- react-i18next + i18next
- Brak backendu – dane z JSON, middleware Vite
- Zastępcze grafiki SVG (deterministyczne renderowanie)
