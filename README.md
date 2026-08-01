# AI Testers: Visual Regression Testing z Playwright

Repozytorium z kodem kursu: aplikacja testowa Pixelarium, testy wizualne wszystkich sesji,
prompty AI oraz konfiguracja Visual Regression Trackera. Opisy lekcji, agendy i prezentacje
znajdziesz na platformie kursu, tutaj jest wyłącznie to, co uruchamiasz.

## Wymagania

- Node.js 20 lub nowszy
- Docker Desktop albo Docker Engine 24+ z Compose v2 (dopiero na Dzień 4, do Visual Regression Trackera)

## Instalacja

```bash
git clone https://github.com/AI-Testers-pl/ait2vrt1-visualregresiontesting
cd ait2vrt1-visualregresiontesting

npm install                # Playwright Test
npx playwright install     # przeglądarki
npm --prefix app install   # aplikacja Pixelarium
```

## Uruchomienie testów

Aplikacja podnosi się automatycznie razem z testami (sekcja `webServer` w `playwright.config.ts`),
więc wystarczy:

```bash
npm run test:vrt           # wszystkie testy wizualne
npm run test:vrt:update    # regeneracja baseline'ów
npm run test:vrt:report    # raport HTML
```

Baseline'y (`tests/__screenshots__/`) są w `.gitignore`, generujesz je u siebie przy pierwszym
uruchomieniu. Konfiguracja ma trzy projekty: `desktop-light`, `mobile-light` i `desktop-dark`.

Samą aplikację odpalisz osobno, bez testów:

```bash
npm run dev                # http://localhost:5173
```

## Struktura

```
app/                       aplikacja Pixelarium (React + Vite), obiekt testów
tests/
  fixtures/                factory z deterministycznymi danymi, mock handlers
  pages/                   Page Objecty
  visual/s01..s03/         specki wizualne per sesja
  visual/ai/               prompty wczytywane przez testy demonstracyjne
  visual/homework/         miejsce na Twoje rozwiązania
S01/ ... S04/              per lekcja: PROMPT.md oraz kod ćwiczeń i rozwiązań
.claude/skills/            skille VRT budowane w S03L03
CLAUDE.md                  pamięć agenta: twarde reguły VRT
PLAYWRIGHT_GUIDELINES.md   pełne konwencje: nazewnictwo, baseline'y, progi, maskowanie
docker-compose.yml         Visual Regression Tracker (S04L01)
vrt.json                   konfiguracja agenta trackera
```

Aplikacja i konfiguracja są wspólne dla całego kursu. Testy poszczególnych sesji leżą obok
siebie w `tests/visual/` i nie kolidują ze sobą, a nazwa pliku wskazuje lekcję, na przykład
`tests/visual/s01/s01-l02-basics.visual.spec.ts`. Katalogi `S01/` do `S04/` zawierają prompty
AI z lekcji oraz kod zadań domowych i modelowych rozwiązań.

## Visual Regression Tracker (Dzień 4)

```bash
docker compose up -d
```

Dashboard stoi na `http://localhost:8080`, API na `http://localhost:4200`, Swagger pod `/api`.
Domyślne dane logowania to `admin@vrt.com` / `123456`, zmień je po pierwszym wejściu.
Klucz API skopiuj z ustawień projektu w dashboardzie do `vrt.json`. Agenta doinstalujesz
w trakcie lekcji:

```bash
npm i -D @visual-regression-tracker/agent-playwright
```

Zatrzymanie: `docker compose down`, a z flagą `-v` czyści też bazę i resetuje baseline'y.

## Skille VRT

W `.claude/skills/` leżą cztery skille zbudowane w S03L03, gotowe do użycia w Claude Code:

- `vrt-spec`: pisze jeden deterministyczny `*.visual.spec.ts`
- `vrt-pom`: pisze jedną klasę Page Object
- `vrt-factory`: generuje deterministyczne dane testowe
- `vrt-i18n`: dokłada oś językowa en/pl/de do istniejącej specki

## Konwencje

Twarde reguły VRT (zegar przed `goto`, maska zamiast `display: none`, priorytet locatorów,
baseline w osobnym commicie) opisuje `CLAUDE.md`, który agent wczytuje automatycznie.
Pełne konwencje zespołowe: `PLAYWRIGHT_GUIDELINES.md`.
